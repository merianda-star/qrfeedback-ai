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

  const { userId, trial_ends_at, plan } = await req.json()
  if (!userId || !trial_ends_at || !plan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!['pro', 'business'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const { error } = await adminSupabase
    .from('profiles')
    .update({ plan, trial_ends_at })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const supabase = await createServerClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    const { data: tp } = await adminSupabase.from('profiles').select('email').eq('id', userId).single()
    await adminSupabase.from('audit_logs').insert({
      admin_id: adminUser?.id, admin_email: adminUser?.email,
      action: 'trial_set', target_user_id: userId,
      target_email: tp?.email,
      details: { plan, trial_ends_at }
    })
  } catch {}

  return NextResponse.json({ success: true })
}