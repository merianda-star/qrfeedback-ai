import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'
import OpenAI from 'openai'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DIGEST_LIMITS: Record<string, number> = {
  pro: 2,
  business: 4,
}

function getCurrentMonday(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function POST(req: NextRequest) {
  let customStart: string | null = null
  let customEnd: string | null = null
  let tzOffset: number = 0

  try {
    const body = await req.json()
    customStart = body?.custom_start || null
    customEnd = body?.custom_end || null
    tzOffset = body?.tz_offset ?? 0
  } catch {}

  // ── Cron bypass — runs for all users, no limit check ──
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (authHeader === `Bearer ${cronSecret}` && cronSecret) {
    return await processAllUsers()
  }

  // ── Manual user request — check auth + plan + limit ──
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('business_name, alert_email, plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const limit = DIGEST_LIMITS[plan] ?? 0

  if (limit === 0) {
    return NextResponse.json({ error: 'Weekly digest is not available on the Free plan.' }, { status: 403 })
  }

  // Count manual digest generations this calendar month
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

  const { count } = await adminSupabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('usage_type', 'digest')
    .gte('used_at', monthStart)

  const used = count ?? 0

  if (used >= limit) {
    return NextResponse.json({
      error: `You've used all ${limit} custom digest generation${limit !== 1 ? 's' : ''} for this month.`,
      limit,
      used,
      limit_reached: true,
    }, { status: 429 })
  }

  const businessName = profile?.business_name || 'Your Business'
  const emailTo = profile?.alert_email || user.email || ''

  const result = await generateDigestForUser(
    user.id, user.email || '', businessName, emailTo,
    customStart, customEnd, tzOffset
  )

  // Record the usage if generation succeeded
  if ((result as any).success) {
    await adminSupabase.from('ai_usage').insert({
      user_id: user.id,
      usage_type: 'digest',
    })
  }

  // Return usage info alongside result so UI can update
  return NextResponse.json({
    ...result,
    used: used + 1,
    limit,
    remaining: Math.max(0, limit - used - 1),
  })
}

async function processAllUsers() {
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, email, business_name, alert_email, weekly_digest, plan')
    .eq('weekly_digest', true)
    .in('plan', ['pro', 'business'])

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  const results = []
  for (const p of profiles) {
    const result = await generateDigestForUser(
      p.id, p.email, p.business_name || 'Your Business',
      p.alert_email || p.email, null, null
    )
    results.push(result)
  }

  return NextResponse.json({ processed: results.length, results })
}

async function generateDigestForUser(
  userId: string,
  userEmail: string,
  businessName: string,
  emailTo: string,
  customStart: string | null,
  customEnd: string | null,
  tzOffset: number = 0
) {
  let weekStart: Date
  let weekEnd: Date

  if (customStart && customEnd) {
    const offsetMs = (tzOffset ?? 0) * 60 * 1000
    const [sy, sm, sd] = customStart.split('-').map(Number)
    const [ey, em, ed] = customEnd.split('-').map(Number)
    weekStart = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0) + offsetMs)
    weekEnd = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999) + offsetMs)
  } else {
    weekStart = getCurrentMonday()
    weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
  }

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekEnd = new Date(weekStart)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1)
  prevWeekEnd.setHours(23, 59, 59, 999)

  const { data: forms } = await adminSupabase
    .from('forms').select('id, title').eq('user_id', userId)
  if (!forms || forms.length === 0) return { success: false, reason: 'No forms found' }
  const formIds = forms.map(f => f.id)

  const { data: responses } = await adminSupabase
    .from('responses')
    .select('id, rating, answers, ai_category, ai_summary, submitted_at, form_id')
    .in('form_id', formIds)
    .gte('submitted_at', weekStart.toISOString())
    .lte('submitted_at', weekEnd.toISOString())

  const { data: prevResponses } = await adminSupabase
    .from('responses').select('rating').in('form_id', formIds)
    .gte('submitted_at', prevWeekStart.toISOString())
    .lte('submitted_at', prevWeekEnd.toISOString())

  const totalResponses = responses?.length || 0
  const positiveCount = responses?.filter(r => r.rating >= 4).length || 0
  const negativeCount = responses?.filter(r => r.rating <= 3).length || 0
  const avgRating = totalResponses > 0
    ? responses!.reduce((s, r) => s + r.rating, 0) / totalResponses
    : 0
  const prevAvg = prevResponses && prevResponses.length > 0
    ? prevResponses.reduce((s, r) => s + r.rating, 0) / prevResponses.length
    : 0
  const sentimentTrend = totalResponses === 0
    ? 'no_data'
    : prevAvg === 0
    ? 'stable'
    : avgRating > prevAvg + 0.2
    ? 'improving'
    : avgRating < prevAvg - 0.2
    ? 'declining'
    : 'stable'

  const categoryCounts: Record<string, number> = {}
  responses?.filter(r => r.rating <= 3 && r.ai_category).forEach(r => {
    categoryCounts[r.ai_category] = (categoryCounts[r.ai_category] || 0) + 1
  })
  const topIssues = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([category, count]) => ({ category, count }))

  const positiveTexts = responses?.filter(r => r.rating >= 4)
    .map(r => r.ai_summary || '').filter(Boolean).slice(0, 10).join('\n') || ''
  const negativeTexts = responses?.filter(r => r.rating <= 3)
    .map(r => r.ai_summary || '').filter(Boolean).slice(0, 10).join('\n') || ''

  let aiSummary = totalResponses === 0
    ? 'No responses received this period.'
    : `This period you received ${totalResponses} responses with an average rating of ${avgRating.toFixed(1)}/5.`
  let aiActionItems = ''
  let topPositives: string[] = []
  let areasToImprove: string[] = []

  if (totalResponses > 0) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', max_tokens: 600, temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: 'You analyze restaurant feedback and give practical owner advice. Always return valid JSON only, no markdown.',
          },
          {
            role: 'user',
            content: `Analyze weekly feedback for "${businessName}".\nResponses: ${totalResponses} (${positiveCount} positive, ${negativeCount} negative)\nAvg rating: ${avgRating.toFixed(1)}/5\nTrend: ${sentimentTrend}\nTop issues: ${topIssues.map(i => `${i.category}(${i.count})`).join(', ') || 'none'}\nPositive summaries:\n${positiveTexts || 'None'}\nNegative summaries:\n${negativeTexts || 'None'}\n\nReturn ONLY valid JSON:\n{"summary":"<2-3 sentence conversational overview for the owner>","top_positives":["<thing 1>","<thing 2>","<thing 3>"],"areas_to_improve":["<improvement 1>","<improvement 2>","<improvement 3>"],"action_items":"<2-3 specific things the owner should do this week>"}`,
          },
        ],
      })
      const raw = completion.choices[0]?.message?.content?.trim() || '{}'
      const parsed = JSON.parse(raw)
      aiSummary = parsed.summary || aiSummary
      aiActionItems = parsed.action_items || ''
      topPositives = parsed.top_positives || []
      areasToImprove = parsed.areas_to_improve || []
    } catch (err) {
      console.error('AI digest error:', err)
    }
  }

  function localDateStr(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const weekStartStr = localDateStr(weekStart)
  const weekEndStr = localDateStr(weekEnd)

  const { data: digest, error } = await adminSupabase
    .from('weekly_digests').upsert({
      user_id: userId,
      week_start: weekStartStr,
      week_end: weekEndStr,
      total_responses: totalResponses,
      positive_count: positiveCount,
      negative_count: negativeCount,
      avg_rating: parseFloat(avgRating.toFixed(2)),
      top_issues: topIssues,
      top_positives: topPositives,
      areas_to_improve: areasToImprove,
      sentiment_trend: sentimentTrend,
      ai_summary: aiSummary,
      ai_action_items: aiActionItems,
    }, { onConflict: 'user_id,week_start' })
    .select('id').single()

  if (error) return { success: false, reason: error.message }

  if (emailTo && totalResponses > 0) {
    const weekLabel = `${weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    const trendIcon = sentimentTrend === 'improving' ? '📈' : sentimentTrend === 'declining' ? '📉' : '➡️'
    const trendText = sentimentTrend === 'improving' ? 'Improving' : sentimentTrend === 'declining' ? 'Declining' : 'Stable'
    const catLabels: Record<string, string> = {
      food: '🍽 Food', service: '💼 Service', cleanliness: '🧹 Cleanliness',
      pricing: '💰 Pricing', waiting: '⏱ Wait Time', other: '◈ Other',
    }
    const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdf6f4;"><div style="text-align:center;margin-bottom:28px;"><div style="font-size:1.2rem;color:#2a1f1d;">QRFeedback<span style="color:#b05c52;">.ai</span></div><div style="width:40px;height:1px;background:#c4896a;margin:8px auto 0;"></div></div><div style="background:#fff;border-radius:14px;border:1px solid #e8d5cf;padding:28px;margin-bottom:16px;"><div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#b09490;margin-bottom:6px;">Weekly Digest</div><div style="font-size:1.4rem;color:#2a1f1d;margin-bottom:4px;">${businessName}</div><div style="font-size:0.78rem;color:#b09490;">${weekLabel}</div></div><div style="display:flex;gap:10px;margin-bottom:16px;">${[{val:totalResponses,lbl:'Reviews'},{val:avgRating.toFixed(1)+'★',lbl:'Avg Rating'},{val:positiveCount,lbl:'Positive'},{val:negativeCount,lbl:'Negative'}].map(s=>`<div style="flex:1;background:#fff;border:1px solid #e8d5cf;border-radius:10px;padding:14px 10px;text-align:center;"><div style="font-size:1.4rem;color:#2a1f1d;">${s.val}</div><div style="font-size:0.6rem;color:#b09490;text-transform:uppercase;">${s.lbl}</div></div>`).join('')}</div><div style="background:#fff;border:1px solid #e8d5cf;border-radius:10px;padding:12px 16px;margin-bottom:16px;">${trendIcon} <strong style="color:#2a1f1d;">${trendText}</strong> <span style="color:#b09490;font-size:0.78rem;">vs last week</span></div>${aiSummary?`<div style="background:#fff;border:1px solid #e8d5cf;border-radius:10px;padding:16px;margin-bottom:16px;"><div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#b05c52;margin-bottom:8px;">✦ AI Summary</div><div style="font-size:0.82rem;color:#2a1f1d;line-height:1.7;">${aiSummary}</div></div>`:''} ${topPositives.length>0?`<div style="background:#edf4ef;border:1px solid rgba(74,122,90,0.2);border-radius:10px;padding:16px;margin-bottom:16px;"><div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#4a7a5a;margin-bottom:8px;">😊 What Customers Loved</div>${topPositives.map(p=>`<div style="font-size:0.78rem;color:#2a5a3a;padding:3px 0;">✓ ${p}</div>`).join('')}</div>`:''} ${areasToImprove.length>0?`<div style="background:#fef5f4;border:1px solid rgba(176,92,82,0.2);border-radius:10px;padding:16px;margin-bottom:16px;"><div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#b05c52;margin-bottom:8px;">⚠ Areas to Improve</div>${areasToImprove.map(a=>`<div style="font-size:0.78rem;color:#8c3d34;padding:3px 0;">• ${a}</div>`).join('')}</div>`:''} ${aiActionItems?`<div style="background:#fef9ec;border:1px solid #f0d98a;border-radius:10px;padding:16px;margin-bottom:16px;"><div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#a07820;margin-bottom:8px;">🎯 Action Items This Week</div><div style="font-size:0.78rem;color:#7a6020;line-height:1.7;">${aiActionItems}</div></div>`:''} ${topIssues.length>0?`<div style="background:#fff;border:1px solid #e8d5cf;border-radius:10px;padding:16px;margin-bottom:16px;"><div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#b09490;margin-bottom:8px;">Top Complaints</div>${topIssues.map(i=>`<div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:4px 0;border-bottom:1px solid #f5ede9;"><span>${catLabels[i.category]||i.category}</span><span style="color:#b05c52;font-weight:700;">${i.count}</span></div>`).join('')}</div>`:''}<div style="text-align:center;margin-top:8px;"><a href="${process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000'}/dashboard/digest" style="display:inline-block;background:#b05c52;color:#fff;padding:12px 24px;border-radius:9px;font-family:sans-serif;font-size:0.85rem;font-weight:600;text-decoration:none;">View Full Digest →</a></div><div style="text-align:center;margin-top:20px;"><p style="font-family:sans-serif;font-size:0.68rem;color:#c4a09a;margin:0;">© 2026 Startekk LLC · QRFeedback.ai</p></div></div>`
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'QRFeedback.ai <info@qrfeedback.ai>',
          to: [emailTo],
          subject: `Weekly Digest: ${businessName} — ${weekLabel}`,
          html,
        }),
      })
    } catch (err) {
      console.error('Digest email error:', err)
    }
  }

  return {
    success: true,
    digestId: digest?.id,
    totalResponses,
    avgRating: parseFloat(avgRating.toFixed(2)),
    sentimentTrend,
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
  }
}