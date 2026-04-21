'use client'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #fdf6f4; --surface: #ffffff; --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --ink: #1a1210; --green: #4a7a5a; --green-soft: #edf4ef;
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
        .page-sub { font-size: 1rem; color: var(--text-mid); max-width: 480px; margin: 0 auto; line-height: 1.7; }

        .content-wrap {
          max-width: 900px; margin: 0 auto;
          padding: 64px 6vw 96px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;
        }

        /* Contact cards */
        .contact-cards { display: flex; flex-direction: column; gap: 16px; }
        .contact-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 22px 24px;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .contact-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--rose), var(--terra));
          opacity: 0; transition: opacity 0.2s;
        }
        .contact-card:hover { box-shadow: 0 6px 24px rgba(176,92,82,0.1); transform: translateY(-2px); }
        .contact-card:hover::before { opacity: 1; }
        .contact-card-icon { font-size: 1.4rem; margin-bottom: 10px; }
        .contact-card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 0.95rem; color: var(--text); margin-bottom: 6px;
        }
        .contact-card-desc { font-size: 0.8rem; color: var(--text-soft); line-height: 1.6; margin-bottom: 12px; }
        .contact-card-link {
          font-size: 0.82rem; font-weight: 600; color: var(--rose);
          text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
          transition: gap 0.2s;
        }
        .contact-card-link:hover { gap: 8px; }

        .contact-info { margin-top: 28px; }
        .contact-info-title {
          font-family: 'DM Serif Display', serif;
          font-size: 0.85rem; color: var(--text-soft);
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .contact-info-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid var(--border);
        }
        .contact-info-item:last-child { border-bottom: none; }
        .contact-info-icon { font-size: 1rem; margin-top: 1px; flex-shrink: 0; }
        .contact-info-label { font-size: 0.72rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .contact-info-val { font-size: 0.85rem; color: var(--text); font-weight: 500; }
        .contact-info-val a { color: var(--rose); text-decoration: none; }
        .contact-info-val a:hover { text-decoration: underline; }

        /* Form side */
        .form-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 32px;
          box-shadow: 0 4px 24px rgba(42,31,29,0.06);
        }
        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.2rem; color: var(--text); margin-bottom: 6px;
        }
        .form-sub { font-size: 0.8rem; color: var(--text-soft); margin-bottom: 24px; line-height: 1.6; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 0.85rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; background: var(--bg);
          transition: all 0.2s; outline: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #c9aba6; }
        .form-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
        .form-select { cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23b09490' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
        }
        .submit-btn {
          width: 100%; padding: 12px; border-radius: 9px; border: none;
          background: var(--rose); color: #fff; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 3px 12px rgba(176,92,82,0.25);
          margin-top: 4px;
        }
        .submit-btn:hover { background: var(--rose-dark); transform: translateY(-1px); box-shadow: 0 5px 16px rgba(176,92,82,0.3); }
        .form-note { font-size: 0.72rem; color: var(--text-soft); text-align: center; margin-top: 10px; line-height: 1.5; }

        @media (max-width: 768px) {
          .content-wrap { grid-template-columns: 1fr; }
        }

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
        <div className="page-eyebrow">Get in touch</div>
        <h1 className="page-title">Contact Us</h1>
        <p className="page-sub">Have a question, feedback, or need help? We'd love to hear from you. We typically respond within one business day.</p>
      </div>

      <div className="content-wrap">

        {/* Left — contact info + cards */}
        <div>
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-card-icon">💬</div>
              <div className="contact-card-title">General Enquiries</div>
              <div className="contact-card-desc">Questions about features, pricing, or how QRFeedback.ai works.</div>
              <a href="mailto:hello@qrfeedback.ai" className="contact-card-link">hello@qrfeedback.ai →</a>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon">🛠</div>
              <div className="contact-card-title">Technical Support</div>
              <div className="contact-card-desc">Having issues with the platform? We'll help you get sorted.</div>
              <a href="mailto:support@qrfeedback.ai" className="contact-card-link">support@qrfeedback.ai →</a>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon">💳</div>
              <div className="contact-card-title">Billing & Accounts</div>
              <div className="contact-card-desc">Questions about your subscription, invoices, or cancellations.</div>
              <a href="mailto:billing@qrfeedback.ai" className="contact-card-link">billing@qrfeedback.ai →</a>
            </div>
          </div>

          <div className="contact-info" style={{ marginTop: 28 }}>
            <div className="contact-info-title">Company Info</div>
            <div className="contact-info-item">
              <span className="contact-info-icon">🏢</span>
              <div>
                <div className="contact-info-label">Company</div>
                <div className="contact-info-val">Startekk LLC</div>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">🌐</span>
              <div>
                <div className="contact-info-label">Website</div>
                <div className="contact-info-val"><a href="https://qrfeedback.ai">qrfeedback.ai</a></div>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">⏱</span>
              <div>
                <div className="contact-info-label">Response Time</div>
                <div className="contact-info-val">Within 1 business day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — contact form */}
        <div className="form-card">
          <div className="form-title">Send us a message</div>
          <div className="form-sub">Fill out the form and we'll get back to you as soon as possible.</div>

          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select">
                <option value="">Select a topic...</option>
                <option value="general">General enquiry</option>
                <option value="support">Technical support</option>
                <option value="billing">Billing & subscriptions</option>
                <option value="feedback">Product feedback</option>
                <option value="business">Business plan / Enterprise</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" placeholder="Tell us how we can help..." required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message →</button>
            <p className="form-note">We'll reply to the email address you provide above.</p>
          </form>
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