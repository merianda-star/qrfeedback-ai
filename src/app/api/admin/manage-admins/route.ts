import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin, is_master_admin')
      .eq('id', user.id)
      .single()
    return { user, profile }
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const current = await getCurrentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only master admin can manage admin privileges
  if (!current.profile?.is_master_admin) {
    return NextResponse.json({ error: 'Only the master admin can manage admin privileges' }, { status: 403 })
  }

  const { action, userId } = await req.json()

  if (!action || !userId) {
    return NextResponse.json({ error: 'Missing action or userId' }, { status: 400 })
  }

  if (action !== 'promote' && action !== 'revoke') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Fetch target user profile
  const { data: target } = await adminSupabase
    .from('profiles')
    .select('id, email, full_name, is_admin, is_master_admin')
    .eq('id', userId)
    .single()

  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Cannot revoke master admin under any circumstances
  if (action === 'revoke' && target.is_master_admin) {
    return NextResponse.json({ error: 'The master admin cannot be demoted' }, { status: 403 })
  }

  // Cannot revoke yourself
  if (action === 'revoke' && userId === current.user.id) {
    return NextResponse.json({ error: 'You cannot revoke your own admin access' }, { status: 403 })
  }

  const updates = action === 'promote'
    ? { is_admin: true }
    : { is_admin: false }

  const { error } = await adminSupabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    action,
    user: { id: target.id, email: target.email, full_name: target.full_name },
  })
}