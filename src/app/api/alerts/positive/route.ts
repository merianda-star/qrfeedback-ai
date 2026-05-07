import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { form_id, rating } = await req.json()
    if (!form_id) return NextResponse.json({ error: 'Missing form_id' }, { status: 400 })

    const { data: form } = await adminSupabase
      .from('forms').select('id, title, user_id').eq('id', form_id).single()
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('email, alert_email, business_name, ai_email_alerts, notify_on_positive')
      .eq('id', form.user_id).single()

    // Check master alerts toggle AND positive notify toggle
    if (!profile?.ai_email_alerts) return NextResponse.json({ skipped: true, reason: 'alerts disabled' })
    if (!profile?.notify_on_positive) return NextResponse.json({ skipped: true, reason: 'positive notify disabled' })

    const emailTo = profile?.alert_email || profile?.email
    if (!emailTo) return NextResponse.json({ triggered: false, reason: 'no email' })

    const businessName = profile?.business_name || 'Your Business'
    const formTitle = form.title || 'Your Form'
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    const starLabel: Record<number, string> = { 4: 'Great 😊', 5: 'Amazing 🤩' }
    const stars = '★'.repeat(rating || 5) + '☆'.repeat(5 - (rating || 5))

    const html = `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fdf6f4;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:1.2rem;color:#2a1f1d;">QRFeedback<span style="color:#b05c52;">.ai</span></div>
        <div style="width:40px;height:1px;background:#c4896a;margin:8px auto 0;"></div>
      </div>
      <div style="background:#fff;border-radius:14px;border:1px solid #e8d5cf;padding:28px;">
        <div style="background:#edf4ef;border:1px solid rgba(74,122,90,0.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
          <span style="font-size:1.4rem;">⭐</span> <strong style="color:#4a7a5a;">Positive Review Received</strong>
          <span style="font-size:0.72rem;color:#b09490;"> — ${today}</span>
        </div>
        <div style="font-size:1rem;color:#2a1f1d;margin-bottom:8px;font-weight:600;">
          A customer left a ${rating}-star review on ${formTitle}
        </div>
        <div style="font-size:0.8rem;color:#7a5a56;margin-bottom:20px;line-height:1.6;">
          Great news! A customer rated <strong>${businessName}</strong> ${rating} stars —
          <strong>${starLabel[rating] || 'Amazing 🤩'}</strong>.
          They were redirected to leave a Google review.
        </div>
        <div style="background:#fdf6f4;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#b09490;margin-bottom:8px;">Review Details</div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:4px 0;">
            <span>Rating</span>
            <span style="font-weight:700;color:#4a7a5a;">${stars} ${rating}/5</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:4px 0;">
            <span>Form</span>
            <span style="font-weight:700;color:#2a1f1d;">${formTitle}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:4px 0;">
            <span>Redirected to</span>
            <span style="font-weight:700;color:#4a7a5a;">Google Reviews ✓</span>
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.qrfeedback.ai'}/dashboard/responses"
          style="display:block;text-align:center;background:#4a7a5a;color:#fff;padding:13px 24px;border-radius:9px;font-family:sans-serif;font-size:0.88rem;font-weight:600;text-decoration:none;">
          View All Responses →
        </a>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <p style="font-family:sans-serif;font-size:0.68rem;color:#c4a09a;margin:0;">© 2026 Startekk LLC · QRFeedback.ai</p>
      </div>
    </div>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'QRFeedback.ai <info@qrfeedback.ai>',
        to: [emailTo],
        subject: `⭐ ${rating}-star review received on ${formTitle}`,
        html,
      }),
    })

    return NextResponse.json({ triggered: true, rating, emailSentTo: emailTo })
  } catch (err: any) {
    console.error('Positive alert error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}