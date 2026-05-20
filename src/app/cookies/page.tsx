import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for QRFeedback.ai by Startekk LLC. We use only essential cookies. No advertising or tracking cookies.',
  alternates: { canonical: 'https://www.qrfeedback.ai/cookies' },
}

export default function CookiePolicyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #fdf6f4; --surface: #ffffff; --border: #e8d5cf;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --ink: #1a1210; --green: #4a7a5a; --green-soft: #eef4f0;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 6vw; height: 64px; display: flex; align-items: center; justify-content: space-between; background: rgba(253,246,244,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(232,213,207,0.6); }
        .nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); text-decoration: none; }
        .nav-logo span { color: var(--rose); }
        .nav-back { font-size: 0.82rem; color: var(--text-soft); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
        .nav-back:hover { color: var(--rose); }
        .page-hero { padding: 120px 6vw 60px; background: linear-gradient(135deg, var(--bg) 0%, var(--rose-soft) 100%); border-bottom: 1px solid var(--border); text-align: center; }
        .page-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--rose); background: var(--surface); border: 1px solid var(--border); padding: 5px 14px; border-radius: 20px; margin-bottom: 18px; }
        .page-title { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: var(--ink); margin-bottom: 14px; }
        .page-meta { font-size: 0.82rem; color: var(--text-soft); }
        .compliance-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 22px; }
        .compliance-badge { display: inline-flex; align-items: center; gap: 7px; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; background: var(--surface); border: 1px solid var(--border); padding: 5px 12px; border-radius: 20px; color: var(--text-mid); }
        .compliance-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
        .content-wrap { max-width: 780px; margin: 0 auto; padding: 64px 6vw 96px; }
        .section-block { margin-bottom: 48px; }
        .section-block h2 { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: var(--text); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .section-block p { font-size: 0.88rem; color: var(--text-mid); line-height: 1.8; margin-bottom: 12px; }
        .section-block ul { margin: 10px 0 14px 0; padding-left: 0; list-style: none; }
        .section-block ul li { font-size: 0.88rem; color: var(--text-mid); line-height: 1.8; padding: 4px 0 4px 20px; position: relative; }
        .section-block ul li::before { content: ''; position: absolute; left: 0; top: 13px; width: 6px; height: 6px; border-radius: 50%; background: var(--rose); }
        .section-block a { color: var(--rose); text-decoration: none; }
        .section-block a:hover { text-decoration: underline; }
        .highlight-box { background: var(--rose-soft); border: 1px solid var(--border); border-radius: 10px; padding: 18px 22px; margin-bottom: 14px; }
        .highlight-box.green { background: var(--green-soft); border-color: #c0d9c8; }
        .highlight-box p { margin-bottom: 0; }
        .cookie-cards { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
        .cookie-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px 22px; display: grid; grid-template-columns: auto 1fr; gap: 14px 16px; align-items: start; }
        .cookie-badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; white-space: nowrap; margin-top: 2px; }
        .cookie-badge.essential { background: #eef4f0; color: var(--green); border: 1px solid #c0d9c8; }
        .cookie-badge.analytics { background: #fff8f0; color: #b07030; border: 1px solid #e8d0b0; }
        .cookie-badge.none { background: var(--rose-soft); color: var(--rose); border: 1px solid var(--border); }
        .cookie-card-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); margin-bottom: 6px; }
        .cookie-card-desc { font-size: 0.85rem; color: var(--text-mid); line-height: 1.7; }
        .cookie-examples { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .cookie-example { font-size: 0.72rem; font-family: monospace; background: var(--bg); border: 1px solid var(--border); padding: 2px 8px; border-radius: 4px; color: var(--text-soft); }
        .cookie-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 0.84rem; }
        .cookie-table th { text-align: left; padding: 10px 14px; background: var(--rose-soft); color: var(--text); font-weight: 600; font-size: 0.78rem; border-bottom: 1px solid var(--border); }
        .cookie-table td { padding: 10px 14px; color: var(--text-mid); border-bottom: 1px solid rgba(232,213,207,0.5); line-height: 1.6; vertical-align: top; }
        .cookie-table tr:last-child td { border-bottom: none; }
        .cookie-table code { font-size: 0.78rem; background: var(--bg); border: 1px solid var(--border); padding: 1px 6px; border-radius: 4px; color: var(--rose-dark); }
        .footer { padding: 32px 6vw; background: var(--ink); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }
        @media (max-width: 600px) { .cookie-card { grid-template-columns: 1fr; } .cookie-table { font-size: 0.78rem; } .footer { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="page-hero">
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Cookie Policy</h1>
        <p className="page-meta">Last updated: May 2026 · Startekk, LLC · QRFeedback.ai</p>
        <div className="compliance-bar">
          <span className="compliance-badge"><span className="dot"></span>GDPR Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>Essential Cookies Only</span>
          <span className="compliance-badge"><span className="dot"></span>No Tracking Cookies</span>
          <span className="compliance-badge"><span className="dot"></span>256-bit SSL Encrypted</span>
        </div>
      </div>

      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box green">
            <p>QRFeedback.ai currently uses only essential cookies required for the platform to function. We do not use advertising cookies, cross-site tracking cookies, or analytics cookies. No cookie data is sold or shared with third parties for commercial purposes. You can manage your preferences at any time via our cookie consent banner or your browser settings.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device by a website when you visit. They are used to keep you logged in, remember your preferences, and help site operators understand how their service is used.</p>
          <p>QRFeedback.ai sets only <strong>first-party cookies</strong> — cookies set directly by our platform. We do not allow third-party advertising networks or tracking services to set cookies through our platform.</p>
        </div>

        <div className="section-block">
          <h2>2. Types of Cookies We Use</h2>

          <div className="cookie-cards">
            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Session Authentication</div>
                <div className="cookie-card-desc">Maintains your login state while you use the dashboard. Required for the platform to function. Set on login, cleared on sign-out or expiry.</div>
                <div className="cookie-examples">
                  <span className="cookie-example">sb-access-token</span>
                  <span className="cookie-example">sb-refresh-token</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Security — PKCE Auth Flow</div>
                <div className="cookie-card-desc">A short-lived session cookie used during the secure OAuth/PKCE authentication flow. Automatically cleared after login completes. Stores no personal information.</div>
                <div className="cookie-examples">
                  <span className="cookie-example">sb-auth-token-code-verifier</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Admin Session</div>
                <div className="cookie-card-desc">A JWT-signed session cookie set only for authorised platform administrators. Never set on standard user accounts.</div>
                <div className="cookie-examples">
                  <span className="cookie-example">qrf_admin_session</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Trusted Device (2FA)</div>
                <div className="cookie-card-desc">If you use two-factor authentication and choose to trust your device for 30 days, this cookie stores that preference. You can revoke it at any time by signing out.</div>
                <div className="cookie-examples">
                  <span className="cookie-example">qrf_trusted_device</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Cookie Consent Preference</div>
                <div className="cookie-card-desc">Stores your cookie consent decision so the consent banner does not reappear on subsequent visits. This cookie itself requires no consent as it records your expressed preference.</div>
                <div className="cookie-examples">
                  <span className="cookie-example">qrf_cookie_consent</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge analytics">Optional — Requires Consent</span>
              <div>
                <div className="cookie-card-title">Analytics (Google Analytics 4)</div>
                <div className="cookie-card-desc">If you accept analytics cookies via our consent banner, Google Analytics 4 will be enabled to help us understand platform usage. IP addresses are anonymised. You can withdraw consent at any time through the cookie settings link in our footer.</div>
                <div className="cookie-examples">
                  <span className="cookie-example">_ga</span>
                  <span className="cookie-example">_gid</span>
                  <span className="cookie-example">_ga_XXXXXXXXXX</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge none">Not Used</span>
              <div>
                <div className="cookie-card-title">Advertising &amp; Cross-Site Tracking</div>
                <div className="cookie-card-desc">We do not use advertising cookies, retargeting pixels, or any cookies that track your activity across other websites. No ad network has access to your browsing behaviour through our platform.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-block">
          <h2>3. Cookie Reference Table</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="cookie-table">
              <thead>
                <tr><th>Cookie Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr><td><code>sb-access-token</code></td><td>Essential</td><td>Supabase auth — keeps you signed in</td><td>1 hour (auto-refreshed)</td></tr>
                <tr><td><code>sb-refresh-token</code></td><td>Essential</td><td>Silently refreshes your access token</td><td>60 days</td></tr>
                <tr><td><code>sb-auth-token-code-verifier</code></td><td>Essential</td><td>PKCE verifier for secure login flow</td><td>Session</td></tr>
                <tr><td><code>qrf_admin_session</code></td><td>Essential</td><td>Admin JWT session — admin accounts only</td><td>Session</td></tr>
                <tr><td><code>qrf_trusted_device</code></td><td>Essential</td><td>Remembers device after 2FA (if opted in)</td><td>30 days</td></tr>
                <tr><td><code>qrf_cookie_consent</code></td><td>Essential</td><td>Stores your cookie consent preference</td><td>1 year</td></tr>
                <tr><td><code>_ga</code></td><td>Analytics (optional)</td><td>Google Analytics — user identification</td><td>2 years</td></tr>
                <tr><td><code>_gid</code></td><td>Analytics (optional)</td><td>Google Analytics — session identification</td><td>24 hours</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-block">
          <h2>4. Managing Your Cookie Preferences</h2>
          <p>You have several ways to control cookies:</p>
          <ul>
            <li><strong>Cookie Banner</strong> — use our consent banner (shown on first visit) to accept, decline, or customise which cookies you allow</li>
            <li><strong>Cookie Settings Link</strong> — available in the footer of every page to update your preferences at any time</li>
            <li><strong>Browser Settings</strong> — you can view, block, or delete cookies via your browser; note that blocking essential cookies will prevent the platform from functioning</li>
          </ul>
          <p>Browser cookie management guides:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>
          <p>To opt out of Google Analytics tracking specifically, you may also use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>
        </div>

        <div className="section-block">
          <h2>5. GDPR — Lawful Basis</h2>
          <p>Under GDPR and the ePrivacy Directive, strictly necessary cookies do not require prior consent as they are essential to deliver a service explicitly requested by the user. All essential cookies listed in this policy fall into this category.</p>
          <p>Optional analytics cookies are only set after you have provided explicit consent via our cookie banner. You may withdraw that consent at any time through the Cookie Settings link in the footer.</p>
        </div>

        <div className="section-block">
          <h2>6. Cookies on the Customer Feedback Form</h2>
          <p>When your customers scan your QR code and open the feedback form, no cookies are set on their devices. The feedback form does not load any tracking scripts, advertising tags, or third-party widgets. Customer feedback is submitted anonymously unless they voluntarily provide their email address.</p>
        </div>

        <div className="section-block">
          <h2>7. Local Storage</h2>
          <p>In addition to cookies, the platform uses browser local storage for UI preferences, such as remembering whether you have dismissed the trial expiry banner. Local storage data is stored entirely on your device and is never transmitted to our servers.</p>
        </div>

        <div className="section-block">
          <h2>8. Changes to This Policy</h2>
          <p>We may update this Cookie Policy when we change how the platform works or add new features. We will update the &quot;Last Updated&quot; date at the top of this page. If any change introduces new non-essential cookies, we will seek your fresh consent before setting them.</p>
        </div>

        <div className="section-block">
          <h2>9. Contact</h2>
          <p><strong>Startekk, LLC</strong><br />
          5465 Legacy Drive, Suite 650<br />
          Plano, TX 75024<br />
          Phone: <a href="tel:4697133993">(469) 713-3993</a><br />
          Email: <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a></p>
        </div>

      </div>

      <footer className="footer">
        <div className="footer-logo">QRFeedback<span>.ai</span></div>
        <div className="footer-links">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <Link href="/cookies" className="footer-link">Cookie Policy</Link>
          <Link href="/disclaimer" className="footer-link">Disclaimer</Link>
          <Link href="/accessibility" className="footer-link">Accessibility</Link>
          <Link href="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="footer-copy">© 2026 Startekk, LLC. All rights reserved.</div>
      </footer>
    </>
  )
}