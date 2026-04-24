import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LIMITS = {
  process: { pro: 1000, business: 5000 },
  reply:   { pro: 20,   business: 50   },
} as const

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await adminSupabase
    .from('profiles').select('plan').eq('id', user.id).single()
  const plan = profile?.plan || 'free'

  if (plan === 'free') {
    return NextResponse.json({
      plan,
      process: { used: 0, limit: 0, remaining: 0 },
      reply:   { used: 0, limit: 0, remaining: 0 },
    })
  }

  const planKey = plan === 'business' ? 'business' : 'pro'
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()

  const { count: processUsed } = await adminSupabase
    .from('ai_usage').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('usage_type', 'process').gte('used_at', startOfMonth)

  const { count: replyUsed } = await adminSupabase
    .from('ai_usage').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('usage_type', 'reply').gte('used_at', startOfDay)

  return NextResponse.json({
    plan,
    process: {
      used: processUsed || 0,
      limit: LIMITS.process[planKey],
      remaining: Math.max(0, LIMITS.process[planKey] - (processUsed || 0)),
    },
    reply: {
      used: replyUsed || 0,
      limit: LIMITS.reply[planKey],
      remaining: Math.max(0, LIMITS.reply[planKey] - (replyUsed || 0)),
    },
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = await req.json()
  if (type !== 'process' && type !== 'reply') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const { error } = await adminSupabase
    .from('ai_usage').insert({ user_id: user.id, usage_type: type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
