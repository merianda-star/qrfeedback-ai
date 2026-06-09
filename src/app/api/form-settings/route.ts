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

  // Get the form's owner
  const { data: form } = await adminSupabase
    .from('forms').select('user_id').eq('id', formId).single()
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  // Get owner profile — only select columns guaranteed to exist
  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('plan, trial_ends_at, business_name, business_type, email')
    .eq('id', form.user_id)
    .single()

  if (profileError) {
    console.error('form-settings: profile error', profileError.message)
  }

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
  const effectivePlan = profile?.plan || (isTrialActive ? 'pro' : 'free')
  const limit = RESPONSE_LIMITS[effectivePlan] ?? RESPONSE_LIMITS['free']!

  // Check monthly response limit — skip entirely for unlimited plans
  let limit_reached = false
  if (limit !== null) {
    const now = new Date()
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

    const { data: userForms } = await adminSupabase
      .from('forms').select('id').eq('user_id', form.user_id)
    const formIds = (userForms || []).map((f: any) => f.id)

    if (formIds.length > 0) {
      const { count: monthlyCount } = await adminSupabase
        .from('responses')
        .select('id', { count: 'exact', head: true })
        .in('form_id', formIds)
        .gte('submitted_at', startOfMonth)

      if ((monthlyCount || 0) >= limit) limit_reached = true
    }
  }

  return NextResponse.json({
    plan: effectivePlan,
    limit_reached,
    business_name: profile?.business_name || '',
    business_type: profile?.business_type || 'other',
    // safe defaults for columns that may not exist in all projects
    smart_routing: true,
    ai_email_alerts: true,
    notify_on_positive: false,
    alert_email: profile?.email || '',
  })
}