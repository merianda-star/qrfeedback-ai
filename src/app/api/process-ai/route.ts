import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PROCESS_LIMITS: Record<string, number> = { pro: 1000, business: 5000 }

async function checkAndRecordProcessUsage(userId: string, plan: string) {
  const limit = PROCESS_LIMITS[plan]
  if (!limit) return { allowed: false, used: 0, limit: 0 }
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const { count } = await supabase
    .from('ai_usage').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).eq('usage_type', 'process').gte('used_at', startOfMonth)
  const used = count || 0
  if (used >= limit) return { allowed: false, used, limit }
  await supabase.from('ai_usage').insert({ user_id: userId, usage_type: 'process' })
  return { allowed: true, used: used + 1, limit }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { response_id, form_id, rating, answers } = body

    if (!rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (rating >= 4) return NextResponse.json({ skipped: true })

    let resolvedId = response_id
    if (!resolvedId && form_id) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data, error } = await supabase
        .from('responses').select('id').eq('form_id', form_id)
        .eq('ai_processed', false).eq('rating', rating)
        .order('submitted_at', { ascending: false }).limit(1).single()
      if (error || !data) return NextResponse.json({ error: 'Response not found' }, { status: 404 })
      resolvedId = data.id
    }
    if (!resolvedId) return NextResponse.json({ error: 'Missing response_id or form_id' }, { status: 400 })

    // Find the user who owns this response
    let userId: string | null = null
    let userPlan = 'free'
    const { data: responseRow } = await supabase.from('responses').select('form_id').eq('id', resolvedId).single()
    if (responseRow?.form_id) {
      const { data: formRow } = await supabase.from('forms').select('user_id').eq('id', responseRow.form_id).single()
      if (formRow?.user_id) {
        userId = formRow.user_id
        const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', formRow.user_id).single()
        userPlan = profileRow?.plan || 'free'
      }
    }

    // Check + record monthly processing limit
    if (userId) {
      const { allowed, used, limit } = await checkAndRecordProcessUsage(userId, userPlan)
      if (!allowed) {
        console.log(`process-ai limit reached: ${userId} ${used}/${limit} plan:${userPlan}`)
        await supabase.from('responses').update({
          ai_processed: true, ai_category: 'other',
          ai_summary: 'Monthly AI processing limit reached.',
          ai_suggested_reply: '', ai_sentiment_score: -0.5,
        }).eq('id', resolvedId)
        return NextResponse.json({ error: 'Monthly AI processing limit reached', limit_reached: true }, { status: 429 })
      }
    }

    const answersText = Object.entries(answers || {})
      .map(([k, v]) => `Q${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 400, temperature: 0.4,
      messages: [
        { role: 'system', content: 'You are an AI that analyzes customer feedback for businesses. Always respond with valid JSON only, no markdown, no explanation.' },
        { role: 'user', content: `Analyze this customer feedback (rating: ${rating}/5 stars):\n\n${answersText}\n\nReturn this exact JSON structure:\n{\n  "sentiment_score": <number between -1.0 and 1.0>,\n  "category": <one of: "food" | "service" | "cleanliness" | "pricing" | "waiting" | "other">,\n  "summary": <one sentence summary of the complaint>,\n  "suggested_reply": <professional, empathetic owner reply under 60 words>\n}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(raw) } catch { parsed = { summary: raw, category: 'other', sentiment_score: -0.5, suggested_reply: '' } }

    const { error } = await supabase.from('responses').update({
      ai_sentiment_score: parsed.sentiment_score ?? -0.5,
      ai_category: parsed.category ?? 'other',
      ai_summary: parsed.summary ?? '',
      ai_suggested_reply: parsed.suggested_reply ?? '',
      ai_processed: true,
    }).eq('id', resolvedId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, category: parsed.category })
  } catch (err: any) {
    console.error('AI processing error:', err?.message)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}