'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error || 'Access denied. This portal is restricted.')
      return
    }

    router.push('/qrf-admin')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-login-bg {
          min-height: 100vh; background: #0f0a09;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 32px 20px; position: relative;
          font-family: 'DM Sans', sans-serif;
        }
        .admin-login-bg::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle at 50% 40%, rgba(176,92,82,0.07) 0%, transparent 60%);
        }
        .admin-login-card {
          background: #1a1210; border-radius: 12px; padding: 38px 40px;
          width: 100%; max-width: 400px;
          border: 1px solid rgba(232,213,207,0.1);
          box-shadow: 0 8px 48px rgba(0,0,0,0.5);
          position: relative; z-index: 1;
        }
        .admin-logo { text-align: center; margin-bottom: 6px; }
        .admin-logo-text { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #f5ede8; }
        .admin-logo-dot { color: #b05c52; }
        .admin-badge { display: inline-block; font-size: 0.55rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 3px 9px; border-radius: 20px; background: rgba(176,92,82,0.2); color: #e8a090; border: 1px solid rgba(176,92,82,0.3); margin-top: 5px; }
        .admin-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0 22px; }
        .admin-divider-line { flex: 1; height: 1px; background: rgba(232,213,207,0.1); }
        .admin-divider-dot { color: rgba(196,137,106,0.4); font-size: 0.6rem; }
        .admin-title { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #f5ede8; text-align: center; margin-bottom: 4px; }
        .admin-sub { font-size: 0.78rem; color: rgba(176,148,144,0.6); text-align: center; margin-bottom: 26px; }
        .form-group { margin-bottom: 15px; }
        .form-label { display: block; font-size: 0.68rem; font-weight: 700; color: rgba(245,237,232,0.5); margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(196,137,106,0.5); font-size: 0.78rem; pointer-events: none; }
        .form-input { width: 100%; padding: 10px 13px 10px 36px; border: 1.5px solid rgba(232,213,207,0.12); border-radius: 8px; font-size: 0.85rem; color: #f5ede8; font-family: 'DM Sans', sans-serif; background: rgba(255,255,255,0.04); transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: rgba(176,92,82,0.5); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(176,92,82,0.1); }
        .form-input::placeholder { color: rgba(176,148,144,0.3); }
        .eye-btn { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(196,137,106,0.4); font-size: 0.78rem; padding: 2px; transition: color 0.15s; }
        .eye-btn:hover { color: rgba(196,137,106,0.8); }
        .error-box { background: rgba(176,92,82,0.1); border: 1px solid rgba(176,92,82,0.25); border-radius: 8px; padding: 10px 13px; font-size: 0.78rem; color: #e8a090; margin-bottom: 15px; }
        .submit-btn { width: 100%; padding: 11px; border-radius: 8px; border: none; background: #b05c52; color: #fff; font-size: 0.86rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 4px; transition: all 0.2s; letter-spacing: 0.3px; box-shadow: 0 2px 12px rgba(176,92,82,0.3); }
        .submit-btn:hover:not(:disabled) { background: #8c3d34; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(176,92,82,0.4); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .back-row { text-align: center; margin-top: 20px; font-size: 0.76rem; color: rgba(176,148,144,0.4); }
        .back-row a { color: rgba(176,148,144,0.4); text-decoration: none; transition: color 0.15s; }
        .back-row a:hover { color: rgba(176,148,144,0.7); }
      `}</style>

      <div className="admin-login-bg">
        <div className="admin-login-card">
          <div className="admin-logo">
            <div className="admin-logo-text">QRFeedback<span className="admin-logo-dot">.ai</span></div>
            <div className="admin-badge">Admin Access</div>
          </div>
          <div className="admin-divider">
            <div className="admin-divider-line"></div>
            <span className="admin-divider-dot">✦</span>
            <div className="admin-divider-line"></div>
          </div>
          <div className="admin-title">Restricted Portal</div>
          <div className="admin-sub">Authorised personnel only</div>

          {error && <div className="error-box">⚠ {error}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input type="email" className="form-input" placeholder="admin@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input type={showPassword ? 'text' : 'password'} className="form-input"
                  placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Panel'}
            </button>
          </form>

          <div className="back-row">
            <Link href="/auth/login">← Back to regular login</Link>
          </div>
        </div>
      </div>
    </>
  )
}