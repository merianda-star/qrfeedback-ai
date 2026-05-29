import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAdminUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await adminSupabase
      .from('profiles').select('is_admin, is_master_admin, full_name').eq('id', user.id).single()
    if (!profile?.is_admin) return null
    return { id: user.id, email: user.email!, isMasterAdmin: !!profile.is_master_admin }
  } catch { return null }
}

// GET — fetch audit logs (master admin only)
export async function GET(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const action = searchParams.get('action') || null
  const adminId = searchParams.get('admin_id') || null

  let query = adminSupabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (action) query = query.eq('action', action)
  if (adminId) query = query.eq('admin_id', adminId)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ logs: data, total: count })
}

// POST — record a new audit log entry
export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, target_user_id, target_email, details } = await req.json()
  if (!action) return NextResponse.json({ error: 'action is required' }, { status: 400 })

  const { error } = await adminSupabase.from('audit_logs').insert({
    admin_id: admin.id,
    admin_email: admin.email,
    action,
    target_user_id: target_user_id || null,
    target_email: target_email || null,
    details: details || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}