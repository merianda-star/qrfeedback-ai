import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Called on dashboard load to check if trial has expired
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // If on pro or business trial and trial has expired, downgrade to free
  if (
    (profile.plan === 'pro' || profile.plan === 'business') &&
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at) < new Date()
  ) {
    await adminSupabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', user.id)

    return NextResponse.json({ plan: 'free', trial_expired: true })
  }

  return NextResponse.json({
    plan: profile.plan,
    trial_ends_at: profile.trial_ends_at,
    trial_expired: false,
  })
}