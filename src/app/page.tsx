'use client' 
import Link from 'next/link'
import { Suspense, useState } from 'react'
import CodeRedirector from '@/components/CodeRedirector'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Business enquiry modal state
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', business_name: '', email: '', business_type: 'restaurant', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit() {
    if (!formData.name.trim() || !formData.email.trim() || !formData.business_name.trim()) {
      setSubmitError('Please fill in your name, business name and email.')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(formData.email)) {
      setSubmitError('Please enter a valid email address.')
      return
    }
    setSubmitting(true); setSubmitError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (json.success) {
        setSubmitted(true)
      } else {
        setSubmitError(json.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  function closeModal() {
    setShowModal(false)
    setTimeout(() => { setSubmitted(false); setSubmitError(''); setFormData({ name: '', business_name: '', email: '', business_type: 'restaurant', message: '' }) }, 400)
  }

  return (
    <>
      <Suspense fallback={null}>
        <CodeRedirector />
      </Suspense>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Lora:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #fdf6f4;
          --surface:   #ffffff;
          --border:    #e8d5cf;
          --rose:      #b05c52;
          --rose-dark: #8c3d34;
          --rose-soft: #f7ece9;
          --text:      #2a1f1d;
          --text-mid:  #7a5a56;
          --text-soft: #b09490;
          --terra:     #c4896a;
          --ink:       #1a1210;
          --green:     #4a7a5a;
        }

        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 6vw; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(253,246,244,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(232,213,207,0.6);
        }
        .nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); text-decoration: none; flex-shrink: 0; }
        .nav-logo span { color: var(--rose); }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link { font-size: 0.83rem; font-weight: 500; color: var(--text-mid); text-decoration: none; transition: color 0.2s; white-space: nowrap; }
        .nav-link:hover { color: var(--text); }
        .nav-cta { padding: 8px 20px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; transition: all 0.2s; box-shadow: 0 2px 8px rgba(176,92,82,0.25); white-space: nowrap; }
        .nav-cta:hover { background: var(--rose-dark); transform: translateY(-1px); }

        .nav-hamburger { display: none; flex-direction: column; justify-content: center; align-items: center; width: 38px; height: 38px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; gap: 5px; transition: all 0.15s; flex-shrink: 0; }
        .nav-hamburger:hover { background: var(--rose-soft); }
        .nav-hamburger span { display: block; width: 18px; height: 2px; background: var(--text-mid); border-radius: 2px; transition: all 0.2s; }

        .mobile-menu {
          display: none; position: fixed; top: 64px; left: 0; right: 0;
          background: rgba(253,246,244,0.98); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border); z-index: 99;
          flex-direction: column; padding: 16px 6vw 24px; gap: 4px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu-link { padding: 12px 0; font-size: 0.95rem; font-weight: 500; color: var(--text-mid); text-decoration: none; border-bottom: 1px solid var(--border); }
        .mobile-menu-link:last-of-type { border-bottom: none; }
        .mobile-menu-link:hover { color: var(--rose); }
        .mobile-menu-cta { margin-top: 8px; padding: 13px; border-radius: 9px; background: var(--rose); color: #fff; font-size: 0.9rem; font-weight: 600; text-decoration: none; text-align: center; box-shadow: 0 2px 8px rgba(176,92,82,0.25); }

        /* ── HERO ── */
        .hero { min-height: 100vh; padding: 120px 6vw 80px; display: flex; align-items: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 80% 20%, rgba(196,137,106,0.12) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(176,92,82,0.07) 0%, transparent 50%); }
        .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--rose); background: var(--rose-soft); border: 1px solid var(--border); padding: 5px 14px; border-radius: 20px; margin-bottom: 22px; }
        .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rose); flex-shrink: 0; }
        .hero-title { font-family: 'DM Serif Display', serif; font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 1.1; color: var(--ink); margin-bottom: 22px; letter-spacing: -0.5px; }
        .hero-title em { font-style: italic; color: var(--rose); }
        .hero-sub { font-size: 1rem; color: var(--text-mid); line-height: 1.7; margin-bottom: 32px; max-width: 500px; font-weight: 400; }
        .hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .btn-primary { padding: 13px 26px; border-radius: 9px; border: none; background: var(--rose); color: #fff; font-size: 0.92rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 16px rgba(176,92,82,0.3); white-space: nowrap; }
        .btn-primary:hover { background: var(--rose-dark); transform: translateY(-2px); }
        .btn-secondary { padding: 13px 22px; border-radius: 9px; border: 1.5px solid var(--border); background: transparent; font-size: 0.92rem; font-weight: 500; cursor: pointer; color: var(--text-mid); font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; transition: all 0.2s; white-space: nowrap; }
        .btn-secondary:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .hero-trust { display: flex; align-items: center; gap: 10px; margin-top: 24px; font-size: 0.75rem; color: var(--text-soft); flex-wrap: wrap; }
        .hero-trust-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border); }

        .hero-visual { position: relative; }
        .hero-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 24px; box-shadow: 0 20px 60px rgba(42,31,29,0.1), 0 4px 16px rgba(42,31,29,0.06); position: relative; z-index: 2; }
        .hero-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
        .hero-card-title { font-family: 'DM Serif Display', serif; font-size: 0.9rem; color: var(--text); }
        .hero-card-badge { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 20px; background: #edf4ef; color: var(--green); border: 1px solid rgba(74,122,90,0.2); }
        .hero-rating-bar { flex: 1; }
        .hero-rating-label { font-size: 0.68rem; color: var(--text-soft); margin-bottom: 4px; display: flex; justify-content: space-between; }
        .hero-bar-track { height: 6px; background: var(--rose-soft); border-radius: 3px; overflow: hidden; }
        .hero-bar-fill { height: 100%; border-radius: 3px; background: var(--rose); }
        .hero-stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
        .hero-stat { background: var(--bg); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid var(--border); }
        .hero-stat-val { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: var(--text); }
        .hero-stat-val.pos { color: var(--green); }
        .hero-stat-val.neg { color: var(--rose); }
        .hero-stat-label { font-size: 0.6rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .float-badge { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; box-shadow: 0 8px 24px rgba(42,31,29,0.1); font-size: 0.78rem; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; z-index: 3; animation: float 3s ease-in-out infinite; white-space: nowrap; }
        .float-badge.one { top: -20px; right: -20px; animation-delay: 0s; }
        .float-badge.two { bottom: 20px; left: -30px; animation-delay: 1.5s; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }

        .logos-strip { padding: 28px 6vw; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .logos-label { font-size: 0.72rem; color: var(--text-soft); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
        .stat-pill { display: flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); font-size: 0.8rem; color: var(--text-mid); white-space: nowrap; }
        .stat-pill strong { color: var(--text); font-weight: 700; }

        .section { padding: 80px 6vw; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--rose); margin-bottom: 12px; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.7rem, 3vw, 2.6rem); color: var(--ink); line-height: 1.15; margin-bottom: 14px; }
        .section-sub { font-size: 0.95rem; color: var(--text-mid); line-height: 1.7; max-width: 560px; margin-bottom: 48px; }

        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; position: relative; }
        .steps-grid::before { content: ''; position: absolute; top: 28px; left: calc(16.66% + 16px); right: calc(16.66% + 16px); height: 1px; background: linear-gradient(90deg, var(--border), var(--rose), var(--border)); }
        .step { padding: 0 20px; text-align: center; }
        .step-num { width: 56px; height: 56px; border-radius: 50%; background: var(--surface); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin: 0 auto 18px; position: relative; z-index: 1; box-shadow: 0 4px 12px rgba(176,92,82,0.1); }
        .step-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); margin-bottom: 8px; }
        .step-desc { font-size: 0.8rem; color: var(--text-mid); line-height: 1.65; }

        .routing-section { padding: 80px 6vw; background: var(--ink); position: relative; overflow: hidden; }
        .routing-section::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 0% 50%, rgba(176,92,82,0.15) 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(196,137,106,0.1) 0%, transparent 50%); }
        .routing-inner { max-width: 1100px; margin: 0 auto; }
        .routing-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(196,137,106,0.7); margin-bottom: 12px; }
        .routing-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.7rem, 3vw, 2.5rem); color: #f5ede8; line-height: 1.15; margin-bottom: 14px; }
        .routing-sub { font-size: 0.92rem; color: rgba(245,237,232,0.55); line-height: 1.7; max-width: 500px; margin-bottom: 48px; }
        .routing-flow { display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
        .flow-node { flex: 1; min-width: 140px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 16px; text-align: center; }
        .flow-node.highlight { background: rgba(176,92,82,0.15); border-color: rgba(176,92,82,0.3); }
        .flow-node-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .flow-node-title { font-size: 0.82rem; font-weight: 600; color: #f5ede8; margin-bottom: 4px; }
        .flow-node-desc { font-size: 0.7rem; color: rgba(245,237,232,0.45); line-height: 1.5; }
        .flow-arrow { padding: 0 10px; font-size: 1.1rem; color: rgba(196,137,106,0.5); flex-shrink: 0; }
        .flow-split { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 8px; }
        .flow-split-node { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
        .flow-split-node.positive { border-color: rgba(74,122,90,0.3); background: rgba(74,122,90,0.08); }
        .flow-split-node.negative { border-color: rgba(176,92,82,0.3); background: rgba(176,92,82,0.08); }
        .flow-split-icon { font-size: 1rem; flex-shrink: 0; }
        .flow-split-title { font-size: 0.78rem; font-weight: 600; color: #f5ede8; }
        .flow-split-desc { font-size: 0.66rem; color: rgba(245,237,232,0.45); margin-top: 2px; }

        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pillar { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 26px 22px; transition: all 0.25s; position: relative; overflow: hidden; }
        .pillar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--rose), var(--terra)); opacity: 0; transition: opacity 0.25s; }
        .pillar:hover { box-shadow: 0 8px 32px rgba(176,92,82,0.1); transform: translateY(-3px); }
        .pillar:hover::before { opacity: 1; }
        .pillar-icon { font-size: 1.8rem; margin-bottom: 12px; }
        .pillar-title { font-family: 'DM Serif Display', serif; font-size: 1.05rem; color: var(--text); margin-bottom: 8px; }
        .pillar-desc { font-size: 0.8rem; color: var(--text-mid); line-height: 1.65; }

        .biz-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }

        .pricing-section { padding: 80px 6vw; background: var(--surface); }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 960px; margin: 0 auto; }
        .price-card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 26px 22px; position: relative; transition: all 0.2s; }
        .price-card:hover { box-shadow: 0 8px 32px rgba(176,92,82,0.08); }
        .price-card.popular { background: var(--ink); border-color: transparent; box-shadow: 0 16px 48px rgba(26,18,16,0.25); transform: scale(1.03); }
        .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--rose); color: #fff; font-size: 0.62rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; white-space: nowrap; }
        .price-plan { font-size: 0.72rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-soft); margin-bottom: 10px; }
        .price-card.popular .price-plan { color: rgba(245,237,232,0.5); }
        .price-amount { font-family: 'DM Serif Display', serif; font-size: 2.4rem; color: var(--text); line-height: 1; margin-bottom: 4px; }
        .price-card.popular .price-amount { color: #f5ede8; }
        .price-period { font-size: 0.78rem; color: var(--text-soft); margin-bottom: 18px; }
        .price-card.popular .price-period { color: rgba(245,237,232,0.45); }
        .price-divider { height: 1px; background: var(--border); margin-bottom: 16px; }
        .price-card.popular .price-divider { background: rgba(255,255,255,0.08); }
        .price-features { list-style: none; margin-bottom: 22px; }
        .price-feature { display: flex; align-items: center; gap: 9px; font-size: 0.79rem; color: var(--text-mid); padding: 4px 0; }
        .price-card.popular .price-feature { color: rgba(245,237,232,0.65); }
        .price-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
        .price-btn { width: 100%; padding: 11px; border-radius: 8px; border: 1.5px solid var(--border); background: transparent; color: var(--text); font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: block; text-align: center; transition: all 0.2s; }
        .price-btn:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .price-btn.pop { background: var(--rose); color: #fff; border-color: transparent; box-shadow: 0 4px 14px rgba(176,92,82,0.35); }
        .price-btn.pop:hover { background: var(--rose-dark); }

        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; }
        .faq-q { font-size: 0.86rem; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .faq-a { font-size: 0.79rem; color: var(--text-mid); line-height: 1.65; }

        .cta-section { padding: 80px 6vw; text-align: center; background: linear-gradient(135deg, #2a1f1d 0%, #3d2520 50%, #2a1f1d 100%); position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 0%, rgba(176,92,82,0.2) 0%, transparent 60%); }
        .cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 4vw, 3.2rem); color: #f5ede8; line-height: 1.15; margin-bottom: 16px; position: relative; z-index: 1; }
        .cta-title em { font-style: italic; color: var(--terra); }
        .cta-sub { font-size: 0.95rem; color: rgba(245,237,232,0.55); margin-bottom: 32px; position: relative; z-index: 1; }
        .cta-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; position: relative; z-index: 1; }
        .cta-btn-primary { padding: 14px 28px; border-radius: 9px; border: none; background: var(--rose); color: #fff; font-size: 0.92rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 18px rgba(176,92,82,0.4); white-space: nowrap; }
        .cta-btn-primary:hover { background: var(--rose-dark); transform: translateY(-2px); }
        .cta-btn-secondary { padding: 14px 24px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(245,237,232,0.7); font-size: 0.92rem; font-weight: 500; font-family: 'DM Sans', sans-serif; text-decoration: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .cta-btn-secondary:hover { border-color: rgba(255,255,255,0.3); color: #f5ede8; }

        .footer { padding: 28px 6vw; background: var(--ink); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-logo { font-family: 'DM Serif Display', serif; font-size: 1rem; color: rgba(245,237,232,0.6); }
        .footer-logo span { color: var(--rose); }
        .footer-links { display: flex; gap: 16px; flex-wrap: wrap; }
        .footer-link { font-size: 0.78rem; color: rgba(245,237,232,0.35); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(245,237,232,0.7); }
        .footer-copy { font-size: 0.72rem; color: rgba(245,237,232,0.25); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .hero-eyebrow { animation: fadeUp 0.6s ease both; }
        .hero-title { animation: fadeUp 0.6s 0.1s ease both; }
        .hero-sub { animation: fadeUp 0.6s 0.2s ease both; }
        .hero-actions { animation: fadeUp 0.6s 0.3s ease both; }
        .hero-trust { animation: fadeUp 0.6s 0.4s ease both; }
        .hero-visual { animation: fadeUp 0.8s 0.3s ease both; }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(26,18,16,0.6); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-box {
          background: var(--surface); border-radius: 16px;
          border: 1px solid var(--border);
          width: 100%; max-width: 480px;
          box-shadow: 0 24px 80px rgba(26,18,16,0.25);
          overflow: hidden;
          animation: slideUp 0.25s ease;
          max-height: 90vh; overflow-y: auto;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header {
          background: linear-gradient(135deg, #2a1f1d 0%, #3d2520 100%);
          padding: 24px 24px 20px; position: relative;
        }
        .modal-close {
          position: absolute; top: 14px; right: 14px;
          background: rgba(255,255,255,0.1); border: none; border-radius: 6px;
          width: 28px; height: 28px; cursor: pointer; color: rgba(245,237,232,0.6);
          font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.18); color: #f5ede8; }
        .modal-title { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: #f5ede8; margin-bottom: 4px; }
        .modal-sub { font-size: 0.78rem; color: rgba(245,237,232,0.5); line-height: 1.5; }
        .modal-body { padding: 24px; }
        .modal-field { margin-bottom: 14px; }
        .modal-label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text); margin-bottom: 5px; letter-spacing: 0.5px; text-transform: uppercase; }
        .modal-input, .modal-select, .modal-textarea {
          width: 100%; padding: 9px 12px; border: 1.5px solid var(--border);
          border-radius: 8px; font-size: 0.85rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; background: var(--bg);
          transition: all 0.2s; outline: none;
        }
        .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
          border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff;
        }
        .modal-input::placeholder, .modal-textarea::placeholder { color: #c9aba6; }
        .modal-textarea { resize: vertical; min-height: 88px; line-height: 1.5; }
        .modal-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .modal-error { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 9px 13px; font-size: 0.78rem; color: #8c3d34; margin-bottom: 14px; }
        .modal-submit {
          width: 100%; padding: 12px; border-radius: 9px; border: none;
          background: var(--rose); color: #fff; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 14px rgba(176,92,82,0.3);
        }
        .modal-submit:hover:not(:disabled) { background: var(--rose-dark); transform: translateY(-1px); }
        .modal-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Success state */
        .modal-success { padding: 32px 24px; text-align: center; }
        .modal-success-icon { width: 56px; height: 56px; border-radius: 50%; background: #edf4ef; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 16px; }
        .modal-success-title { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: var(--text); margin-bottom: 8px; }
        .modal-success-sub { font-size: 0.82rem; color: var(--text-mid); line-height: 1.6; margin-bottom: 20px; }
        .modal-success-divider { height: 1px; background: var(--border); margin: 20px 0; }
        .modal-cta-row { display: flex; gap: 10px; }
        .modal-cta-primary { flex: 1; padding: 11px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; text-align: center; display: block; transition: all 0.2s; box-shadow: 0 3px 10px rgba(176,92,82,0.3); }
        .modal-cta-primary:hover { background: var(--rose-dark); }
        .modal-cta-secondary { flex: 1; padding: 11px; border-radius: 8px; border: 1.5px solid var(--border); background: transparent; color: var(--text-mid); font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; text-align: center; }
        .modal-cta-secondary:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-hamburger { display: flex; }
          .hero { padding: 100px 6vw 60px; min-height: auto; }
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-visual { display: none; }
          .hero-title { font-size: clamp(2rem, 6vw, 2.8rem); }
          .hero-sub { font-size: 0.95rem; max-width: 100%; }
          .hero-actions { gap: 10px; }
          .btn-primary, .btn-secondary { padding: 12px 20px; font-size: 0.88rem; }
          .logos-strip { gap: 8px; padding: 20px 6vw; }
          .stat-pill { font-size: 0.75rem; padding: 6px 12px; }
          .section { padding: 60px 6vw; }
          .section-sub { margin-bottom: 36px; }
          .steps-grid { grid-template-columns: 1fr; gap: 32px; }
          .steps-grid::before { display: none; }
          .step { padding: 0; text-align: left; display: flex; align-items: flex-start; gap: 16px; }
          .step-num { flex-shrink: 0; margin: 0; }
          .routing-flow { flex-direction: column; gap: 12px; }
          .flow-arrow { transform: rotate(90deg); }
          .flow-node, .flow-split { min-width: 100%; }
          .pillars-grid { grid-template-columns: 1fr; gap: 12px; }
          .biz-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .pricing-grid { grid-template-columns: 1fr; max-width: 480px; gap: 20px; }
          .price-card.popular { transform: none; }
          .faq-grid { grid-template-columns: 1fr; }
          .footer { flex-direction: column; align-items: flex-start; gap: 16px; }
          .modal-two-col { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .nav { padding: 0 4vw; }
          .hero { padding: 90px 4vw 48px; }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .btn-primary, .btn-secondary { justify-content: center; }
          .logos-strip { flex-direction: column; align-items: center; gap: 8px; }
          .section { padding: 48px 4vw; }
          .biz-grid { grid-template-columns: 1fr; }
          .pricing-section { padding: 48px 4vw; }
          .cta-section { padding: 60px 4vw; }
          .cta-actions { flex-direction: column; align-items: stretch; }
          .cta-btn-primary, .cta-btn-secondary { justify-content: center; text-align: center; }
          .footer { padding: 24px 4vw; }
          .footer-links { gap: 12px; }
          .modal-cta-row { flex-direction: column; }
        }
      `}</style>

      {/* ── BUSINESS ENQUIRY MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box">
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal}>✕</button>
              <div className="modal-title">Get Business Access</div>
              <div className="modal-sub">Tell us about your business — we'll set up your free trial personally.</div>
            </div>

            {submitted ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <div className="modal-success-title">We'll be in touch soon!</div>
                <div className="modal-success-sub">
                  Thanks for reaching out. Our team will contact you at <strong>{formData.email}</strong> within 24 hours to set up your Business trial.
                </div>
                <div className="modal-success-divider" />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: 16 }}>
                  In the meantime, create a free account so we can upgrade you right away when we get in touch.
                </div>
                <div className="modal-cta-row">
                  <Link href="/auth/register" className="modal-cta-primary">Create Free Account →</Link>
                  <button className="modal-cta-secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                {submitError && <div className="modal-error">⚠ {submitError}</div>}
                <div className="modal-two-col">
                  <div className="modal-field">
                    <label className="modal-label">Your Name *</label>
                    <input className="modal-input" type="text" placeholder="Jane Smith" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Business Name *</label>
                    <input className="modal-input" type="text" placeholder="The Golden Fork" value={formData.business_name} onChange={e => setFormData(p => ({ ...p, business_name: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Email Address *</label>
                  <input className="modal-input" type="email" placeholder="jane@yourbusiness.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Business Type</label>
                  <select className="modal-select" value={formData.business_type} onChange={e => setFormData(p => ({ ...p, business_type: e.target.value }))}>
                    <option value="restaurant">🍽 Restaurant / Café</option>
                    <option value="retail">🛍 Retail</option>
                    <option value="healthcare">🏥 Healthcare</option>
                    <option value="services">💼 Services</option>
                    <option value="hospitality">🏨 Hotel / Hospitality</option>
                    <option value="other">⬡ Other</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Message <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-soft)', fontSize: '0.65rem' }}>(optional)</span></label>
                  <textarea className="modal-textarea" placeholder="Tell us about your business or any specific requirements..." value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
                </div>
                <button className="modal-submit" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? 'Sending...' : 'Send Enquiry →'}
                </button>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.72rem', color: 'var(--text-soft)' }}>
                  We typically respond within 24 hours · No commitment required
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">QRFeedback<span>.ai</span></Link>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#faq" className="nav-link">FAQ</a>
          <Link href="/auth/login" className="nav-link">Sign in</Link>
          <Link href="/auth/register" className="nav-cta">Start free</Link>
        </div>
        <button className="nav-hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <a href="#how-it-works" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>How it works</a>
        <a href="#pricing" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
        <a href="#faq" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
        <Link href="/auth/login" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
        <Link href="/auth/register" className="mobile-menu-cta" onClick={() => setMobileMenuOpen(false)}>Start free →</Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow"><span className="hero-eyebrow-dot"></span>AI-Powered Review Management</div>
            <h1 className="hero-title">An AI powered <em>review management</em> System</h1>
            <p className="hero-sub">Use AI-powered QR codes to capture and analyze customer feedback to further enhance your business.</p>
            <div className="hero-actions">
              <Link href="/demo" className='btn-primary'>View Live Demo →</Link>
              <a href="#how-it-works" className="btn-secondary">See how it works</a>
            </div>
            <div className="hero-trust">
              <span>Free forever plan</span><span className="hero-trust-dot"></span>
              <span>Setup in 2 minutes</span><span className="hero-trust-dot"></span>
              <span>No app required</span>
            </div>
          </div>
          <div className="hero-visual">
            <div style={{ position: 'relative' }}>
              <div className="float-badge one"><span>⭐</span> 4.2x more Google reviews</div>
              <div className="hero-card">
                <div className="hero-card-header">
                  <div className="hero-card-title">Weekly Feedback Summary</div>
                  <div className="hero-card-badge">Live</div>
                </div>
                {[{ label: '5 stars', pct: 72 }, { label: '4 stars', pct: 18 }, { label: '3 stars', pct: 6 }, { label: '1–2 stars', pct: 4 }].map(b => (
                  <div key={b.label} className="hero-rating-bar" style={{ marginBottom: 10 }}>
                    <div className="hero-rating-label"><span>{b.label}</span><span>{b.pct}%</span></div>
                    <div className="hero-bar-track"><div className="hero-bar-fill" style={{ width: `${b.pct}%` }}></div></div>
                  </div>
                ))}
                <div className="hero-stat-row">
                  <div className="hero-stat"><div className="hero-stat-val pos">142</div><div className="hero-stat-label">Redirected</div></div>
                  <div className="hero-stat"><div className="hero-stat-val neg">8</div><div className="hero-stat-label">Captured</div></div>
                  <div className="hero-stat"><div className="hero-stat-val">4.6</div><div className="hero-stat-label">Avg Rating</div></div>
                </div>
              </div>
              <div className="float-badge two"><span>🔒</span> 8 complaints captured privately</div>
            </div>
          </div>
        </div>
      </section>

      <div className="logos-strip">
        <span className="logos-label">Trusted by businesses</span>
        {[{ val: '4.2x', label: 'more Google reviews' }, { val: '94%', label: 'complaints captured' }, { val: '2 min', label: 'setup time' }, { val: '0 apps', label: 'required' }].map(s => (
          <div key={s.label} className="stat-pill"><strong>{s.val}</strong> {s.label}</div>
        ))}
      </div>

      <section className="section" id="how-it-works">
        <div className="section-inner">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-title">Three steps to a better reputation</h2>
          <p className="section-sub">From QR code to Google Review in under 60 seconds — for your customers.</p>
          <div className="steps-grid">
            {[
              { icon: '📋', num: '1', title: 'Create your form', desc: 'Build a feedback form in 2 minutes. Add your Google Review link and customise your questions.' },
              { icon: '⬛', num: '2', title: 'Print your QR code', desc: 'Download and display your QR code on tables, receipts, or packaging. No app needed to scan.' },
              { icon: '✦', num: '3', title: 'AI does the rest', desc: 'Happy customers go to Google Reviews. Unhappy ones are captured privately with AI analysis.' },
            ].map(s => (
              <div key={s.num} className="step">
                <div className="step-num"><span>{s.icon}</span></div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="routing-section">
        <div className="routing-inner">
          <div className="routing-eyebrow">Smart Review Routing</div>
          <h2 className="routing-title">Your secret weapon against bad reviews</h2>
          <p className="routing-sub">Every rating is automatically routed — positive to Google, negative to you privately. Before it ever goes public.</p>
          <div className="routing-flow">
            <div className="flow-node highlight">
              <div className="flow-node-icon">📱</div>
              <div className="flow-node-title">Customer scans QR</div>
              <div className="flow-node-desc">On their own phone, no app needed</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-node">
              <div className="flow-node-icon">⭐</div>
              <div className="flow-node-title">Rates experience</div>
              <div className="flow-node-desc">Simple 1–5 star question</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-split">
              <div className="flow-split-node positive">
                <span className="flow-split-icon">🔗</span>
                <div><div className="flow-split-title">4–5 stars → Google Review</div><div className="flow-split-desc">Opens Google Review page instantly</div></div>
              </div>
              <div className="flow-split-node negative">
                <span className="flow-split-icon">🔒</span>
                <div><div className="flow-split-title">1–3 stars → Private feedback</div><div className="flow-split-desc">Captured with AI analysis & alert sent to you</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-eyebrow">Why QRFeedback.ai</div>
          <h2 className="section-title">Everything your reputation needs</h2>
          <p className="section-sub">Built specifically for hospitality and service businesses that live and die by online reviews.</p>
          <div className="pillars-grid">
            {[
              { icon: '🛡', title: 'Review Protection', desc: 'Intercept unhappy customers before they go to Google, Yelp, or TripAdvisor. Capture their feedback privately and respond before it becomes a public problem.' },
              { icon: '✦', title: 'AI Insights', desc: 'Every negative response is automatically classified, summarised, and scored for sentiment. You get a suggested response — all within 15 seconds of submission.' },
              { icon: '⬛', title: 'Simple Setup', desc: 'No app for customers. No hardware. Just a QR code you print and place. Your customers scan, rate, and leave — the whole flow takes under 60 seconds.' },
            ].map(p => (
              <div key={p.title} className="pillar">
                <div className="pillar-icon">{p.icon}</div>
                <div className="pillar-title">{p.title}</div>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 100%, rgba(176,92,82,0.12) 0%, transparent 60%)' }} />
        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-eyebrow" style={{ textAlign: 'center', color: 'rgba(196,137,106,0.7)' }}>Who it's for</div>
          <h2 className="section-title" style={{ textAlign: 'center', color: '#f5ede8', marginBottom: 10 }}>Built for every customer-facing business</h2>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'rgba(245,237,232,0.5)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 44px' }}>
            Whether you run one location or fifty, QRFeedback.ai fits your workflow in under 2 minutes.
          </p>
          <div className="biz-grid">
            {[
              { icon: '🍽', title: 'Restaurants & Cafés', iconBg: 'rgba(196,137,106,0.15)', desc: 'Place QR codes on tables, receipts, or menus. Catch complaints before they hit Google.', tag: 'Most popular' },
              { icon: '🛍', title: 'Retail', iconBg: 'rgba(100,140,200,0.15)', desc: 'Get point-of-sale feedback instantly. Understand what keeps customers coming back.', tag: null },
              { icon: '🏥', title: 'Healthcare', iconBg: 'rgba(74,122,90,0.15)', desc: 'Collect patient experience feedback privately and sensitively.', tag: null },
              { icon: '💼', title: 'Services', iconBg: 'rgba(160,120,200,0.15)', desc: 'Gather feedback after consultations or project delivery.', tag: null },
              { icon: '⬡', title: 'Other Businesses', iconBg: 'rgba(120,140,160,0.15)', desc: 'Any business that interacts with customers face-to-face.', tag: null },
            ].map(b => (
              <div key={b.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '22px 18px', transition: 'all 0.25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(-4px)'; el.style.borderColor = 'rgba(196,137,106,0.3)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: b.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>{b.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '0.95rem', color: '#f5ede8' }}>{b.title}</div>
                  {b.tag && <span style={{ fontSize: '0.56rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 8px', borderRadius: 20, background: 'rgba(176,92,82,0.3)', color: '#f0c4b8', border: '1px solid rgba(176,92,82,0.3)', whiteSpace: 'nowrap' }}>{b.tag}</span>}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(245,237,232,0.5)', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ textAlign: 'center' }}>Pricing</div>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>Simple, honest pricing</h2>
          <p style={{ textAlign: 'center', fontSize: '0.92rem', color: 'var(--text-mid)', marginBottom: 44 }}>Start free. Upgrade when you're ready.</p>
          <div className="pricing-grid">
            {[
              { plan: 'Free', price: '$0', period: '/month, forever', features: ['3 feedback forms', '50 responses/month', 'Smart review routing', 'Basic QR codes', 'Email support'], cta: 'Get started free', ctaAction: 'link', popular: false },
              { plan: 'Pro', price: '$19', period: '/month', features: ['Unlimited forms', '1,000 responses/month', 'AI complaint analysis', 'Custom QR designs', 'Weekly AI email digest', 'Advanced analytics', 'CSV export'], cta: 'Start Pro free trial', ctaAction: 'link', popular: false },
              { plan: 'Business', price: '$49', period: '/month', features: ['Everything in Pro', 'Unlimited responses', 'White-label forms', 'Custom branded QR codes', 'Remove branding', 'Priority support'], cta: 'Contact for Business trial', ctaAction: 'modal', popular: true },
            ].map(p => (
              <div key={p.plan} className={`price-card${p.popular ? ' popular' : ''}`}>
                {p.popular && <div className="popular-badge">Most Popular</div>}
                <div className="price-plan">{p.plan}</div>
                <div className="price-amount">{p.price}</div>
                <div className="price-period">{p.period}</div>
                <div className="price-divider"></div>
                <ul className="price-features">
                  {p.features.map(f => <li key={f} className="price-feature"><span className="price-feature-dot"></span>{f}</li>)}
                </ul>
                {p.ctaAction === 'modal' ? (
                  <button className={`price-btn${p.popular ? ' pop' : ''}`} onClick={() => setShowModal(true)}>{p.cta}</button>
                ) : (
                  <Link href="/auth/register" className={`price-btn${p.popular ? ' pop' : ''}`}>{p.cta}</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="section-inner">
          <div className="section-eyebrow">FAQ</div>
          <h2 className="section-title" style={{ marginBottom: 32 }}>Common questions</h2>
          <div className="faq-grid">
            {[
              { q: 'Do customers need to download an app?', a: 'No. Customers scan the QR code with their phone camera and the feedback form opens in their browser. No app, no sign-up, no friction.' },
              { q: 'What happens to negative feedback?', a: 'Ratings of 1–3 stars are captured privately in your dashboard. You get an email alert with an AI-generated summary and a suggested response.' },
              { q: 'How does Google Review routing work?', a: 'When a customer gives a 4 or 5 star rating, they are shown a thank-you screen with a button that opens your Google Review page directly.' },
              { q: 'Can I use this for multiple locations?', a: 'Yes. You can create separate forms for each location or branch, each with their own QR code and Google Review URL.' },
              { q: 'When does AI processing happen?', a: 'Within 15 seconds of a negative response being submitted. You receive an email with AI classification, sentiment score, summary, and suggested response.' },
              { q: 'Can I cancel anytime?', a: 'Yes, anytime. If you cancel, your account downgrades to the free plan and you keep all your data. No lock-in, no cancellation fees.' },
            ].map(f => (
              <div key={f.q} className="faq-item">
                <div className="faq-q">{f.q}</div>
                <p className="faq-a">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Ready to protect your<br /><em>online reputation?</em></h2>
        <p className="cta-sub">Join businesses already catching complaints before they go public.</p>
        <div className="cta-actions">
          <Link href="/auth/register" className="cta-btn-primary">Start Free — No Card Required →</Link>
          <a href="#how-it-works" className="cta-btn-secondary">See how it works</a>
        </div>
      </section>

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