'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function VerifyEmailPageInner() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const supabase = createClient()

  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [resendError, setResendError] = useState('')

  async function handleResend() {
    setResendLoading(true)
    setResendError('')
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResendLoading(false)
    if (error) { setResendError(error.message); return }
    setResendSent(true)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fdf6f4; }
        .page { min-height: 100vh; background: #fdf6f4; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px; position: relative; }
        .page::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle at 20% 20%, rgba(196,137,106,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(176,92,82,0.06) 0%, transparent 50%); }
        .card { background: #ffffff; border-radius: 16px; padding: 44px 40px; width: 100%; max-width: 460px; text-align: center; box-shadow: 0 1px 2px rgba(42,31,29,0.04), 0 8px 40px rgba(42,31,29,0.08); border: 1px solid #e8d5cf; position: relative; z-index: 1; }
        .logo { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #2a1f1d; margin-bottom: 28px; }
        .logo span { color: #b05c52; }
        .icon-ring { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #fef3e8, #f7ece9); border: 2px solid #e8d5cf; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px; }
        .title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #2a1f1d; margin-bottom: 10px; line-height: 1.25; }
        .sub { font-size: 0.84rem; color: #7a5a56; line-height: 1.7; margin-bottom: 24px; }
        .email-pill { display: inline-block; background: #f7ece9; border: 1px solid #e8d5cf; border-radius: 20px; padding: 6px 16px; font-size: 0.82rem; font-weight: 600; color: #b05c52; margin-bottom: 28px; }
        .steps { background: #fdf6f4; border: 1px solid #e8d5cf; border-radius: 12px; padding: 18px 20px; text-align: left; margin-bottom: 24px; }
        .steps-title { font-size: 0.7rem; font-weight: 700; color: #b09490; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .step-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .step-row:last-child { margin-bottom: 0; }
        .step-num { width: 20px; height: 20px; border-radius: 50%; background: #b05c52; color: #fff; font-size: 0.6rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .step-text { font-size: 0.78rem; color: #7a5a56; line-height: 1.5; }
        .divider { height: 1px; background: #e8d5cf; margin: 20px 0; }
        .resend-section { margin-bottom: 20px; }
        .resend-label { font-size: 0.78rem; color: #b09490; margin-bottom: 10px; }
        .resend-btn { padding: 9px 22px; border-radius: 8px; border: 1.5px solid #e8d5cf; background: #ffffff; font-size: 0.8rem; font-weight: 600; color: #7a5a56; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .resend-btn:hover:not(:disabled) { border-color: #b05c52; color: #b05c52; background: #f7ece9; }
        .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .resend-success { font-size: 0.78rem; color: #4a7a5a; font-weight: 600; }
        .resend-error { font-size: 0.76rem; color: #8c3d34; margin-top: 6px; }
        .back-login { font-size: 0.8rem; color: #b09490; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: color 0.15s; }
        .back-login:hover { color: #b05c52; }
        .spam-note { margin-top: 20px; font-size: 0.7rem; color: #c9aba6; line-height: 1.6; padding: 10px 14px; background: #fdf6f4; border-radius: 8px; border: 1px solid #e8d5cf; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="logo">QRFeedback<span>.ai</span></div>
          <div className="icon-ring">📧</div>
          <div className="title">Check your inbox</div>
          <div className="sub">We've sent a verification link to:</div>
          <div className="email-pill">{email || 'your email address'}</div>
          <div className="steps">
            <div className="steps-title">What to do next</div>
            <div className="step-row"><div className="step-num">1</div><div className="step-text">Open the email from <strong>QRFeedback.ai</strong></div></div>
            <div className="step-row"><div className="step-num">2</div><div className="step-text">Click the <strong>"Confirm my email"</strong> button</div></div>
            <div className="step-row"><div className="step-num">3</div><div className="step-text">You'll be taken straight to your dashboard</div></div>
          </div>
          <div className="divider"></div>
          <div className="resend-section">
            <div className="resend-label">Didn't receive the email?</div>
            {resendSent ? (
              <div className="resend-success">✓ Email resent — check your inbox and spam folder</div>
            ) : (
              <button className="resend-btn" onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? 'Sending...' : '↺ Resend verification email'}
              </button>
            )}
            {resendError && <div className="resend-error">⚠ {resendError}</div>}
          </div>
          <Link href="/auth/login" className="back-login">← Back to Sign In</Link>
          <div className="spam-note">
            💡 Can't find the email? Check your <strong>Spam</strong> or <strong>Junk</strong> folder. The email comes from <em>noreply@mail.app.supabase.io</em> until we set up our custom domain.
          </div>
        </div>
      </div>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading...</div>
      </div>
    }>
      <VerifyEmailPageInner />
    </Suspense>
  )
}