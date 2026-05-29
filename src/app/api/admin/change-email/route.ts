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

  const { userId, newEmail } = await req.json()
  if (!userId || !newEmail) return NextResponse.json({ error: 'userId and newEmail are required' }, { status: 400 })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

  const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
    email: newEmail, email_confirm: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await adminSupabase.from('profiles').update({ email: newEmail }).eq('id', userId)

  const { error: signOutError } = await adminSupabase.auth.admin.signOut(userId, 'others')
  if (signOutError) console.warn('Could not force sign out:', signOutError.message)

  try {
    const { data: { user: adminUser } } = await adminSupabase.auth.getUser()
    const supabase = await createServerClient()
    const { data: { user: currentAdmin } } = await supabase.auth.getUser()
    await adminSupabase.from('audit_logs').insert({
      admin_id: currentAdmin?.id, admin_email: currentAdmin?.email,
      action: 'email_changed', target_user_id: userId,
      target_email: newEmail,
      details: { new_email: newEmail }
    })
  } catch {}

  return NextResponse.json({ success: true, message: `Email updated to ${newEmail}.` })
}