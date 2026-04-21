import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { name, business_name, email, business_type, message } = await request.json()

    if (!name || !email || !business_name) {
      return NextResponse.json({ error: 'Name, email and business name are required' }, { status: 400 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase
      .from('contact_requests')
      .insert({
        name: name.trim(),
        business_name: business_name.trim(),
        email: email.trim().toLowerCase(),
        business_type: business_type || 'other',
        message: message?.trim() || null,
        status: 'new',
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Contact insert error:', error)
      return NextResponse.json({ error: 'Failed to save enquiry' }, { status: 500 })
    }

    // Notify admin via Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'QRFeedback.ai <info@qrfeedback.ai>',
        to: process.env.ADMIN_EMAIL!,
        subject: `New Business Enquiry — ${business_name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fdf6f4; border-radius: 12px;">
            <div style="font-size: 1.4rem; font-weight: bold; color: #2a1f1d; margin-bottom: 4px;">QRFeedback<span style="color:#b05c52">.ai</span></div>
            <div style="font-size: 0.75rem; color: #b09490; margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">New Business Enquiry</div>
            <hr style="border: none; border-top: 1px solid #e8d5cf; margin-bottom: 24px;" />
            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
              <tr><td style="padding: 8px 0; color: #7a5a56; width: 140px;">Name</td><td style="padding: 8px 0; color: #2a1f1d; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a5a56;">Business</td><td style="padding: 8px 0; color: #2a1f1d; font-weight: 600;">${business_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a5a56;">Email</td><td style="padding: 8px 0; color: #b05c52;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a5a56;">Business Type</td><td style="padding: 8px 0; color: #2a1f1d;">${business_type}</td></tr>
              ${message ? `<tr><td style="padding: 8px 0; color: #7a5a56; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #2a1f1d;">${message}</td></tr>` : ''}
            </table>
            <hr style="border: none; border-top: 1px solid #e8d5cf; margin: 24px 0;" />
            <div style="font-size: 0.75rem; color: #b09490;">Log in to admin panel to respond · <a href="${process.env.NEXT_PUBLIC_APP_URL}/qrf-admin" style="color: #b05c52;">Open Admin</a></div>
          </div>
        `
      })
    } catch (emailErr) {
      console.warn('Admin notification email failed:', emailErr)
      // Non-fatal — enquiry was still saved
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}