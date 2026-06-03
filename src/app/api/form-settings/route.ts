import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RESPONSE_LIMITS } from '@/lib/plan-limits'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const formId = req.nextUrl.searchParams.get('form_id')
  if (!formId) return NextResponse.json({ error: 'Missing form_id' }, { status: 400 })

  const { data: form } = await adminSupabase
    .from('forms').select('user_id').eq('id', formId).single()
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('plan, trial_ends_at, business_name, business_type, smart_routing, ai_email_alerts, notify_on_positive, alert_email, email')
    .eq('id', form.user_id)
    .single()

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
  const effectivePlan = profile?.plan || (isTrialActive ? 'pro' : 'free')
  const limit = RESPONSE_LIMITS[effectivePlan] ?? RESPONSE_LIMITS['free']

  // Check monthly response limit before the customer can start filling the form
  let limit_reached = false
  if (limit !== null) {
    const now = new Date()
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

    // Count responses across ALL forms owned by this user this month
    const { data: userForms } = await adminSupabase
      .from('forms').select('id').eq('user_id', form.user_id)

    const formIds = userForms?.map(f => f.id) || []

    const { count: monthlyCount } = await adminSupabase
      .from('responses')
      .select('id', { count: 'exact', head: true })
      .in('form_id', formIds)
      .gte('submitted_at', startOfMonth)

    if ((monthlyCount || 0) >= limit) {
      limit_reached = true
    }
  }

  return NextResponse.json({
    plan:               effectivePlan,
    limit_reached,
    business_name:      profile?.business_name     || '',
    business_type:      profile?.business_type     || 'other',
    smart_routing:      profile?.smart_routing     ?? true,
    ai_email_alerts:    profile?.ai_email_alerts   ?? true,
    notify_on_positive: profile?.notify_on_positive ?? false,
    alert_email:        profile?.alert_email       || profile?.email || '',
  })
}