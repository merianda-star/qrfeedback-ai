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

  return NextResponse.json({ success: true, message: `Email updated to ${newEmail}.` })
}