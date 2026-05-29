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

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  // Block deletion of master admin accounts
  const { data: targetProfile } = await adminSupabase
    .from('profiles').select('is_master_admin').eq('id', userId).single()
  if (targetProfile?.is_master_admin) {
    return NextResponse.json({ error: 'Master admin accounts cannot be deleted.' }, { status: 403 })
  }

  // Also block admins from deleting other admins — only master admins can do that
  const supabase = await createServerClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: currentProfile } = await adminSupabase
    .from('profiles').select('is_master_admin').eq('id', currentUser!.id).single()
  
  const { data: targetAdminCheck } = await adminSupabase
    .from('profiles').select('is_admin').eq('id', userId).single()
  if (targetAdminCheck?.is_admin && !currentProfile?.is_master_admin) {
    return NextResponse.json({ error: 'Only master admins can delete admin accounts.' }, { status: 403 })
  }

  const { data: forms } = await adminSupabase.from('forms').select('id').eq('user_id', userId)
  const formIds = forms?.map((f: any) => f.id) || []

  if (formIds.length > 0) {
    await adminSupabase.from('responses').delete().in('form_id', formIds)
    await adminSupabase.from('weekly_insights').delete().in('form_id', formIds)
  }

  await adminSupabase.from('imported_responses').delete().eq('user_id', userId)
  await adminSupabase.from('forms').delete().eq('user_id', userId)
  await adminSupabase.from('profiles').delete().eq('id', userId)

  // Capture email before deletion
  const { data: delProfile } = await adminSupabase.from('profiles').select('email').eq('id', userId).single()
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const supabase = await createServerClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    await adminSupabase.from('audit_logs').insert({
      admin_id: adminUser?.id, admin_email: adminUser?.email,
      action: 'user_deleted', target_user_id: userId,
      target_email: delProfile?.email,
      details: {}
    })
  } catch {}

  return NextResponse.json({ success: true })
}