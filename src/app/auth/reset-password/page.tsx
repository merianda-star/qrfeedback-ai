'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Too short', 'Good', 'Strong']
  const strengthColor = ['', '#b05c52', '#c4896a', '#4a7a5a']

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
        setCheckingSession(false)
      } else if (session) {
        setValidSession(true)
        setCheckingSession(false)
      } else {
        setCheckingSession(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true)
        setCheckingSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    await supabase.auth.signOut()
    setTimeout(() => router.push('/auth/login'), 2000)
  }

  // Sign out before navigating back to login so recovery session doesn't auto-login
  async function handleBackToSignIn(e: React.MouseEvent) {
    e.preventDefault()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fdf6f4; }
        .page { min-height: 100vh; background: #fdf6f4; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px; position: relative; }
        .page::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle at 20% 20%, rgba(196,137,106,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(176,92,82,0.06) 0%, transparent 50%); }
        .back-link { position: absolute; top: 24px; left: 24px; color: #b09490; font-size: 0.83rem; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: color 0.2s; z-index: 10; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .back-link:hover { color: #2a1f1d; }
        .card { background: #ffffff; border-radius: 14px; padding: 40px 42px; width: 100%; max-width: 440px; box-shadow: 0 1px 2px rgba(42,31,29,0.04), 0 8px 40px rgba(42,31,29,0.08); border: 1px solid #e8d5cf; position: relative; z-index: 1; animation: fadeUp 0.35s ease both; }
        .logo { text-align: center; margin-bottom: 6px; }
        .logo-text { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: #2a1f1d; }
        .logo-dot { color: #b05c52; }
        .divider { display: flex; align-items: center; gap: 12px; margin: 12px 0 24px; }
        .divider-line { flex: 1; height: 1px; background: #e8d5cf; }
        .divider-dot { color: #c4896a; font-size: 0.65rem; }
        .title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #2a1f1d; text-align: center; margin-bottom: 6px; }
        .sub { font-size: 0.82rem; color: #b09490; text-align: center; margin-bottom: 26px; line-height: 1.6; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.72rem; font-weight: 700; color: #2a1f1d; margin-bottom: 6px; letter-spacing: 0.4px; text-transform: uppercase; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #c4896a; font-size: 0.8rem; pointer-events: none; }
        .form-input { width: 100%; padding: 10px 40px 10px 36px; border: 1.5px solid #e8d5cf; border-radius: 8px; font-size: 0.87rem; color: #2a1f1d; font-family: 'DM Sans', sans-serif; background: #fdf6f4; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: #b05c52; background: #fff; box-shadow: 0 0 0 3px rgba(176,92,82,0.08); }
        .form-input::placeholder { color: #c9aba6; }
        .form-input.match { border-color: #4a7a5a; }
        .eye-btn { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #c4896a; font-size: 0.8rem; transition: color 0.15s; }
        .eye-btn:hover { color: #b05c52; }
        .strength-bar { height: 3px; border-radius: 2px; background: #e8d5cf; margin-top: 6px; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 2px; transition: all 0.3s; }
        .strength-label { font-size: 0.65rem; font-weight: 600; margin-top: 3px; }
        .match-label { font-size: 0.65rem; font-weight: 600; margin-top: 3px; color: #4a7a5a; }
        .error-box { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 10px 13px; font-size: 0.79rem; color: #8c3d34; margin-bottom: 16px; }
        .submit-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #b05c52; color: #fff; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 2px 10px rgba(176,92,82,0.25); }
        .submit-btn:hover:not(:disabled) { background: #8c3d34; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .success-box { text-align: center; padding: 8px 0; }
        .success-ring { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #4a7a5a, #5a9a6a); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 16px; box-shadow: 0 6px 20px rgba(74,122,90,0.3); }
        .success-title { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #2a1f1d; margin-bottom: 8px; }
        .success-sub { font-size: 0.8rem; color: #7a5a56; line-height: 1.6; }
        .invalid-box { text-align: center; padding: 8px 0; }
        .invalid-icon { font-size: 2.5rem; margin-bottom: 14px; }
        .invalid-title { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: #2a1f1d; margin-bottom: 8px; }
        .invalid-sub { font-size: 0.8rem; color: #7a5a56; line-height: 1.6; margin-bottom: 20px; }
        .signin-btn { display: inline-block; padding: 10px 24px; border-radius: 8px; background: #b05c52; color: #fff; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        .signin-btn:hover { background: #8c3d34; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page">
        {/* Back to Sign In — signs out first to clear recovery session */}
        <button className="back-link" onClick={handleBackToSignIn}>← Back to Sign In</button>

        <div className="card">
          <div className="logo">
            <div className="logo-text">QRFeedback<span className="logo-dot">.ai</span></div>
          </div>
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-dot">✦</span>
            <div className="divider-line"></div>
          </div>

          {checkingSession ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#b09490', fontSize: '0.85rem' }}>
              Verifying reset link...
            </div>
          ) : success ? (
            <div className="success-box">
              <div className="success-ring">✓</div>
              <div className="success-title">Password updated!</div>
              <div className="success-sub">Your password has been changed successfully. Taking you to sign in...</div>
            </div>
          ) : !validSession ? (
            <div className="invalid-box">
              <div className="invalid-icon">🔗</div>
              <div className="invalid-title">Link expired or invalid</div>
              <div className="invalid-sub">
                This password reset link has expired or already been used. Request a new one from the login page.
              </div>
              <button className="signin-btn" onClick={handleBackToSignIn}>Back to Sign In</button>
            </div>
          ) : (
            <>
              <div className="title">Reset Password</div>
              <div className="sub">Choose a new password for your account</div>

              {error && <div className="error-box">⚠ {error}</div>}

              <form onSubmit={handleReset}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input" placeholder="At least 6 characters"
                      value={password} onChange={e => setPassword(e.target.value)} required
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
                      <div className="strength-label" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </div>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${confirmPassword && confirmPassword === password ? 'match' : ''}`}
                      placeholder="Repeat your new password"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    />
                  </div>
                  {confirmPassword && confirmPassword === password && (
                    <div className="match-label">✓ Passwords match</div>
                  )}
                </div>

                <button type="submit" className="submit-btn" disabled={loading || strength < 1}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}