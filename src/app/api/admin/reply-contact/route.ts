import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: profile } = await adminSupabase
      .from('profiles').select('is_admin').eq('id', user.id).single()
    return !!profile?.is_admin
  } catch { return false }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { requestId, to, toName, subject, body } = await req.json()
  if (!requestId || !to || !body) {
    return NextResponse.json({ error: 'requestId, to and body are required' }, { status: 400 })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error: emailError } = await resend.emails.send({
    from: 'QRFeedback.ai <info@qrfeedback.ai>',
    to: `${toName} <${to}>`,
    subject: subject || `Re: Your QRFeedback.ai Business Enquiry`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fdf6f4; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: bold; color: #2a1f1d; margin-bottom: 4px;">QRFeedback<span style="color:#b05c52">.ai</span></div>
        <hr style="border: none; border-top: 1px solid #e8d5cf; margin: 16px 0 24px;" />
        <div style="font-size: 0.92rem; color: #3a2a28; line-height: 1.75; white-space: pre-line;">${body.replace(/\n/g, '<br/>')}</div>
        <hr style="border: none; border-top: 1px solid #e8d5cf; margin: 24px 0 16px;" />
        <div style="font-size: 0.75rem; color: #b09490;">QRFeedback.ai · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #b05c52; text-decoration: none;">qrfeedback.ai</a></div>
      </div>
    `
  })

  if (emailError) return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })

  await adminSupabase
    .from('contact_requests')
    .update({ status: 'replied', replied_at: new Date().toISOString() })
    .eq('id', requestId)

  return NextResponse.json({ success: true })
}