import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const token = req.cookies.get('qrf_admin_session')?.value
    if (!token) return false
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
    await jwtVerify(token, secret)
    return true
  } catch { return false }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  // Get all form IDs for cascade delete
  const { data: forms } = await adminSupabase.from('forms').select('id').eq('user_id', userId)
  const formIds = forms?.map(f => f.id) || []

  if (formIds.length > 0) {
    await adminSupabase.from('responses').delete().in('form_id', formIds)
    await adminSupabase.from('weekly_insights').delete().in('form_id', formIds)
  }

  await adminSupabase.from('imported_responses').delete().eq('user_id', userId)
  await adminSupabase.from('forms').delete().eq('user_id', userId)
  await adminSupabase.from('profiles').delete().eq('id', userId)

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}