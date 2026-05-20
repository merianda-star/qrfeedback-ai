import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for QRFeedback.ai by Startekk LLC. GDPR, CCPA, and FTC compliant.',
  alternates: { canonical: 'https://www.qrfeedback.ai/privacy' },
}

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
          --ink: #1a1210; --green: #4a7a5a; --green-soft: #eef4f0;
          --amber: #b07030; --amber-soft: #fff8f0;
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
          border-bottom: 1px solid var(--border); text-align: center;
        }
        .page-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--rose);
          background: var(--surface); border: 1px solid var(--border);
          padding: 5px 14px; border-radius: 20px; margin-bottom: 18px;
        }
        .page-title { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: var(--ink); margin-bottom: 14px; }
        .page-meta { font-size: 0.82rem; color: var(--text-soft); }
        .compliance-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 22px; }
        .compliance-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;
          background: var(--surface); border: 1px solid var(--border);
          padding: 5px 12px; border-radius: 20px; color: var(--text-mid);
        }
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
        .highlight-box.amber { background: var(--amber-soft); border-color: #e8d0b0; }
        .highlight-box p { margin-bottom: 0; }
        .rights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .right-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; }
        .right-card-title { font-weight: 600; font-size: 0.84rem; color: var(--text); margin-bottom: 5px; }
        .right-card-desc { font-size: 0.8rem; color: var(--text-mid); line-height: 1.65; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 0.84rem; }
        .data-table th { text-align: left; padding: 10px 14px; background: var(--rose-soft); color: var(--text); font-weight: 600; font-size: 0.78rem; border-bottom: 1px solid var(--border); }
        .data-table td { padding: 10px 14px; color: var(--text-mid); border-bottom: 1px solid rgba(232,213,207,0.5); line-height: 1.6; vertical-align: top; }
        .data-table tr:last-child td { border-bottom: none; }
        .footer { padding: 32px 6vw; background: var(--ink); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }
        @media (max-width: 600px) { .rights-grid { grid-template-columns: 1fr; } .footer { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="page-hero">
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-meta">Last updated: May 2026 · Startekk, LLC · QRFeedback.ai</p>
        <div className="compliance-bar">
          <span className="compliance-badge"><span className="dot"></span>256-bit SSL Encrypted</span>
          <span className="compliance-badge"><span className="dot"></span>GDPR Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>CCPA / CPRA Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>FTC Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>29 CFR § 1625.2 Compliant</span>
        </div>
      </div>

      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box green">
            <p>At QRFeedback.ai, operated by Startekk, LLC, we are committed to protecting your privacy and being transparent about how we collect, use, and safeguard your personal information. This policy explains our practices in full. By using our platform, you acknowledge this policy. If you do not agree, please discontinue use of the service.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>1. Who We Are</h2>
          <p>QRFeedback.ai is a product of <strong>Startekk, LLC</strong>, a technology company headquartered at 5465 Legacy Drive, Suite 650, Plano, TX 75024. We are the data controller for information collected from registered users of this platform.</p>
          <p>For the purposes of GDPR, our designated Data Protection Officer can be reached at <a href="mailto:dpo@startekk.net">dpo@startekk.net</a>. For product-specific privacy queries, contact <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a>.</p>
          <p>When your customers submit feedback via your QR code forms, you — the business owner — are the data controller for that customer data. Startekk, LLC acts as a data processor on your behalf for those records.</p>
        </div>

        <div className="section-block">
          <h2>2. Information We Collect</h2>
          <p>We collect only the information necessary to provide the QRFeedback.ai service:</p>
          <ul>
            <li><strong>Contact information</strong> — name, email address, phone number (if provided)</li>
            <li><strong>Business information</strong> — business name, location, type, and Google Review URL (if provided)</li>
            <li><strong>Account information</strong> — email address and hashed password; we never store plain-text passwords</li>
            <li><strong>Profile and brand assets</strong> — profile photo and brand logo, only if you choose to upload them</li>
            <li><strong>Payment information</strong> — billing address only; card details are processed exclusively by Stripe and never transmitted to or stored by us</li>
            <li><strong>Customer feedback data</strong> — responses submitted by your customers via your QR code forms, including optional email addresses they voluntarily provide</li>
            <li><strong>Usage data</strong> — pages visited, features used, session timestamps, and device/browser information used to maintain and improve the platform</li>
            <li><strong>Communication data</strong> — messages and support requests you send to us</li>
          </ul>
          <p>We do not collect sensitive personal data such as health records, financial account numbers, biometric data, or government identification numbers, and our platform must not be used to collect such information.</p>
        </div>

        <div className="section-block">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect solely to provide, maintain, and improve the QRFeedback.ai platform:</p>
          <ul>
            <li>To create and manage your account and subscription</li>
            <li>To process payments via Stripe</li>
            <li>To store and display your customer feedback data in your dashboard</li>
            <li>To send AI-generated complaint summaries and alerts where you have enabled these features</li>
            <li>To send transactional communications — invoices, password resets, 2FA codes, weekly digest emails</li>
            <li>To detect and prevent fraudulent or abusive use of the platform</li>
            <li>To analyse aggregate, anonymised usage patterns to improve our features</li>
            <li>To comply with applicable legal obligations</li>
          </ul>
          <p>We do not use your data for advertising purposes. We do not sell your personal information to any third party.</p>
        </div>

        <div className="section-block">
          <h2>4. AI-Powered Services — Important Notice</h2>
          <div className="highlight-box amber">
            <p><strong>⚠ No Guarantees for AI Features.</strong> QRFeedback.ai uses artificial intelligence (OpenAI GPT-4o-mini) to generate complaint summaries, sentiment scores, and suggested reply drafts. These outputs are provided &quot;as is&quot; without any warranty of accuracy, completeness, or reliability. AI-generated content does not constitute professional advice of any kind. All AI outputs must be reviewed by you before acting on them. We are not liable for decisions made based on AI-generated content.</p>
          </div>
          <p>When you use AI features on Pro or Business plans, anonymised feedback text (with no customer PII) is transmitted to OpenAI&apos;s API for processing. This is subject to OpenAI&apos;s own privacy policy. By enabling AI features, you consent to this transmission.</p>
          <p>You may opt out of AI processing at any time by disabling the feature in your dashboard settings or by contacting <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a>.</p>
        </div>

        <div className="section-block">
          <h2>5. Lawful Basis for Processing (GDPR — Article 6)</h2>
          <p>For users in the European Economic Area (EEA), United Kingdom, or Switzerland:</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Processing Activity</th><th>Lawful Basis</th></tr>
              </thead>
              <tbody>
                <tr><td>Account creation and management</td><td>Contract (Art. 6(1)(b))</td></tr>
                <tr><td>Payment processing and subscription management</td><td>Contract (Art. 6(1)(b))</td></tr>
                <tr><td>Delivering feedback data to your dashboard</td><td>Contract (Art. 6(1)(b))</td></tr>
                <tr><td>Transactional emails (invoices, alerts, digests)</td><td>Contract (Art. 6(1)(b))</td></tr>
                <tr><td>AI complaint analysis (Pro/Business plans)</td><td>Legitimate interest (Art. 6(1)(f)) + your consent to the feature</td></tr>
                <tr><td>Platform security and fraud prevention</td><td>Legitimate interest (Art. 6(1)(f))</td></tr>
                <tr><td>Aggregate analytics and platform improvement</td><td>Legitimate interest (Art. 6(1)(f))</td></tr>
                <tr><td>Legal compliance and record-keeping</td><td>Legal obligation (Art. 6(1)(c))</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-block">
          <h2>6. Information Sharing and Third-Party Processors</h2>
          <p>We do not sell your personal information. We share data only with the following service providers who process it on our behalf, each under a data processing agreement:</p>
          <ul>
            <li><strong>Supabase</strong> — database, authentication, and file storage (EU/US regions)</li>
            <li><strong>Stripe</strong> — payment processing; does not receive feedback content or customer PII</li>
            <li><strong>OpenAI</strong> — AI analysis on Pro and Business plans; only anonymised feedback text is sent</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Vercel</strong> — application hosting and infrastructure</li>
          </ul>
          <p>We may disclose information when required by applicable law, court order, or to protect the legal rights and safety of Startekk, LLC and its users. We will notify affected users of any such disclosure where legally permitted.</p>
          <p>In the event of a merger, acquisition, or asset sale, your data may be transferred to the successor entity. We will notify you before your data becomes subject to a different privacy policy.</p>
        </div>

        <div className="section-block">
          <h2>7. International Data Transfers</h2>
          <p>Your data may be transferred to and processed in countries outside your country of residence, including the United States. Where data is transferred internationally, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission or other approved transfer mechanisms. Stripe and Vercel maintain certifications under applicable data transfer frameworks.</p>
        </div>

        <div className="section-block">
          <h2>8. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>All data in transit is encrypted using 256-bit SSL/TLS</li>
            <li>Data at rest is stored in encrypted databases</li>
            <li>Passwords are hashed using bcrypt and never stored in plain text</li>
            <li>Row-level security policies ensure no user can access another user&apos;s data</li>
            <li>Admin access uses a separate JWT authentication system with signed session tokens</li>
            <li>Optional two-factor authentication (email OTP) is available for all accounts</li>
            <li>Access controls and authentication are enforced at all system layers</li>
          </ul>
          <p>No method of transmission over the internet is 100% secure. In the event of a confirmed data breach affecting your personal data, we will notify you and relevant supervisory authorities as required by applicable law.</p>
        </div>

        <div className="section-block">
          <h2>9. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to provide the service and comply with legal obligations:</p>
          <ul>
            <li><strong>Active accounts</strong> — data retained for the life of the account</li>
            <li><strong>Deleted accounts</strong> — personal data deleted within 30 days of account deletion request, except where legal retention is required</li>
            <li><strong>Financial records</strong> — retained for 7 years for tax and legal compliance</li>
            <li><strong>Customer feedback data</strong> — retained for the life of the associated account, then deleted with it</li>
            <li><strong>Usage/analytics data</strong> — anonymised and may be retained indefinitely in aggregate form</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>10. Cookies and Tracking</h2>
          <p>We use essential cookies to maintain your login session and security. We do not use advertising or cross-site tracking cookies. For full details, including how to manage your preferences, please see our <a href="/cookies">Cookie Policy</a>.</p>
        </div>

        <div className="section-block">
          <h2>11. Your Rights — GDPR (EEA / UK / Switzerland)</h2>
          <p>If you are located in the EEA, UK, or Switzerland, you have the following rights. To exercise any of them, contact <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a> or our DPO at <a href="mailto:dpo@startekk.net">dpo@startekk.net</a>. We will respond within 30 days.</p>
          <div className="rights-grid">
            <div className="right-card"><div className="right-card-title">Right of Access</div><div className="right-card-desc">Request a copy of the personal data we hold about you.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Rectification</div><div className="right-card-desc">Request correction of inaccurate or incomplete data.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Erasure</div><div className="right-card-desc">Request deletion where there is no overriding legal basis to retain.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Restriction</div><div className="right-card-desc">Request that we limit processing in certain circumstances.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Portability</div><div className="right-card-desc">Receive your data in a structured, machine-readable format.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Object</div><div className="right-card-desc">Object to processing based on legitimate interests.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Withdraw Consent</div><div className="right-card-desc">Withdraw consent for consent-based processing at any time.</div></div>
            <div className="right-card"><div className="right-card-title">Right to Lodge a Complaint</div><div className="right-card-desc">File a complaint with your local supervisory authority (e.g. ICO in the UK).</div></div>
          </div>
        </div>

        <div className="section-block">
          <h2>12. California Residents — CCPA / CPRA</h2>
          <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>
          <ul>
            <li><strong>Right to Know</strong> — the categories and specific pieces of personal information we have collected about you</li>
            <li><strong>Right to Delete</strong> — request deletion of your personal information, subject to certain exceptions</li>
            <li><strong>Right to Correct</strong> — request correction of inaccurate personal information</li>
            <li><strong>Right to Opt-Out</strong> — we do not sell personal information; this right is not applicable but is acknowledged</li>
            <li><strong>Right to Non-Discrimination</strong> — we will not discriminate against you for exercising your privacy rights</li>
          </ul>
          <p>To exercise your California rights, contact us at <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a> or by phone at <a href="tel:4697133993">(469) 713-3993</a>. We will respond within 45 days as required by law.</p>
        </div>

        <div className="section-block">
          <h2>13. Non-Discrimination (29 CFR § 1625.2)</h2>
          <p>Startekk, LLC does not discriminate in the provision of QRFeedback.ai services on the basis of age, race, colour, national origin, sex, disability, religion, genetic information, or any other characteristic protected under applicable federal, state, or local law, including the Age Discrimination in Employment Act as reflected in 29 CFR § 1625.2. All eligible users receive equal access to the platform and its features on the same terms.</p>
        </div>

        <div className="section-block">
          <h2>14. Children&apos;s Privacy</h2>
          <p>QRFeedback.ai is a business tool intended for users aged 18 and over. We do not knowingly collect personal data from individuals under 18. If you believe a minor has submitted personal data to us, contact <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a> immediately and we will delete it promptly.</p>
        </div>

        <div className="section-block">
          <h2>15. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. Changes will be posted on this page with a new &quot;Last Updated&quot; date. Significant changes will be communicated to registered users via email or prominent in-app notice at least 14 days before taking effect. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
        </div>

        <div className="section-block">
          <h2>16. Contact &amp; Data Protection</h2>
          <p><strong>Startekk, LLC</strong><br />
          5465 Legacy Drive, Suite 650<br />
          Plano, TX 75024<br />
          Phone: <a href="tel:4697133993">(469) 713-3993</a></p>
          <p style={{ marginTop: '12px' }}>
            Privacy enquiries: <a href="mailto:privacy@qrfeedback.ai">privacy@qrfeedback.ai</a><br />
            Data Protection Officer: <a href="mailto:dpo@startekk.net">dpo@startekk.net</a>
          </p>
          <div className="highlight-box green" style={{ marginTop: '16px' }}>
            <p>We aim to respond to all privacy-related requests within 30 days (45 days for California requests). For urgent matters, mark your email subject line <strong>URGENT — Privacy Request</strong>.</p>
          </div>
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