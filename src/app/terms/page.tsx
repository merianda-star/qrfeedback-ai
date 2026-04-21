import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="page-title">Terms of Service</h1>
        <p className="page-meta">Last updated: March 2026 · Startekk LLC</p>
      </div>

      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box">
            <p>By accessing or using QRFeedback.ai, you agree to be bound by these Terms of Service. Please read them carefully before using the platform. If you do not agree, do not use the service.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>1. About the Service</h2>
          <p>QRFeedback.ai is a customer feedback platform operated by Startekk LLC. The platform allows business owners to collect customer feedback via QR codes, manage responses, and use AI-powered tools to analyse and respond to feedback.</p>
          <p>The service is available through our website at qrfeedback.ai and is intended for use by business owners and their authorised representatives.</p>
        </div>

        <div className="section-block">
          <h2>2. Account Registration</h2>
          <p>To use QRFeedback.ai, you must create an account with a valid email address and password. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us immediately of any unauthorised use of your account</li>
            <li>Ensuring all information you provide is accurate and up to date</li>
          </ul>
          <p>You must be at least 18 years old to create an account. By registering, you represent that you have the authority to enter into these Terms on behalf of yourself or your business.</p>
        </div>

        <div className="section-block">
          <h2>3. Acceptable Use</h2>
          <p>You agree to use QRFeedback.ai only for lawful purposes. You must not:</p>
          <ul>
            <li>Use the platform to collect feedback fraudulently or through deceptive means</li>
            <li>Upload or distribute malicious code, spam, or harmful content</li>
            <li>Attempt to access another user's account or data</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the platform</li>
            <li>Use the service in any way that could damage, disable, or impair the platform</li>
            <li>Resell or sublicense access to the platform without our written consent</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>4. Subscription Plans and Billing</h2>
          <p>QRFeedback.ai offers Free, Pro ($19/month), and Business ($49/month) plans. Paid plans include a 7-day free trial. You will not be charged until the trial period ends.</p>
          <p>Subscriptions are billed monthly and renew automatically. You may cancel at any time. Upon cancellation, your account will downgrade to the Free plan at the end of the current billing period. We do not offer refunds for partial billing periods.</p>
          <p>All payments are processed securely by Stripe. We do not store your payment card information.</p>
        </div>

        <div className="section-block">
          <h2>5. Your Data and Customer Feedback</h2>
          <p>You retain full ownership of all data you create on the platform, including your business information, feedback forms, and customer responses. By using the platform, you grant Startekk LLC a limited licence to store, process, and display your data solely for the purpose of providing the service.</p>
          <p>You are responsible for ensuring you have appropriate consent to collect feedback from your customers. You must not use the platform to collect sensitive personal data such as financial information, health records, or government identification numbers.</p>
        </div>

        <div className="section-block">
          <h2>6. AI Features</h2>
          <p>Pro and Business plan users have access to AI-powered complaint analysis. This feature sends customer feedback data to OpenAI's API for processing. By enabling this feature, you consent to this data being sent to OpenAI in accordance with their usage policies.</p>
          <p>AI-generated summaries and suggested responses are provided for informational purposes only. We make no guarantees regarding the accuracy or suitability of AI-generated content.</p>
        </div>

        <div className="section-block">
          <h2>7. Service Availability</h2>
          <p>We aim to maintain high availability of the platform but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience downtime from time to time. We will make reasonable efforts to notify users of planned maintenance in advance.</p>
        </div>

        <div className="section-block">
          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Startekk LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the platform. Our total liability to you for any claims arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </div>

        <div className="section-block">
          <h2>9. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion. You may delete your account at any time by contacting us. Upon termination, your data will be deleted within 30 days.</p>
        </div>

        <div className="section-block">
          <h2>10. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the platform after changes take effect constitutes your acceptance of the updated Terms.</p>
        </div>

        <div className="section-block">
          <h2>11. Contact Us</h2>
          <p>For questions about these Terms, please contact:</p>
          <p><strong>Startekk LLC</strong><br />
          Email: <a href="mailto:legal@qrfeedback.ai">legal@qrfeedback.ai</a><br />
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