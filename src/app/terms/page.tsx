import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for QRFeedback.ai by Startekk LLC. Governed by the laws of the State of Texas.',
  alternates: { canonical: 'https://www.qrfeedback.ai/terms' },
}

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
          --ink: #1a1210; --green: #4a7a5a; --green-soft: #eef4f0;
          --amber: #b07030; --amber-soft: #fff8f0;
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
        .highlight-box.amber { background: var(--amber-soft); border-color: #e8d0b0; }
        .highlight-box.green { background: var(--green-soft); border-color: #c0d9c8; }
        .highlight-box p { margin-bottom: 0; }
        .footer { padding: 32px 6vw; background: var(--ink); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }
        @media (max-width: 600px) { .footer { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="page-hero">
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Terms of Service</h1>
        <p className="page-meta">Last updated: May 2026 · Startekk, LLC · QRFeedback.ai</p>
        <div className="compliance-bar">
          <span className="compliance-badge"><span className="dot"></span>256-bit SSL Encrypted</span>
          <span className="compliance-badge"><span className="dot"></span>GDPR Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>FTC Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>29 CFR § 1625.2 Compliant</span>
          <span className="compliance-badge"><span className="dot"></span>Texas Governing Law</span>
        </div>
      </div>

      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box amber">
            <p><strong>⚠ Important — Please Read Carefully.</strong> By accessing or using QRFeedback.ai, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these Terms, you must not use the platform.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>1. Acceptance of Terms</h2>
          <p>These Terms of Service (&quot;Terms&quot;) govern your access to and use of QRFeedback.ai (&quot;Platform&quot;, &quot;Service&quot;), a product of <strong>Startekk, LLC</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). QRFeedback.ai is a customer feedback collection platform that enables businesses to collect feedback via QR codes, manage responses, and access AI-powered analysis tools on qualifying plans.</p>
          <p>By creating an account, submitting information, or otherwise accessing the platform, you agree to these Terms and our <a href="/privacy">Privacy Policy</a>. These Terms constitute a legally binding agreement between you and Startekk, LLC.</p>
        </div>

        <div className="section-block">
          <h2>2. Eligibility and Account Registration</h2>
          <p>To use QRFeedback.ai you must be at least 18 years of age and have the legal capacity to enter a binding agreement. By registering, you represent these conditions are met. You are responsible for:</p>
          <ul>
            <li>Providing accurate and complete account information and keeping it up to date</li>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us immediately at <a href="mailto:info@qrfeedback.ai">info@qrfeedback.ai</a> of any unauthorised access to your account</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>3. AI-Powered Services — Critical Disclaimer</h2>
          <div className="highlight-box amber">
            <p><strong>⚠ No Guarantees for AI Services.</strong> QRFeedback.ai provides AI-powered features including complaint analysis, sentiment scoring, and suggested reply generation. These features use artificial intelligence and are <strong>not guaranteed to be 100% accurate</strong>.</p>
          </div>
          <ul>
            <li><strong>No Warranty</strong> — AI-generated results are provided &quot;as is&quot; without any warranty of accuracy, completeness, or reliability</li>
            <li><strong>Human Review Required</strong> — all AI outputs must be reviewed by you before making decisions or sending to customers</li>
            <li><strong>Not Professional Advice</strong> — AI-generated content does not constitute legal, financial, or professional advice of any kind</li>
            <li><strong>Errors Possible</strong> — AI may produce incorrect, incomplete, or contextually inappropriate results</li>
            <li><strong>No Liability</strong> — we are not liable for decisions made based on AI-generated content</li>
          </ul>
          <p>By enabling AI features, you acknowledge and accept these limitations. Feedback text processed by AI is sent to OpenAI&apos;s API subject to their usage policies.</p>
        </div>

        <div className="section-block">
          <h2>4. Non-Discrimination (29 CFR § 1625.2)</h2>
          <p>Startekk, LLC does not discriminate in the provision of QRFeedback.ai services on the basis of age, race, colour, national origin, sex, disability, religion, genetic information, or any other characteristic protected under applicable federal, state, or local law, including the Age Discrimination in Employment Act as reflected in 29 CFR § 1625.2.</p>
          <p>All eligible users have equal access to the platform and its features on the same terms. No user shall be denied service, offered inferior service, or subjected to different pricing on the basis of a protected characteristic.</p>
        </div>

        <div className="section-block">
          <h2>5. FTC Compliance and Honest Representation</h2>
          <p>In accordance with Federal Trade Commission (FTC) guidelines and Section 5 of the FTC Act, Startekk, LLC is committed to truthful, non-deceptive representations of our service:</p>
          <ul>
            <li>All feature descriptions accurately reflect the platform&apos;s current capabilities</li>
            <li>Pricing is presented clearly with no hidden fees</li>
            <li>Where performance data or statistics are referenced, they are based on actual results and presented in context</li>
            <li>AI-generated content is identified as AI-generated and not represented as human-authored opinion</li>
            <li>We do not pay for or incentivise reviews without appropriate disclosure</li>
          </ul>
          <p>Users are also responsible for ensuring their own use of the platform complies with applicable FTC guidelines, including rules on endorsements and advertising disclosures.</p>
        </div>

        <div className="section-block">
          <h2>6. Acceptable Use</h2>
          <p>You agree to use QRFeedback.ai only for lawful purposes and in compliance with all applicable laws and regulations. You must not:</p>
          <ul>
            <li>Use the platform to collect feedback through deceptive, fraudulent, or manipulative means</li>
            <li>Upload, transmit, or distribute malicious code, spam, or harmful content</li>
            <li>Attempt to access another user&apos;s account or data</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the platform</li>
            <li>Use the service in any way that could damage, disable, or impair its operation</li>
            <li>Resell or sublicense access to the platform without our prior written consent</li>
            <li>Use the platform to collect sensitive personal data (health records, financial account numbers, government IDs)</li>
            <li>Violate the privacy rights of any individual whose data is collected through your forms</li>
          </ul>
          <p>Violation of these provisions may result in immediate account suspension or termination without notice.</p>
        </div>

        <div className="section-block">
          <h2>7. Payment Terms</h2>
          <p>QRFeedback.ai offers Free, Pro ($19/month), and Business ($49/month) plans. New Pro accounts receive a 7-day trial period; billing does not begin until the trial ends.</p>
          <ul>
            <li>Paid subscriptions are billed monthly and renew automatically</li>
            <li>You may cancel at any time; your account downgrades to Free at the end of the current billing period</li>
            <li>Refunds are not provided for partial billing periods unless required by applicable law</li>
            <li>All payments are processed by Stripe; we do not store card details</li>
            <li>Late payments may result in service suspension</li>
            <li>We reserve the right to adjust pricing with 30 days&apos; notice to existing subscribers</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>8. Your Data and Customer Feedback</h2>
          <p>You retain full ownership of all data you create on the platform. By using the platform, you grant Startekk, LLC a limited, non-exclusive licence to store, process, and display your data solely for the purpose of providing the service.</p>
          <p>You are solely responsible for:</p>
          <ul>
            <li>Ensuring you have a lawful basis to collect personal data from your customers</li>
            <li>Complying with applicable privacy laws (including GDPR and CCPA where applicable) in your use of the platform</li>
            <li>Maintaining your own customer-facing privacy notice disclosing the use of this platform</li>
            <li>Not collecting sensitive personal data through the feedback forms</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>9. Intellectual Property</h2>
          <p>All intellectual property rights in the QRFeedback.ai platform — including design, code, trademarks, and content — are owned by or licensed to Startekk, LLC. Nothing in these Terms grants you rights in the platform other than the limited right to use it as described.</p>
          <p>You retain all rights in your own content. You grant us a limited licence to use your content solely to provide the service.</p>
        </div>

        <div className="section-block">
          <h2>10. Service Availability — No Uptime Guarantee</h2>
          <p>The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee continuous, uninterrupted, or error-free availability. We may perform maintenance or experience downtime at any time. Where planned maintenance is scheduled, we will make reasonable efforts to notify users in advance.</p>
        </div>

        <div className="section-block">
          <h2>11. Disclaimer of Warranties</h2>
          <p>To the maximum extent permitted by applicable law, QRFeedback.ai and all content, features, and services are provided <strong>&quot;as is&quot;</strong> without warranty of any kind — express or implied — including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the platform will meet your specific requirements or that results will be accurate or reliable.</p>
        </div>

        <div className="section-block">
          <h2>12. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, STARTEKK, LLC AND ITS OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION — ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p>Our total aggregate liability to you for any claims arising under these Terms shall not exceed the total fees paid by you to Startekk, LLC in the 12 months immediately preceding the event giving rise to the claim.</p>
        </div>

        <div className="section-block">
          <h2>13. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Startekk, LLC and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from: (a) your use of the platform in violation of these Terms; (b) your violation of any applicable law or regulation; or (c) any claim by a third party arising from your collection or use of customer data through the platform.</p>
        </div>

        <div className="section-block">
          <h2>14. Termination</h2>
          <p>We may suspend or terminate your access at any time for violations of these Terms, illegal activity, non-payment, or other reasonable cause. Upon termination, your right to access the platform ceases immediately. You may terminate by contacting us. Upon account deletion, your data will be permanently deleted within 30 days, except where retention is required by law. Sections 11, 12, 13, and 15 survive termination.</p>
        </div>

        <div className="section-block">
          <h2>15. Dispute Resolution and Governing Law</h2>
          <p><strong>Governing Law:</strong> These Terms are governed by the laws of the State of Texas, without regard to conflict of law principles.</p>
          <p><strong>Arbitration:</strong> Disputes arising under or related to these Terms shall be resolved through binding arbitration conducted in Dallas County, Texas, except where injunctive or equitable relief is sought. The arbitration shall be administered under the rules of the American Arbitration Association.</p>
          <p>You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</p>
        </div>

        <div className="section-block">
          <h2>16. Changes to These Terms</h2>
          <p>We may modify these Terms at any time. Material changes will be communicated to registered users via email or in-app notice at least 14 days before the updated Terms take effect. The &quot;Last Updated&quot; date at the top of this page reflects the most recent revision. Continued use of the platform after changes take effect constitutes acceptance.</p>
        </div>

        <div className="section-block">
          <h2>17. Contact</h2>
          <p><strong>Startekk, LLC</strong><br />
          5465 Legacy Drive, Suite 650<br />
          Plano, TX 75024<br />
          Phone: <a href="tel:4697133993">(469) 713-3993</a><br />
          Email: <a href="mailto:legal@qrfeedback.ai">legal@qrfeedback.ai</a></p>
          <p style={{ marginTop: '12px' }}>Related policies: <a href="/privacy">Privacy Policy</a> · <a href="/cookies">Cookie Policy</a> · <a href="/disclaimer">Disclaimer</a></p>
        </div>

      </div>

      <footer className="footer">
        <div className="footer-logo">QRFeedback<span>.ai</span></div>
        <div className="footer-links">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <Link href="/cookies" className="footer-link">Cookie Policy</Link>
          <Link href="/accessibility" className="footer-link">Accessibility</Link>
          <Link href="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="footer-copy">© 2026 Startekk, LLC. All rights reserved.</div>
      </footer>
    </>
  )
}