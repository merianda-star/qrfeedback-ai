'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TRUST_KEY_PREFIX = 'qrf_trusted_'
const TRUST_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [trustDevice, setTrustDevice] = useState(false)
  const [otpUserId, setOtpUserId] = useState('')
  const [resendOtpLoading, setResendOtpLoading] = useState(false)
  const [resendOtpSent, setResendOtpSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailNotConfirmed(false)
    setResetSent(false)

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed') || signInError.message.toLowerCase().includes('email_not_confirmed')) {
        setEmailNotConfirmed(true)
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }

    const user = signInData?.user
    if (!user) { setError('Something went wrong. Please try again.'); setLoading(false); return }

    const trustKey = `${TRUST_KEY_PREFIX}${user.id}`
    const trustData = localStorage.getItem(trustKey)
    let isTrusted = false
    if (trustData) {
      try {
        const { expires } = JSON.parse(trustData)
        if (Date.now() < expires) isTrusted = true
        else localStorage.removeItem(trustKey)
      } catch { localStorage.removeItem(trustKey) }
    }

    const { data: profile } = await supabase.from('profiles').select('email_otp_enabled').eq('id', user.id).single()

    if (profile?.email_otp_enabled && !isTrusted) {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send verification code.')
        setLoading(false)
        return
      }
      setOtpUserId(user.id)
      setOtpStep(true)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleOtpVerify() {
    if (otpCode.length !== 6) { setOtpError('Please enter the 6-digit code.'); return }
    setOtpLoading(true); setOtpError('')
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otpCode }),
    })
    const data = await res.json()
    setOtpLoading(false)
    if (!res.ok) { setOtpError(data.error || 'Incorrect or expired code.'); setOtpCode(''); return }
    if (trustDevice && otpUserId) {
      localStorage.setItem(`${TRUST_KEY_PREFIX}${otpUserId}`, JSON.stringify({ expires: Date.now() + TRUST_DURATION_MS, email }))
    }
    router.push('/dashboard')
  }

  async function handleResendOtp() {
    setResendOtpLoading(true); setResendOtpSent(false)
    const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setResendOtpLoading(false)
    if (res.ok) { setResendOtpSent(true); setTimeout(() => setResendOtpSent(false), 30000) }
    else setOtpError('Failed to resend code.')
  }

  async function handleResendEmail() {
    setResendLoading(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResendLoading(false); setResendSent(true)
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email above first, then click Forgot password.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    if (error) { setError(error.message); return }
    setError(''); setResetSent(true)
    setTimeout(() => setResetSent(false), 6000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-bg {
          min-height: 100vh; background: #fdf6f4;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 20px 32px; position: relative; font-family: 'DM Sans', sans-serif;
        }
        .auth-bg::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle at 20% 20%, rgba(196,137,106,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(176,92,82,0.06) 0%, transparent 50%);
        }
        .back-link {
          position: absolute; top: 20px; left: 20px;
          color: #b09490; font-size: 0.83rem; font-weight: 500;
          text-decoration: none; display: flex; align-items: center; gap: 6px;
          transition: color 0.2s; z-index: 10;
        }
        .back-link:hover { color: #2a1f1d; }

        .auth-card {
          background: #ffffff; border-radius: 14px; padding: 36px 38px;
          width: 100%; max-width: 440px;
          box-shadow: 0 1px 2px rgba(42,31,29,0.04), 0 8px 40px rgba(42,31,29,0.08);
          border: 1px solid #e8d5cf; position: relative; z-index: 1;
        }

        .auth-logo { text-align: center; margin-bottom: 6px; }
        .auth-logo-text { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: #2a1f1d; }
        .auth-logo-dot { color: #b05c52; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 12px 0 22px; }
        .auth-divider-line { flex: 1; height: 1px; background: #e8d5cf; }
        .auth-divider-dot { color: #c4896a; font-size: 0.65rem; }
        .auth-title { font-family: 'DM Serif Display', serif; font-size: 1.55rem; color: #2a1f1d; text-align: center; margin-bottom: 5px; }
        .auth-sub { font-size: 0.82rem; color: #b09490; text-align: center; margin-bottom: 24px; }

        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 0.72rem; font-weight: 700; color: #2a1f1d; margin-bottom: 6px; letter-spacing: 0.4px; text-transform: uppercase; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #c4896a; font-size: 0.8rem; pointer-events: none; }
        .form-input { width: 100%; padding: 11px 13px 11px 36px; border: 1.5px solid #e8d5cf; border-radius: 8px; font-size: 0.9rem; color: #2a1f1d; font-family: 'DM Sans', sans-serif; background: #fdf6f4; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: #b05c52; background: #fff; box-shadow: 0 0 0 3px rgba(176,92,82,0.08); }
        .form-input::placeholder { color: #c9aba6; }
        .eye-btn { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #c4896a; font-size: 0.85rem; padding: 4px; transition: color 0.15s; }
        .eye-btn:hover { color: #b05c52; }

        .forgot-row { display: flex; justify-content: flex-end; margin-top: 6px; }
        .forgot-link { font-size: 0.75rem; font-weight: 600; color: #b05c52; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 2px 0; }
        .forgot-link:hover { text-decoration: underline; }

        .error-box { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 10px 13px; font-size: 0.79rem; color: #8c3d34; margin-bottom: 14px; line-height: 1.5; }
        .reset-toast { background: #edf4ef; border: 1px solid rgba(74,122,90,0.25); border-radius: 8px; padding: 11px 14px; font-size: 0.79rem; color: #2a5a3a; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 9px; animation: toastIn 0.3s ease both; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .reset-toast-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
        .reset-toast-text { line-height: 1.5; }

        .unconfirmed-box { background: #fef9e8; border: 1px solid #e8d880; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
        .unconfirmed-title { font-size: 0.82rem; font-weight: 700; color: #7a5a10; margin-bottom: 5px; }
        .unconfirmed-sub { font-size: 0.76rem; color: #a07820; line-height: 1.5; margin-bottom: 12px; }
        .resend-btn { padding: 7px 16px; border-radius: 8px; border: 1.5px solid #e8d880; background: #fff; font-size: 0.76rem; font-weight: 600; color: #a07820; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .resend-btn:hover:not(:disabled) { background: #fef3c0; }
        .resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .resend-sent { font-size: 0.76rem; color: #4a7a5a; font-weight: 600; }

        .submit-btn { width: 100%; padding: 13px; border-radius: 8px; border: none; background: #b05c52; color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 4px; transition: all 0.2s; letter-spacing: 0.3px; box-shadow: 0 2px 10px rgba(176,92,82,0.25); }
        .submit-btn:hover:not(:disabled) { background: #8c3d34; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .auth-switch { text-align: center; margin-top: 18px; font-size: 0.82rem; color: #b09490; }
        .auth-switch a { color: #b05c52; font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .gold-rule { border: none; border-top: 1px solid #e8d5cf; margin: 18px 0; }

        /* OTP screen */
        .otp-screen { text-align: center; }
        .otp-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .otp-title { font-family: 'DM Serif Display', serif; font-size: 1.35rem; color: #2a1f1d; margin-bottom: 6px; }
        .otp-sub { font-size: 0.78rem; color: #b09490; line-height: 1.6; margin-bottom: 6px; }
        .otp-email-badge { display: inline-block; background: #f7ece9; border: 1px solid #e8d5cf; border-radius: 20px; padding: 4px 14px; font-size: 0.76rem; font-weight: 600; color: #7a5a56; margin-bottom: 20px; word-break: break-all; max-width: 100%; }
        .otp-code-input { width: 100%; padding: 14px; border: 1.5px solid #e8d5cf; border-radius: 10px; font-size: 1.6rem; font-family: monospace; color: #2a1f1d; background: #fdf6f4; text-align: center; letter-spacing: 10px; outline: none; transition: all 0.2s; margin-bottom: 14px; }
        .otp-code-input:focus { border-color: #b05c52; background: #fff; box-shadow: 0 0 0 3px rgba(176,92,82,0.08); }
        .otp-code-input::placeholder { letter-spacing: 4px; color: #c9aba6; font-size: 1rem; }
        .otp-error { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 9px 12px; font-size: 0.76rem; color: #8c3d34; margin-bottom: 12px; text-align: left; }
        .trust-row { display: flex; align-items: center; gap: 10px; background: #fdf6f4; border: 1px solid #e8d5cf; border-radius: 9px; padding: 11px 13px; margin-bottom: 14px; cursor: pointer; transition: background 0.15s; text-align: left; }
        .trust-row:hover { background: #f7ece9; }
        .trust-checkbox { width: 17px; height: 17px; border-radius: 4px; border: 2px solid #d9c2bb; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; background: #fff; }
        .trust-checkbox.checked { border-color: #b05c52; background: #b05c52; }
        .trust-checkbox-tick { color: #fff; font-size: 0.6rem; font-weight: 900; }
        .trust-text { flex: 1; min-width: 0; }
        .trust-label { font-size: 0.78rem; font-weight: 600; color: #2a1f1d; margin-bottom: 1px; }
        .trust-desc { font-size: 0.67rem; color: #b09490; line-height: 1.4; }
        .otp-resend-row { margin-top: 14px; font-size: 0.75rem; color: #b09490; }
        .otp-resend-btn { background: none; border: none; color: #b05c52; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: underline; padding: 0; }
        .otp-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-back-btn { background: none; border: none; color: #b09490; font-size: 0.74rem; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 10px; text-decoration: underline; display: block; width: 100%; text-align: center; padding: 6px 0; }
        .otp-back-btn:hover { color: #7a5a56; }

        .admin-hint { position: absolute; bottom: 14px; right: 16px; opacity: 0; transition: opacity 0.3s; z-index: 2; }
        .auth-card:hover .admin-hint { opacity: 1; }
        .admin-hint-icon { display: block; width: 18px; height: 18px; color: #ddd0cc; text-decoration: none; font-size: 0.75rem; line-height: 18px; text-align: center; transition: color 0.2s; }
        .admin-hint-icon:hover { color: #b09490; }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .auth-bg { padding: 56px 16px 24px; justify-content: flex-start; padding-top: 70px; }
          .auth-card { padding: 28px 22px; border-radius: 12px; }
          .auth-title { font-size: 1.35rem; }
          .form-input { padding: 12px 13px 12px 36px; font-size: 1rem; }
          .submit-btn { padding: 14px; font-size: 0.95rem; }
          .otp-code-input { font-size: 1.4rem; letter-spacing: 8px; }
          .back-link { top: 16px; left: 16px; font-size: 0.8rem; }
        }
      `}</style>

      <div className="auth-bg">
        <Link href="/" className="back-link">← Back to Home</Link>

        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-text">QRFeedback<span className="auth-logo-dot">.ai</span></div>
          </div>
          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-dot">✦</span>
            <div className="auth-divider-line"></div>
          </div>

          {otpStep ? (
            <div className="otp-screen">
              <div className="otp-icon">📧</div>
              <div className="otp-title">Check your email</div>
              <div className="otp-sub">We've sent a 6-digit verification code to</div>
              <div className="otp-email-badge">{email}</div>

              {otpError && <div className="otp-error">⚠ {otpError}</div>}

              <input
                className="otp-code-input" type="text" inputMode="numeric"
                maxLength={6} placeholder="000000" value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleOtpVerify()}
                autoFocus
              />

              <div className="trust-row" onClick={() => setTrustDevice(!trustDevice)}>
                <div className={`trust-checkbox ${trustDevice ? 'checked' : ''}`}>
                  {trustDevice && <span className="trust-checkbox-tick">✓</span>}
                </div>
                <div className="trust-text">
                  <div className="trust-label">Trust this device for 30 days</div>
                  <div className="trust-desc">Skip the code next time on this device</div>
                </div>
              </div>

              <button className="submit-btn" onClick={handleOtpVerify} disabled={otpLoading || otpCode.length !== 6}>
                {otpLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="otp-resend-row">
                Didn't receive it?{' '}
                {resendOtpSent ? (
                  <span style={{ color: '#4a7a5a', fontWeight: 600 }}>Code resent ✓</span>
                ) : (
                  <button className="otp-resend-btn" onClick={handleResendOtp} disabled={resendOtpLoading}>
                    {resendOtpLoading ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </div>

              <button className="otp-back-btn" onClick={() => { setOtpStep(false); setOtpCode(''); setOtpError(''); supabase.auth.signOut() }}>
                ← Use a different account
              </button>
            </div>

          ) : (
            <>
              <div className="auth-title">Welcome Back</div>
              <div className="auth-sub">Sign in to your account</div>

              {resetSent && (
                <div className="reset-toast">
                  <span className="reset-toast-icon">✉️</span>
                  <span className="reset-toast-text">Reset email sent to <strong>{email}</strong> — check your inbox.</span>
                </div>
              )}

              {emailNotConfirmed && (
                <div className="unconfirmed-box">
                  <div className="unconfirmed-title">📧 Please verify your email first</div>
                  <div className="unconfirmed-sub">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</div>
                  {resendSent ? (
                    <div className="resend-sent">✓ Verification email resent</div>
                  ) : (
                    <button className="resend-btn" onClick={handleResendEmail} disabled={resendLoading}>
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}

              {error && <div className="error-box">⚠ {error}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrap">
                    <span className="input-icon">✉</span>
                    <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                  <div className="forgot-row">
                    <button type="button" className="forgot-link" onClick={handleForgotPassword}>Forgot password?</button>
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <hr className="gold-rule" />
              <div className="auth-switch">
                Don't have an account? <Link href="/auth/register">Create one free</Link>
              </div>
            </>
          )}

          <div className="admin-hint">
            <Link href="/auth/admin-login" className="admin-hint-icon" title="">⚙</Link>
          </div>
        </div>
      </div>
    </>
  )
}