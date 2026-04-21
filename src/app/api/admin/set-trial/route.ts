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

  const { userId, plan } = await req.json()
  if (!userId || !plan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!['free', 'pro', 'business'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Changing plan via dropdown = direct upgrade/downgrade, not a trial
  // Always clear trial_ends_at so no trial badge appears
  const { error } = await adminSupabase
    .from('profiles')
    .update({ plan, trial_ends_at: null })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}