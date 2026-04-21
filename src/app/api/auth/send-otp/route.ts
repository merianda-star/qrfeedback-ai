import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    // Get the authenticated user (they just passed password login)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete any existing unused codes for this user to avoid confusion
    await adminSupabase
      .from('email_otp_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Generate a new 6-digit code, valid for 10 minutes
    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await adminSupabase
      .from('email_otp_codes')
      .insert({
        user_id: user.id,
        email: email.toLowerCase().trim(),
        code,
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error('OTP insert error:', insertError)
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
    }

    // Send the code via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'noreply@qrfeedback.ai',
        to: email,
        subject: `Your QRFeedback.ai verification code: ${code}`,
        html: `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fdf6f4; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-family: Georgia, serif; font-size: 1.2rem; color: #2a1f1d;">
                QRFeedback<span style="color: #b05c52;">.ai</span>
              </span>
            </div>
            <div style="background: #ffffff; border-radius: 10px; padding: 32px; border: 1px solid #e8d5cf; text-align: center;">
              <p style="font-size: 0.9rem; color: #7a5a56; margin-bottom: 8px;">Your verification code</p>
              <div style="font-size: 2.8rem; font-weight: 700; letter-spacing: 12px; color: #2a1f1d; font-family: monospace; margin: 16px 0;">
                ${code}
              </div>
              <p style="font-size: 0.78rem; color: #b09490; margin-top: 16px; line-height: 1.6;">
                This code expires in <strong>10 minutes</strong>.<br/>
                If you didn't try to sign in, you can safely ignore this email.
              </p>
            </div>
            <p style="font-size: 0.7rem; color: #c4a09a; text-align: center; margin-top: 20px;">
              QRFeedback.ai · Secure Login
            </p>
          </div>
        `,
      }),
    })

    if (!resendRes.ok) {
      const resendError = await resendRes.json()
      console.error('Resend error:', resendError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}