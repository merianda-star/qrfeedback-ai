import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'QRFeedback.ai accessibility statement. We aim to conform to WCAG 2.1 Level AA standards.',
  alternates: { canonical: 'https://www.qrfeedback.ai/accessibility' },
}

export default function AccessibilityPage() {
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
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; }
        .feature-card-title { font-weight: 600; font-size: 0.84rem; color: var(--text); margin-bottom: 5px; }
        .feature-card-desc { font-size: 0.8rem; color: var(--text-mid); line-height: 1.65; }
        .footer { padding: 32px 6vw; background: var(--ink); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }
        @media (max-width: 600px) { .feature-grid { grid-template-columns: 1fr; } .footer { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="page-hero">
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Accessibility Statement</h1>
        <p className="page-meta">Last updated: May 2026 · Startekk, LLC · QRFeedback.ai</p>
        <div className="compliance-bar">
          <span className="compliance-badge"><span className="dot"></span>WCAG 2.1 Level AA Target</span>
          <span className="compliance-badge"><span className="dot"></span>Keyboard Navigable</span>
          <span className="compliance-badge"><span className="dot"></span>Screen Reader Compatible</span>
        </div>
      </div>

      <div className="content-wrap">

        <div className="section-block">
          <div className="highlight-box green">
            <p>Startekk, LLC is committed to ensuring digital accessibility for people with disabilities across all its products, including QRFeedback.ai. We are continually working to improve the user experience for everyone and to apply relevant accessibility standards.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>1. Conformance Status</h2>
          <p>We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>. These guidelines explain how to make web content more accessible to people with disabilities. Conformance with these guidelines is ongoing and we recognise that some areas of the platform may not yet fully meet this standard.</p>
        </div>

        <div className="section-block">
          <h2>2. Accessibility Features</h2>
          <div className="feature-grid">
            <div className="feature-card"><div className="feature-card-title">Keyboard Navigation</div><div className="feature-card-desc">Full site navigation is available without a mouse using standard keyboard controls.</div></div>
            <div className="feature-card"><div className="feature-card-title">Screen Reader Compatibility</div><div className="feature-card-desc">Designed for compatibility with JAWS, NVDA, and VoiceOver screen readers.</div></div>
            <div className="feature-card"><div className="feature-card-title">Alt Text</div><div className="feature-card-desc">Descriptive alternative text is provided for meaningful images throughout the platform.</div></div>
            <div className="feature-card"><div className="feature-card-title">Colour Contrast</div><div className="feature-card-desc">Sufficient contrast ratios are maintained between text and background colours for readability.</div></div>
            <div className="feature-card"><div className="feature-card-title">Resizable Text</div><div className="feature-card-desc">Text can be resized up to 200% without loss of content or functionality.</div></div>
            <div className="feature-card"><div className="feature-card-title">Clear Heading Structure</div><div className="feature-card-desc">Logical heading hierarchy is used throughout for easy navigation with assistive technologies.</div></div>
            <div className="feature-card"><div className="feature-card-title">Form Labels</div><div className="feature-card-desc">All form fields include clear labels and instructions to assist all users.</div></div>
            <div className="feature-card"><div className="feature-card-title">Focus Indicators</div><div className="feature-card-desc">Visible focus indicators are maintained for keyboard users throughout the interface.</div></div>
          </div>
        </div>

        <div className="section-block">
          <h2>3. Assistive Technologies Supported</h2>
          <p>QRFeedback.ai is designed to be compatible with:</p>
          <ul>
            <li>Screen readers — JAWS, NVDA, VoiceOver</li>
            <li>Screen magnification software</li>
            <li>Speech recognition software</li>
            <li>Keyboard-only navigation</li>
            <li>Alternative input devices</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>4. Technical Approach</h2>
          <p>The accessibility of QRFeedback.ai relies on the following technologies for conformance:</p>
          <ul>
            <li>HTML5 with semantic markup</li>
            <li>CSS3 for layout and presentation</li>
            <li>JavaScript for interactive components</li>
            <li>ARIA (Accessible Rich Internet Applications) attributes where appropriate</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>5. Known Limitations</h2>
          <p>Despite our best efforts, some areas of the platform may not yet be fully accessible. Known limitations include:</p>
          <ul>
            <li>Some complex interactive dashboard elements — such as QR code customisation controls and chart components — are still being improved for full keyboard and screen reader accessibility</li>
            <li>Some third-party embedded content (e.g. Stripe payment forms) may not fully meet our accessibility standards, as these are controlled by external providers</li>
            <li>PDF exports generated by the platform may not be fully accessible to screen readers</li>
          </ul>
          <p>We are actively working to address these limitations. If you encounter a barrier not listed here, please contact us.</p>
        </div>

        <div className="section-block">
          <h2>6. Assessment Approach</h2>
          <p>Startekk, LLC assesses the accessibility of QRFeedback.ai through:</p>
          <ul>
            <li>Self-evaluation against WCAG 2.1 Level AA criteria</li>
            <li>Automated accessibility testing tools</li>
            <li>Manual testing with assistive technologies</li>
            <li>Ongoing review as new features are developed</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>7. Continuous Improvement</h2>
          <p>Accessibility is an ongoing commitment. We are dedicated to:</p>
          <ul>
            <li>Incorporating accessibility requirements into our development process from the start</li>
            <li>Regular reviews against WCAG 2.1 Level AA standards</li>
            <li>Training our team on accessible design and development practices</li>
            <li>Staying current with evolving accessibility standards</li>
            <li>Responding promptly to user feedback about accessibility barriers</li>
          </ul>
        </div>

        <div className="section-block">
          <h2>8. Feedback and Contact</h2>
          <p>We welcome feedback on the accessibility of QRFeedback.ai. If you encounter an accessibility barrier, have a suggestion for improvement, or require content in an alternative format, please contact us:</p>
          <p>
            <strong>Startekk, LLC — Accessibility</strong><br />
            Email: <a href="mailto:accessibility@startekk.net">accessibility@startekk.net</a><br />
            Phone: <a href="tel:4697133993">(469) 713-3993</a><br />
            Mail: 5465 Legacy Drive, Suite 650, Plano, TX 75024
          </p>
          <div className="highlight-box green" style={{ marginTop: '16px' }}>
            <p>We aim to respond to accessibility feedback within <strong>5 business days</strong> and to propose a solution within <strong>10 business days</strong>.</p>
          </div>
        </div>

        <div className="section-block">
          <h2>9. Formal Complaints</h2>
          <p>If you are not satisfied with our response to an accessibility issue, you may file a complaint with the appropriate regulatory authority in your jurisdiction. In the United States, accessibility complaints related to digital services may be directed to the U.S. Department of Justice Civil Rights Division.</p>
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