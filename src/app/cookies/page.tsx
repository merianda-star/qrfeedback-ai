import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How QRFeedback.ai uses cookies and similar technologies on our platform.',
  alternates: {
    canonical: 'https://www.qrfeedback.ai/cookies',
  },
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
          --terra: #c4896a; --ink: #1a1210;
          --green: #4a7a5a; --green-soft: #eef4f0;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 6vw; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(253,246,244,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(232,213,207,0.6);
        }
        .nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); text-decoration: none; }
        .nav-logo span { color: var(--rose); }
        .nav-back { font-size: 0.82rem; color: var(--text-soft); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
        .nav-back:hover { color: var(--rose); }

        /* ── Hero ── */
        .page-hero {
          padding: 120px 6vw 60px;
          background: linear-gradient(135deg, var(--bg) 0%, var(--rose-soft) 100%);
          border-bottom: 1px solid var(--border);
          text-align: center;
        }
        .page-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--rose);
          background: var(--surface); border: 1px solid var(--border);
          padding: 5px 14px; border-radius: 20px; margin-bottom: 18px;
        }
        .page-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--ink); margin-bottom: 14px;
        }
        .page-meta { font-size: 0.82rem; color: var(--text-soft); }

        /* ── Content ── */
        .content-wrap {
          max-width: 780px; margin: 0 auto;
          padding: 64px 6vw 96px;
        }
        .section-block { margin-bottom: 48px; }
        .section-block h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.25rem; color: var(--text);
          margin-bottom: 14px; padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
        }
        .section-block p {
          font-size: 0.88rem; color: var(--text-mid);
          line-height: 1.8; margin-bottom: 12px;
        }
        .section-block ul {
          margin: 10px 0 14px 0; padding-left: 0; list-style: none;
        }
        .section-block ul li {
          font-size: 0.88rem; color: var(--text-mid);
          line-height: 1.8; padding: 4px 0 4px 20px;
          position: relative;
        }
        .section-block ul li::before {
          content: ''; position: absolute; left: 0; top: 13px;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--rose);
        }
        .section-block a { color: var(--rose); text-decoration: none; }
        .section-block a:hover { text-decoration: underline; }

        /* ── Highlight boxes ── */
        .highlight-box {
          background: var(--rose-soft); border: 1px solid var(--border);
          border-radius: 10px; padding: 18px 22px; margin-bottom: 14px;
        }
        .highlight-box p { margin-bottom: 0; }
        .highlight-box.green {
          background: var(--green-soft); border-color: #c0d9c8;
        }

        /* ── Cookie type cards ── */
        .cookie-cards { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
        .cookie-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 20px 22px;
          display: grid; grid-template-columns: auto 1fr; gap: 14px 16px;
          align-items: start;
        }
        .cookie-badge {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; padding: 4px 10px; border-radius: 20px;
          white-space: nowrap; margin-top: 2px;
        }
        .cookie-badge.essential { background: #eef4f0; color: var(--green); border: 1px solid #c0d9c8; }
        .cookie-badge.analytics { background: #fff8f0; color: #b07030; border: 1px solid #e8d0b0; }
        .cookie-badge.none { background: var(--rose-soft); color: var(--rose); border: 1px solid var(--border); }
        .cookie-card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1rem; color: var(--text); margin-bottom: 6px;
        }
        .cookie-card-desc {
          font-size: 0.85rem; color: var(--text-mid); line-height: 1.7;
          margin-bottom: 10px;
        }
        .cookie-examples {
          display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;
        }
        .cookie-example {
          font-size: 0.72rem; font-family: 'DM Sans', monospace;
          background: var(--bg); border: 1px solid var(--border);
          padding: 2px 8px; border-radius: 4px; color: var(--text-soft);
        }

        /* ── Table ── */
        .cookie-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 0.84rem; }
        .cookie-table th {
          text-align: left; padding: 10px 14px;
          background: var(--rose-soft); color: var(--text);
          font-weight: 600; font-size: 0.78rem; letter-spacing: 0.3px;
          border-bottom: 1px solid var(--border);
        }
        .cookie-table td {
          padding: 10px 14px; color: var(--text-mid);
          border-bottom: 1px solid rgba(232,213,207,0.5);
          line-height: 1.6; vertical-align: top;
        }
        .cookie-table tr:last-child td { border-bottom: none; }
        .cookie-table code {
          font-size: 0.78rem; background: var(--bg); border: 1px solid var(--border);
          padding: 1px 6px; border-radius: 4px; color: var(--rose-dark);
        }

        /* ── Footer ── */
        .footer {
          padding: 32px 6vw; background: var(--ink);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }

        @media (max-width: 600px) {
          .cookie-card { grid-template-columns: 1fr; }
          .cookie-table { font-size: 0.78rem; }
          .cookie-table th, .cookie-table td { padding: 8px 10px; }
          .footer { flex-direction: column; align-items: flex-start; }
          .footer-links { flex-wrap: wrap; gap: 14px; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Cookie Policy</h1>
        <p className="page-meta">Last updated: May 2026 · Startekk LLC</p>
      </div>

      {/* ── Content ── */}
      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box">
            <p>This Cookie Policy explains what cookies are, which ones QRFeedback.ai uses, why we use them, and what choices you have. By continuing to use our platform, you consent to our use of cookies as described here.</p>
          </div>
        </div>

        {/* 1 */}
        <div className="section-block">
          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files that a website places on your device when you visit. They are widely used to make websites work properly, to remember your preferences, and to give site owners information about how people use their service.</p>
          <p>Cookies set by the website you are visiting are called <strong>first-party cookies</strong>. Cookies set by other parties (for example, analytics providers) are called <strong>third-party cookies</strong>.</p>
        </div>

        {/* 2 */}
        <div className="section-block">
          <h2>2. Cookies We Use</h2>
          <p>QRFeedback.ai uses a minimal set of cookies. We do not use advertising cookies, retargeting cookies, or any cookies that track you across other websites.</p>

          <div className="cookie-cards">

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Authentication &amp; Session</div>
                <div className="cookie-card-desc">
                  These cookies keep you logged in to your dashboard. Without them, you would need to sign in on every page visit. They are set when you log in and expire when you sign out or after a period of inactivity. These cookies are strictly necessary — the platform cannot function without them.
                </div>
                <div className="cookie-examples">
                  <span className="cookie-example">sb-access-token</span>
                  <span className="cookie-example">sb-refresh-token</span>
                  <span className="cookie-example">qrf_admin_session</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Security &amp; CSRF Protection</div>
                <div className="cookie-card-desc">
                  These cookies help protect against cross-site request forgery (CSRF) attacks and other security threats. They are set automatically and do not store any personal information. They are required for safe form submissions and API calls.
                </div>
                <div className="cookie-examples">
                  <span className="cookie-example">__Host-next-auth.csrf-token</span>
                  <span className="cookie-example">sb-auth-token-code-verifier</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge essential">Essential</span>
              <div>
                <div className="cookie-card-title">Trusted Device (2FA)</div>
                <div className="cookie-card-desc">
                  If you use two-factor authentication and choose to trust your device for 30 days, we store a cookie to remember that decision so you are not asked to verify again on the same device within that period.
                </div>
                <div className="cookie-examples">
                  <span className="cookie-example">qrf_trusted_device</span>
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge none">Not Used</span>
              <div>
                <div className="cookie-card-title">Advertising &amp; Tracking Cookies</div>
                <div className="cookie-card-desc">
                  We do not use advertising cookies, tracking pixels, retargeting cookies, or any cookie that follows you across other websites. No ad network has access to your browsing behaviour through our platform.
                </div>
              </div>
            </div>

            <div className="cookie-card">
              <span className="cookie-badge analytics">Planned — Optional</span>
              <div>
                <div className="cookie-card-title">Analytics (Google Analytics 4)</div>
                <div className="cookie-card-desc">
                  We intend to add Google Analytics 4 in a future release to help us understand which features are used most and how people navigate the platform. When enabled, GA4 will set cookies to count visits and measure engagement. This will be opt-in — we will ask for your consent before activating analytics cookies, and you will be able to withdraw consent at any time.
                </div>
                <div className="cookie-examples">
                  <span className="cookie-example">_ga</span>
                  <span className="cookie-example">_ga_XXXXXXXXXX</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3 */}
        <div className="section-block">
          <h2>3. Cookie Details at a Glance</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="cookie-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>sb-access-token</code></td>
                  <td>Essential</td>
                  <td>Supabase authentication token — keeps you logged in</td>
                  <td>1 hour (refreshed automatically)</td>
                </tr>
                <tr>
                  <td><code>sb-refresh-token</code></td>
                  <td>Essential</td>
                  <td>Refreshes your access token silently in the background</td>
                  <td>60 days</td>
                </tr>
                <tr>
                  <td><code>qrf_admin_session</code></td>
                  <td>Essential</td>
                  <td>Admin panel JWT session — only set for admin users</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td><code>qrf_trusted_device</code></td>
                  <td>Essential</td>
                  <td>Remembers your device after 2FA verification</td>
                  <td>30 days</td>
                </tr>
                <tr>
                  <td><code>sb-auth-token-code-verifier</code></td>
                  <td>Essential</td>
                  <td>PKCE code verifier for secure OAuth flow</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td><code>_ga</code></td>
                  <td>Analytics (planned)</td>
                  <td>Distinguishes unique users in Google Analytics</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td><code>_ga_*</code></td>
                  <td>Analytics (planned)</td>
                  <td>Maintains GA4 session state</td>
                  <td>2 years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 */}
        <div className="section-block">
          <h2>4. Local Storage</h2>
          <p>In addition to cookies, QRFeedback.ai uses your browser's <strong>local storage</strong> for a small number of preferences — for example, remembering whether you have dismissed the trial expiry banner. Local storage is not sent to our servers and is stored entirely on your device.</p>
        </div>

        {/* 5 */}
        <div className="section-block">
          <h2>5. Third-Party Cookies on the Feedback Form</h2>
          <p>When your customers scan your QR code and open the feedback form, the page is served from <strong>qrfeedback.ai</strong>. We do not embed any third-party widgets, social media buttons, or advertising scripts on the customer-facing feedback form, so no third-party cookies are set on your customers' devices through our form.</p>
        </div>

        {/* 6 */}
        <div className="section-block">
          <h2>6. How to Manage Cookies</h2>
          <p>Because the cookies we currently set are all essential for the platform to function, you cannot opt out of them while continuing to use QRFeedback.ai. If you would like to remove them, you can do so through your browser settings.</p>
          <p>Here is how to manage cookies in the most common browsers:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a> — Settings → Privacy and security → Cookies and other site data</li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a> — Settings → Privacy &amp; Security → Cookies and Site Data</li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer">Apple Safari</a> — Preferences → Privacy → Manage Website Data</li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a> — Settings → Cookies and site permissions → Manage and delete cookies</li>
          </ul>
          <p>Please note that clearing cookies will log you out of your QRFeedback.ai account.</p>
          <div className="highlight-box green">
            <p>When we introduce optional analytics cookies in the future, we will display a cookie consent banner that allows you to accept or decline them before any analytics cookies are set.</p>
          </div>
        </div>

        {/* 7 */}
        <div className="section-block">
          <h2>7. Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time, for example when we add new features or if legal requirements change. When we make significant changes, we will update the date at the top of this page and, where appropriate, notify you by email or in-app banner. We encourage you to review this page periodically.</p>
        </div>

        {/* 8 */}
        <div className="section-block">
          <h2>8. Contact Us</h2>
          <p>If you have any questions about how we use cookies or this policy, please get in touch:</p>
          <p>
            <strong>Startekk LLC</strong><br />
            Email: <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a><br />
            Website: <a href="https://www.qrfeedback.ai">www.qrfeedback.ai</a>
          </p>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-logo">QRFeedback<span>.ai</span></div>
        <div className="footer-links">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <Link href="/cookies" className="footer-link">Cookie Policy</Link>
          <Link href="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="footer-copy">© 2026 Startekk LLC. All rights reserved.</div>
      </footer>
    </>
  )
}