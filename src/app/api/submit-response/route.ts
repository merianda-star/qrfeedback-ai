import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RESPONSE_LIMITS } from '@/lib/plan-limits'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { form_id, user_id, rating, answers, ai_processed, customer_email, response_id } = body

    if (!form_id || !user_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the form owner's plan
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('plan, trial_ends_at')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Could not verify plan' }, { status: 500 })
    }

    // Determine effective plan (treat active trial as paid)
    const isTrialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
    const effectivePlan = profile.plan || (isTrialActive ? 'pro' : 'free')
    const limit = RESPONSE_LIMITS[effectivePlan] ?? RESPONSE_LIMITS['free']

    // Check monthly response count if plan has a limit
    if (limit !== null) {
      const now = new Date()
      const startOfMonth = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), 1
      )).toISOString()

      // Count responses across ALL forms owned by this user this month
      const { data: userForms } = await adminSupabase
        .from('forms')
        .select('id')
        .eq('user_id', user_id)

      const formIds = userForms?.map(f => f.id) || []

      const { count: monthlyCount } = await adminSupabase
        .from('responses')
        .select('id', { count: 'exact', head: true })
        .in('form_id', formIds)
        .gte('submitted_at', startOfMonth)

      const used = monthlyCount || 0

      if (used >= limit) {
        // Auto-close all of this user's forms so future customers see
        // the neutral "form is closed" screen instead of filling the form
        await adminSupabase
          .from('forms')
          .update({ is_active: false })
          .eq('user_id', user_id)

        return NextResponse.json({
          error: 'Monthly response limit reached',
          closed: true,
          used,
          limit,
          plan: effectivePlan,
        }, { status: 429 })
      }
    }

    // Limit not reached — insert the response
    const { error: insertError } = await adminSupabase
      .from('responses')
      .insert({
        id: response_id || undefined,
        form_id,
        user_id,
        rating,
        answers,
        ai_processed: ai_processed ?? true,
        submitted_at: new Date().toISOString(),
        customer_email: customer_email || null,
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('submit-response error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}