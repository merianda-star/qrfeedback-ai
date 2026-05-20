'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ConsentState = 'accepted' | 'declined' | null

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('qrf_cookie_consent') as ConsentState
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored)
    } else {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('qrf_cookie_consent', 'accepted')
    setConsent('accepted')
    setVisible(false)
    // ── Activate GA4 analytics when user accepts ─────────────────────────
    // When you uncomment the GA4 scripts in src/app/layout.tsx, also
    // uncomment the two lines below so GA4 fires only after consent:
    //
    // window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    // window.gtag?.('event', 'page_view', { page_path: window.location.pathname })
    // ─────────────────────────────────────────────────────────────────────
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

  // After consent — show a small "Cookie Settings" link in the corner
  if (!visible) {
    if (consent !== null) {
      return (
        <button
          onClick={handleReset}
          aria-label="Manage cookie preferences"
          style={{
            position: 'fixed', bottom: '14px', left: '16px', zIndex: 999,
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .cb-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 9999;
          background: #1e1412;
          border-top: 1px solid rgba(232,213,207,0.12);
          padding: 16px 5vw;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          font-family: 'DM Sans', sans-serif;
          animation: cb-rise 0.3s ease;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
        }
        @keyframes cb-rise {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .cb-text {
          flex: 1;
          min-width: 260px;
        }
        .cb-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(245,237,232,0.9);
          margin-bottom: 4px;
          letter-spacing: 0.2px;
        }
        .cb-desc {
          font-size: 0.76rem;
          color: rgba(245,237,232,0.45);
          line-height: 1.6;
          max-width: 680px;
        }
        .cb-desc a {
          color: #c4896a;
          text-decoration: none;
        }
        .cb-desc a:hover { text-decoration: underline; }

        .cb-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .cb-btn {
          padding: 9px 20px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .cb-btn-decline {
          background: transparent;
          color: rgba(245,237,232,0.55);
          border-color: rgba(232,213,207,0.2);
        }
        .cb-btn-decline:hover {
          border-color: rgba(232,213,207,0.45);
          color: rgba(245,237,232,0.85);
        }
        .cb-btn-accept {
          background: #b05c52;
          color: #ffffff;
          border-color: #b05c52;
        }
        .cb-btn-accept:hover {
          background: #8c3d34;
          border-color: #8c3d34;
        }

        @media (max-width: 600px) {
          .cb-bar { padding: 14px 5vw 18px; }
          .cb-actions { width: 100%; }
          .cb-btn { flex: 1; text-align: center; }
        }
      `}</style>

      <div
        className="cb-bar"
        role="region"
        aria-label="Cookie consent"
      >
        <div className="cb-text">
          <div className="cb-title">GDPR &amp; Privacy Compliance</div>
          <p className="cb-desc">
            We use strictly necessary cookies to keep the platform running (256-bit SSL secured).
            We also use optional analytics cookies (Google Analytics) to improve your experience.
            We do not sell your data. &nbsp;
            <Link href="/cookies">Cookie Policy</Link>
            &nbsp;·&nbsp;
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </div>

        <div className="cb-actions">
          <button className="cb-btn cb-btn-decline" onClick={handleDecline}>
            Reject Optional
          </button>
          <button className="cb-btn cb-btn-accept" onClick={handleAccept}>
            Accept All
          </button>
        </div>
      </div>
    </>
  )
}