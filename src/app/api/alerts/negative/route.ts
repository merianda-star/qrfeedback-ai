import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALERT_THRESHOLD = 10
const catLabels: Record<string, string> = {
  food: '🍽 Food Quality', service: '💼 Service', cleanliness: '🧹 Cleanliness',
  pricing: '💰 Pricing', waiting: '⏱ Wait Time', other: '◈ Other',
}

export async function POST(req: NextRequest) {
  try {
    const { form_id } = await req.json()
    if (!form_id) return NextResponse.json({ error: 'Missing form_id' }, { status: 400 })

    const { data: form } = await adminSupabase.from('forms').select('id, title, user_id').eq('id', form_id).single()
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

    const { data: profile } = await adminSupabase.from('profiles')
      .select('email, alert_email, business_name, ai_email_alerts, notify_on_negative')
      .eq('id', form.user_id).single()

    // Check both the master alerts toggle AND the negative notify toggle
    if (!profile?.ai_email_alerts) return NextResponse.json({ skipped: true, reason: 'alerts disabled' })
    if (!profile?.notify_on_negative) return NextResponse.json({ skipped: true, reason: 'negative notify disabled' })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayNegatives } = await adminSupabase.from('responses')
      .select('id, rating, ai_category').eq('form_id', form_id)
      .lte('rating', 3).gte('submitted_at', todayStart.toISOString())

    const count = todayNegatives?.length || 0
    if (count !== ALERT_THRESHOLD) return NextResponse.json({ count, threshold: ALERT_THRESHOLD, triggered: false })

    const categoryCounts: Record<string, number> = {}
    todayNegatives?.forEach(r => {
      if (r.ai_category) categoryCounts[r.ai_category] = (categoryCounts[r.ai_category] || 0) + 1
    })
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
    const emailTo = profile?.alert_email || profile?.email
    if (!emailTo) return NextResponse.json({ triggered: false, reason: 'no email' })

    const businessName = profile?.business_name || 'Your Business'
    const formTitle = form.title || 'Your Form'
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const html = `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fdf6f4;"><div style="text-align:center;margin-bottom:28px;"><div style="font-size:1.2rem;color:#2a1f1d;">QRFeedback<span style="color:#b05c52;">.ai</span></div><div style="width:40px;height:1px;background:#c4896a;margin:8px auto 0;"></div></div><div style="background:#fff;border-radius:14px;border:1px solid #e8d5cf;padding:28px;"><div style="background:#fef5f4;border:1px solid rgba(176,92,82,0.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;"><span style="font-size:1.4rem;">⚠️</span> <strong style="color:#b05c52;">Negative Review Alert</strong> <span style="font-size:0.72rem;color:#b09490;">— ${today}</span></div><div style="font-size:1rem;color:#2a1f1d;margin-bottom:8px;font-weight:600;">${businessName} has received ${count} negative reviews today</div><div style="font-size:0.8rem;color:#7a5a56;margin-bottom:20px;line-height:1.6;">Your form <strong>${formTitle}</strong> has reached ${count} negative reviews (1–3 stars) today. This may require your immediate attention.</div><div style="background:#fdf6f4;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#b09490;margin-bottom:8px;">Today's Breakdown</div><div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:4px 0;"><span>Negative reviews today</span><span style="font-weight:700;color:#b05c52;">${count}</span></div>${topCategory ? `<div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:4px 0;"><span>Top complaint</span><span style="font-weight:700;color:#b05c52;">${catLabels[topCategory[0]] || topCategory[0]}</span></div>` : ''}${Object.entries(categoryCounts).length > 0 ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8d5cf;">${Object.entries(categoryCounts).map(([cat, cnt]) => `<div style="display:flex;justify-content:space-between;font-size:0.75rem;padding:3px 0;"><span>${catLabels[cat] || cat}</span><span style="color:#b05c52;">${cnt}</span></div>`).join('')}</div>` : ''}</div><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/responses" style="display:block;text-align:center;background:#b05c52;color:#fff;padding:13px 24px;border-radius:9px;font-family:sans-serif;font-size:0.88rem;font-weight:600;text-decoration:none;">View Responses & Reply →</a></div><div style="text-align:center;margin-top:20px;"><p style="font-family:sans-serif;font-size:0.68rem;color:#c4a09a;margin:0;">© 2026 Startekk LLC · QRFeedback.ai</p></div></div>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'QRFeedback.ai <info@qrfeedback.ai>', to: [emailTo], subject: `⚠️ Alert: ${count} negative reviews on ${formTitle} today`, html }),
    })

    return NextResponse.json({ triggered: true, count, emailSentTo: emailTo })
  } catch (err: any) {
    console.error('Alert error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}