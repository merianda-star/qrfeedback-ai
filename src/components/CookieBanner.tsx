'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ConsentState = 'accepted' | 'declined' | null

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null)
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('qrf_cookie_consent') as ConsentState
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored)
      setVisible(false)
    } else {
      // Small delay so banner doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('qrf_cookie_consent', 'accepted')
    setConsent('accepted')
    setVisible(false)
    // TODO: initialise GA4 here when Measurement ID is added
    // e.g. window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  }

  const handleDecline = () => {
    localStorage.setItem('qrf_cookie_consent', 'declined')
    setConsent('declined')
    setVisible(false)
  }

  const handleReset = () => {
    localStorage.removeItem('qrf_cookie_consent')
    setConsent(null)
    setVisible(true)
  }

  if (!visible) {
    // Show a small "Cookie Settings" link in the corner after consent is given
    if (consent !== null) {
      return (
        <button
          onClick={handleReset}
          aria-label="Manage cookie preferences"
          style={{
            position: 'fixed', bottom: '16px', left: '16px', zIndex: 999,
            fontSize: '0.68rem', color: '#b09490',
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: '4px 0',
            fontFamily: 'DM Sans, sans-serif',
            textDecoration: 'underline',
          }}
        >
          Cookie Settings
        </button>
      )
    }
    return null
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .cookie-banner-overlay {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(26,18,16,0.35);
          backdrop-filter: blur(2px);
          animation: cb-fade-in 0.3s ease;
        }
        @keyframes cb-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .cookie-banner {
          position: fixed;
          bottom: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999;
          width: min(560px, calc(100vw - 32px));
          background: #ffffff;
          border: 1px solid #e8d5cf;
          border-radius: 16px;
          box-shadow: 0 24px 64px rgba(42,31,29,0.18), 0 4px 16px rgba(42,31,29,0.08);
          font-family: 'DM Sans', sans-serif;
          animation: cb-slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        @keyframes cb-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .cb-header {
          padding: 20px 22px 0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cb-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.05rem; color: #2a1f1d;
          display: flex; align-items: center; gap: 8px;
        }
        .cb-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: #f7ece9; display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .cb-badge {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #4a7a5a;
          background: #eef4f0; border: 1px solid #c0d9c8;
          padding: 2px 8px; border-radius: 20px;
        }

        .cb-body { padding: 14px 22px 0; }
        .cb-desc {
          font-size: 0.82rem; color: #7a5a56; line-height: 1.7;
        }
        .cb-desc a { color: #b05c52; text-decoration: none; }
        .cb-desc a:hover { text-decoration: underline; }

        .cb-details {
          margin-top: 12px;
          border-top: 1px solid #f0e4e0;
          padding-top: 12px;
          animation: cb-expand 0.2s ease;
        }
        @keyframes cb-expand { from { opacity: 0; } to { opacity: 1; } }

        .cb-cookie-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid #f7ece9;
        }
        .cb-cookie-row:last-child { border-bottom: none; }
        .cb-cookie-label {
          font-size: 0.78rem; font-weight: 600; color: #2a1f1d;
          flex: 0 0 120px;
        }
        .cb-cookie-desc { font-size: 0.76rem; color: #7a5a56; line-height: 1.6; flex: 1; }
        .cb-cookie-status {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.8px;
          text-transform: uppercase; padding: 2px 8px; border-radius: 20px;
          white-space: nowrap; flex-shrink: 0; margin-top: 1px;
        }
        .cb-cookie-status.required { background: #eef4f0; color: #4a7a5a; border: 1px solid #c0d9c8; }
        .cb-cookie-status.optional { background: #fff8f0; color: #b07030; border: 1px solid #e8d0b0; }

        .cb-toggle-details {
          background: none; border: none; cursor: pointer;
          font-size: 0.76rem; color: #b09490;
          font-family: 'DM Sans', sans-serif;
          padding: 0; margin-top: 10px;
          display: flex; align-items: center; gap: 4px;
          transition: color 0.2s;
        }
        .cb-toggle-details:hover { color: #b05c52; }

        .cb-actions {
          padding: 16px 22px 20px;
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .cb-btn {
          flex: 1; min-width: 100px;
          padding: 10px 18px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.18s; border: 1px solid transparent;
          white-space: nowrap;
        }
        .cb-btn-accept {
          background: #b05c52; color: #ffffff; border-color: #b05c52;
        }
        .cb-btn-accept:hover { background: #8c3d34; border-color: #8c3d34; }
        .cb-btn-essential {
          background: #eef4f0; color: #4a7a5a; border-color: #c0d9c8;
        }
        .cb-btn-essential:hover { background: #ddeee4; }
        .cb-btn-decline {
          background: transparent; color: #b09490; border-color: #e8d5cf;
        }
        .cb-btn-decline:hover { border-color: #b09490; color: #7a5a56; }

        .cb-footer {
          padding: 0 22px 14px;
          font-size: 0.68rem; color: #b09490; line-height: 1.6;
          border-top: 1px solid #f7ece9; padding-top: 10px; margin-top: 2px;
        }
        .cb-footer a { color: #b05c52; text-decoration: none; }
        .cb-footer a:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .cb-actions { flex-direction: column; }
          .cb-btn { flex: none; width: 100%; }
        }
      `}</style>

      <div className="cookie-banner-overlay" onClick={handleDecline} aria-hidden="true" />

      <div
        className="cookie-banner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cb-title"
        aria-describedby="cb-desc"
      >
        <div className="cb-header">
          <div className="cb-title" id="cb-title">
            <div className="cb-icon">🍪</div>
            Cookie Preferences
          </div>
          <span className="cb-badge">GDPR Compliant</span>
        </div>

        <div className="cb-body">
          <p className="cb-desc" id="cb-desc">
            We use <strong>essential cookies</strong> to keep you signed in and the platform secure — these are always active. With your consent, we also use <strong>optional analytics cookies</strong> (Google Analytics) to understand how the platform is used and improve it. No advertising or cross-site tracking cookies are used. See our{' '}
            <Link href="/cookies">Cookie Policy</Link> for full details.
          </p>

          <button
            className="cb-toggle-details"
            onClick={() => setShowDetails(v => !v)}
            aria-expanded={showDetails}
          >
            {showDetails ? '▲ Hide cookie details' : '▼ Show cookie details'}
          </button>

          {showDetails && (
            <div className="cb-details">
              <div className="cb-cookie-row">
                <span className="cb-cookie-label">Essential</span>
                <span className="cb-cookie-desc">Login session, security tokens, 2FA device trust, consent preference</span>
                <span className="cb-cookie-status required">Always On</span>
              </div>
              <div className="cb-cookie-row">
                <span className="cb-cookie-label">Analytics</span>
                <span className="cb-cookie-desc">Google Analytics 4 — anonymised usage data to improve the platform</span>
                <span className="cb-cookie-status optional">Optional</span>
              </div>
              <div className="cb-cookie-row">
                <span className="cb-cookie-label">Advertising</span>
                <span className="cb-cookie-desc">Retargeting, cross-site tracking, ad network cookies</span>
                <span className="cb-cookie-status required" style={{ background: '#f7ece9', color: '#b05c52', borderColor: '#e8d5cf' }}>Not Used</span>
              </div>
            </div>
          )}
        </div>

        <div className="cb-actions">
          <button className="cb-btn cb-btn-accept" onClick={handleAccept}>
            Accept All
          </button>
          <button className="cb-btn cb-btn-essential" onClick={handleDecline}>
            Essential Only
          </button>
          <button className="cb-btn cb-btn-decline" onClick={handleDecline}>
            Decline
          </button>
        </div>

        <div className="cb-footer">
          By clicking &quot;Accept All&quot; you consent to analytics cookies in addition to essential cookies.
          &quot;Essential Only&quot; or &quot;Decline&quot; means only strictly necessary cookies will be set.
          You can change your preference at any time via the &nbsp;
          <Link href="/cookies">Cookie Policy</Link> or the Cookie Settings link at the bottom of any page.
          Startekk, LLC · 5465 Legacy Drive Suite 650, Plano TX · <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a>
        </div>
      </div>
    </>
  )
}