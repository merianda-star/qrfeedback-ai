import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: profile } = await adminSupabase
      .from('profiles').select('is_admin').eq('id', user.id).single()
    return !!profile?.is_admin
  } catch { return false }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, days, reset } = await req.json()
  if (!userId || !days) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  let trialEndsAt: Date

  if (reset) {
    trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + days)
  } else {
    const { data: profile } = await adminSupabase
      .from('profiles').select('trial_ends_at').eq('id', userId).single()

    const base = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
      ? new Date(profile.trial_ends_at)
      : new Date()

    trialEndsAt = new Date(base)
    trialEndsAt.setDate(trialEndsAt.getDate() + days)
  }

  const { error } = await adminSupabase
    .from('profiles')
    .update({ plan: 'pro', trial_ends_at: trialEndsAt.toISOString() })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, trial_ends_at: trialEndsAt.toISOString() })
}