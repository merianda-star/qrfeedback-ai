import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

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

  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const firstName = name ? name.split(' ')[0] : 'there'
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`

  const html = `
<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fdf6f4;">
  <div style="text-align: center; margin-bottom: 28px;">
    <div style="font-size: 1.2rem; color: #2a1f1d; letter-spacing: 0.5px;">
      QRFeedback<span style="color: #b05c52;">.ai</span>
    </div>
    <div style="width: 40px; height: 1px; background: #c4896a; margin: 8px auto 0;"></div>
  </div>
  <div style="background: #ffffff; border-radius: 14px; border: 1px solid #e8d5cf; padding: 32px 28px; box-shadow: 0 4px 24px rgba(42,31,29,0.07);">
    <div style="font-size: 1.4rem; color: #2a1f1d; margin-bottom: 8px; text-align: center;">
      We miss you, ${firstName} 👋
    </div>
    <div style="width: 32px; height: 1px; background: #c4896a; margin: 0 auto 20px;"></div>
    <p style="font-family: sans-serif; font-size: 0.88rem; color: #7a5a56; line-height: 1.7; margin: 0 0 16px; text-align: center;">
      It's been a while since you last logged into QRFeedback.ai. Your account is still active and ready to help you collect smarter feedback from your customers.
    </p>
    <p style="font-family: sans-serif; font-size: 0.88rem; color: #7a5a56; line-height: 1.7; margin: 0 0 24px; text-align: center;">
      Whether you want to review past responses, create a new form, or check your analytics — everything is right where you left it.
    </p>
    <a href="${loginUrl}" style="display: block; text-align: center; background: #b05c52; color: #ffffff; padding: 14px 24px; border-radius: 9px; font-family: sans-serif; font-size: 0.9rem; font-weight: 600; text-decoration: none; margin-bottom: 22px; box-shadow: 0 3px 12px rgba(176,92,82,0.25);">
      Log back in →
    </a>
    <div style="border-top: 1px solid #e8d5cf; padding-top: 16px;">
      <p style="font-family: sans-serif; font-size: 0.72rem; color: #b09490; text-align: center; margin: 0; line-height: 1.6;">
        If you no longer need your account, you can ignore this email.<br/>
        We won't send this more than once.
      </p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 22px;">
    <p style="font-family: sans-serif; font-size: 0.68rem; color: #c4a09a; margin: 0;">
      © 2026 Startekk LLC · QRFeedback.ai<br/>
      Smart Feedback · Powered by AI
    </p>
  </div>
</div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'QRFeedback.ai <noreply@qrfeedback.ai>',
      to: [email],
      subject: `${firstName}, your QRFeedback.ai account is waiting`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}