'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailChecked, setEmailChecked] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Too short', 'Good', 'Strong']
  const strengthColor = ['', '#b05c52', '#c4896a', '#4a7a5a']

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailRegex.test(email)

  async function handleEmailBlur() {
    if (!isEmailValid) return
    setCheckingEmail(true); setEmailChecked(false); setError('')
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      setEmailChecked(true)
      if (json.exists) {
        setEmailAvailable(false)
        setError('An account with this email already exists. Did you mean to sign in?')
      } else {
        setEmailAvailable(true); setError('')
      }
    } catch {
      setEmailChecked(false)
    } finally {
      setCheckingEmail(false)
    }
  }

  function handleEmailChange(val: string) {
    setEmail(val); setEmailChecked(false); setEmailAvailable(false)
    if (error) setError('')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!isEmailValid) { setError('Please enter a valid email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    if (!emailChecked) {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })
        const json = await res.json()
        if (json.exists) { setError('An account with this email already exists. Did you mean to sign in?'); setLoading(false); return }
      } catch {}
    } else if (emailChecked && !emailAvailable) {
      setError('An account with this email already exists. Did you mean to sign in?'); return
    }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    // Set trial on the new profile — 7 days from now, plan = pro
    if (data?.user) {
      await fetch('/api/auth/set-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      })
    }

    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-bg {
          min-height: 100vh; background: #fdf6f4;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 20px 32px; position: relative;
          font-family: 'DM Sans', sans-serif;
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
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 12px 0 20px; }
        .auth-divider-line { flex: 1; height: 1px; background: #e8d5cf; }
        .auth-divider-dot { color: #c4896a; font-size: 0.65rem; }
        .auth-title { font-family: 'DM Serif Display', serif; font-size: 1.55rem; color: #2a1f1d; text-align: center; margin-bottom: 5px; }
        .auth-sub { font-size: 0.82rem; color: #b09490; text-align: center; margin-bottom: 14px; }

        .trial-badge {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: linear-gradient(135deg, #fef3e8, #fff8f0);
          border: 1px solid #f0d8a0; border-radius: 8px;
          padding: 9px 14px; margin-bottom: 18px;
        }
        .trial-badge-icon { font-size: 0.95rem; }
        .trial-badge-text { font-size: 0.78rem; color: #7a5a20; line-height: 1.4; }
        .trial-badge-text strong { color: #5a3a10; font-weight: 700; }

        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 0.72rem; font-weight: 700; color: #2a1f1d; margin-bottom: 6px; letter-spacing: 0.4px; text-transform: uppercase; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #c4896a; font-size: 0.8rem; pointer-events: none; }
        .form-input { width: 100%; padding: 11px 36px 11px 36px; border: 1.5px solid #e8d5cf; border-radius: 8px; font-size: 0.9rem; color: #2a1f1d; font-family: 'DM Sans', sans-serif; background: #fdf6f4; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: #b05c52; background: #fff; box-shadow: 0 0 0 3px rgba(176,92,82,0.08); }
        .form-input::placeholder { color: #c9aba6; }
        .form-input.valid { border-color: #4a7a5a; }
        .form-input.invalid { border-color: #b05c52; }
        .email-status { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; }
        .eye-btn { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #c4896a; font-size: 0.85rem; padding: 4px; transition: color 0.15s; }
        .eye-btn:hover { color: #b05c52; }
        .strength-bar { height: 3px; border-radius: 2px; background: #e8d5cf; margin-top: 6px; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 2px; transition: all 0.3s; }
        .strength-label { font-size: 0.65rem; font-weight: 600; margin-top: 3px; }

        .error-box { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 10px 13px; font-size: 0.79rem; color: #8c3d34; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
        .error-signin-link { color: #b05c52; font-weight: 700; text-decoration: underline; }

        .submit-btn { width: 100%; padding: 13px; border-radius: 8px; border: none; background: #b05c52; color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 4px; transition: all 0.2s; letter-spacing: 0.3px; box-shadow: 0 2px 10px rgba(176,92,82,0.25); }
        .submit-btn:hover:not(:disabled) { background: #8c3d34; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .auth-switch { text-align: center; margin-top: 16px; font-size: 0.82rem; color: #b09490; }
        .auth-switch a { color: #b05c52; font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .auth-terms { text-align: center; margin-top: 10px; font-size: 0.68rem; color: #c9aba6; line-height: 1.5; }
        .auth-terms a { color: #b09490; text-decoration: none; }
        .auth-terms a:hover { text-decoration: underline; }
        .gold-rule { border: none; border-top: 1px solid #e8d5cf; margin: 16px 0; }

        @media (max-width: 480px) {
          .auth-bg { padding: 56px 16px 24px; justify-content: flex-start; padding-top: 70px; }
          .auth-card { padding: 28px 22px; border-radius: 12px; }
          .auth-title { font-size: 1.35rem; }
          .form-input { font-size: 1rem; padding: 12px 36px 12px 36px; }
          .submit-btn { padding: 14px; font-size: 0.95rem; }
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
          <div className="auth-title">Create Account</div>
          <div className="auth-sub">Start collecting feedback in minutes</div>

          {/* Trial badge */}
          <div className="trial-badge">
            <span className="trial-badge-icon">🎁</span>
            <div className="trial-badge-text">
              <strong>7-day Pro trial included</strong> — no credit card required.<br />
              Full Pro features, free for your first week.
            </div>
          </div>

          {error && (
            <div className="error-box">
              <span>⚠</span>
              <span>
                {error}
                {error.includes('already exists') && (
                  <> <Link href="/auth/login" className="error-signin-link">Sign in instead →</Link></>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  type="text" className="form-input" style={{ paddingRight: 13 }}
                  placeholder="Your full name" value={fullName}
                  onChange={e => setFullName(e.target.value)} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  className={`form-input ${emailChecked && emailAvailable ? 'valid' : emailChecked && !emailAvailable ? 'invalid' : ''}`}
                  placeholder="your@email.com" value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur} required
                />
                <span className="email-status">
                  {checkingEmail && <span style={{ color: '#c4896a', fontSize: '0.7rem' }}>…</span>}
                  {!checkingEmail && emailChecked && emailAvailable && <span style={{ color: '#4a7a5a' }}>✓</span>}
                  {!checkingEmail && emailChecked && !emailAvailable && <span style={{ color: '#b05c52' }}>✗</span>}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'} className="form-input"
                  placeholder="At least 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {password.length > 0 && (
                <>
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${(strength / 3) * 100}%`, background: strengthColor[strength] }} />
                  </div>
                  <div className="strength-label" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</div>
                </>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading || checkingEmail || (emailChecked && !emailAvailable)}>
              {loading ? 'Creating account...' : checkingEmail ? 'Checking email...' : 'Start Free Trial →'}
            </button>
          </form>

          <hr className="gold-rule" />
          <div className="auth-switch">Already have an account? <Link href="/auth/login">Sign in</Link></div>
          <div className="auth-terms">
            By creating an account, you agree to our{' '}
            <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </>
  )
}