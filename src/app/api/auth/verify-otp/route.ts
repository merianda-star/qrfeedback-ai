import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Verify the user is still authenticated (passed password login)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up the code
    const { data: otpRow, error: fetchError } = await adminSupabase
      .from('email_otp_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('email', email.toLowerCase().trim())
      .eq('code', code.trim())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRow) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark the code as used
    await adminSupabase
      .from('email_otp_codes')
      .update({ used: true })
      .eq('id', otpRow.id)

    // Clean up old codes for this user
    await adminSupabase
      .from('email_otp_codes')
      .delete()
      .eq('user_id', user.id)
      .lt('expires_at', new Date().toISOString())

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
