import Link from 'next/link'

export default function PrivacyPage() {
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
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

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
        .highlight-box {
          background: var(--rose-soft); border: 1px solid var(--border);
          border-radius: 10px; padding: 18px 22px; margin-bottom: 14px;
        }
        .highlight-box p { margin-bottom: 0; }

        .footer { padding: 32px 6vw; background: var(--ink); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="page-hero">
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-meta">Last updated: March 2026 · Startekk LLC</p>
      </div>

      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box">
            <p>This Privacy Policy explains how QRFeedback.ai (operated by Startekk LLC) collects, uses, and protects your information. By using our platform, you agree to the practices described here.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, set up feedback forms, or contact us for support.</p>
          <ul>
            <li>Account information — your name, email address, and password when you register</li>
            <li>Business information — your business name, location, type, and Google Review URL</li>
            <li>Profile photo — if you choose to upload one</li>
            <li>Payment information — processed securely by Stripe; we never store card details</li>
            <li>Customer feedback data — responses submitted by your customers via your QR code forms</li>
            <li>Usage data — how you interact with the dashboard (page views, feature usage)</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve the QRFeedback.ai platform.</p>
          <ul>
            <li>To create and manage your account</li>
            <li>To process payments and manage your subscription</li>
            <li>To deliver customer feedback responses to your dashboard</li>
            <li>To send AI-generated complaint summaries and alerts (if enabled)</li>
            <li>To send product updates, invoices, and support communications</li>
            <li>To analyse platform usage and improve our features</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>3. Customer Feedback Data</h2>
          <p>When your customers scan your QR code and submit feedback, that data belongs to you. We store it securely in your account and never share it with third parties, use it for advertising, or sell it.</p>
          <p>Customer feedback is only accessible to you (the account owner) and is protected by row-level security in our database — meaning no other QRFeedback.ai user can access your customers' responses.</p>
        </div>

        <div className="section-block">
          <h2>4. AI Processing</h2>
          <p>On Pro and Business plans, negative feedback responses (1–3 stars) are sent to OpenAI's API for classification, sentiment analysis, and suggested response generation. This processing happens automatically within seconds of submission.</p>
          <p>Data sent to OpenAI includes the customer's survey answers only — no personally identifiable information about the customer is included. OpenAI's data handling is governed by their own privacy policy.</p>
        </div>

        <div className="section-block">
          <h2>5. Data Sharing</h2>
          <p>We do not sell your data. We share information only with the following trusted service providers who help us operate the platform:</p>
          <ul>
            <li><strong>Supabase</strong> — database and authentication (data stored in EU/US regions)</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>OpenAI</strong> — AI complaint analysis (Pro and Business plans only)</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Vercel</strong> — hosting and infrastructure</li>
          </ul>
          <p>We may also disclose information if required by law or to protect the rights and safety of Startekk LLC and its users.</p>
        </div>

        <div className="section-block">
          <h2>6. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. If you cancel your subscription, your account downgrades to the free plan and your data is retained. If you request account deletion, we will delete your data within 30 days, except where we are required to retain it for legal or financial compliance purposes.</p>
        </div>

        <div className="section-block">
          <h2>7. Security</h2>
          <p>We take data security seriously. All data is transmitted over HTTPS, stored in encrypted databases, and protected by row-level security policies. Passwords are hashed and never stored in plain text. We use Supabase's built-in authentication which follows industry-standard security practices.</p>
        </div>

        <div className="section-block">
          <h2>8. Cookies</h2>
          <p>We use essential cookies to keep you logged in and maintain your session. We do not use advertising or tracking cookies. No third-party analytics tools are embedded in the platform that would track you across other websites.</p>
        </div>

        <div className="section-block">
          <h2>9. Your Rights</h2>
          <p>Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete it. To exercise any of these rights, contact us at the email below.</p>
        </div>

        <div className="section-block">
          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
          <p><strong>Startekk LLC</strong><br />
          Email: <a href="mailto:info@qrfeedback.ai">privacy@qrfeedback.ai</a><br />
          Website: <a href="https://qrfeedback.ai">qrfeedback.ai</a></p>
        </div>

      </div>

      <footer className="footer">
        <div className="footer-logo">QRFeedback<span>.ai</span></div>
        <div className="footer-links">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <Link href="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="footer-copy">© 2026 Startekk LLC. All rights reserved.</div>
      </footer>
    </>
  )
}