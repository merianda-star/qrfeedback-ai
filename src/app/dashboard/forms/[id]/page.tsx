'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import Link from 'next/link'

type Form = {
  google_review_url: string | null
  location_name: string | null
  id: string
  title: string
  description: string
  review_mode: boolean
  redirect_on_positive: boolean
  user_id: string
}

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const [form, setForm] = useState<Form | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reviewMode, setReviewMode] = useState(true)
  const [redirectOnPositive, setRedirectOnPositive] = useState(true)
  const [googleUrl, setGoogleUrl] = useState('')
  const [locationName, setLocationName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const feedbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/feedback/${params.id}`
    : `https://yoursite.com/feedback/${params.id}`

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (!loading) generateQR() }, [loading])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: formData } = await supabase.from('forms').select('*').eq('id', params.id).single()
    if (formData) {
      setForm(formData)
      setTitle(formData.title)
      setDescription(formData.description || '')
      setReviewMode(formData.review_mode)
      setRedirectOnPositive(formData.redirect_on_positive)
      setGoogleUrl(formData.google_review_url || '')
      setLocationName(formData.location_name || '')
    }
    setLoading(false)
  }

  async function generateQR() {
    const canvas = qrCanvasRef.current
    if (!canvas) return
    const tempCanvas = document.createElement('canvas')
    await QRCode.toCanvas(tempCanvas, feedbackUrl, {
      width: 180, margin: 2,
      color: { dark: '#2a1f1d', light: '#ffffff' },
    })
    const brandHeight = 32
    canvas.width = 180
    canvas.height = 180 + brandHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 180, 180 + brandHeight)
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.strokeStyle = '#e8d5cf'
    ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(12, 183); ctx.lineTo(168, 183); ctx.stroke()
    ctx.textAlign = 'left'
    const brandX = 90
    const mainText = 'QRFeedback'
    const dotAi = '.ai'
    ctx.font = 'bold 9px Georgia, serif'
    const mainWidth = ctx.measureText(mainText).width
    const dotWidth = ctx.measureText(dotAi).width
    const totalWidth = mainWidth + dotWidth
    const startX = brandX - totalWidth / 2
    ctx.fillStyle = '#2a1f1d'
    ctx.fillText(mainText, startX, 196)
    ctx.fillStyle = '#b05c52'
    ctx.fillText(dotAi, startX + mainWidth, 196)
    ctx.fillStyle = '#b09490'
    ctx.font = '6.5px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('Smart Feedback · Powered by AI', 90, 207)
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('forms').update({
      title,
      description,
      review_mode: reviewMode,
      redirect_on_positive: redirectOnPositive,
      google_review_url: googleUrl,
      location_name: locationName,
    }).eq('id', params.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function downloadQR() {
    const canvas = qrCanvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qrfeedback-${title.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading form details...</div>
    </div>
  )

  return (
    <>
      <style>{`
        :root {
          --bg:        #fdf6f4;
          --surface:   #ffffff;
          --border:    #e8d5cf;
          --border-md: #d9c2bb;
          --rose:      #b05c52;
          --rose-dark: #8c3d34;
          --rose-soft: #f7ece9;
          --text:      #2a1f1d;
          --text-mid:  #7a5a56;
          --text-soft: #b09490;
          --terra:     #c4896a;
        }

        .fb-wrap { max-width: 840px; margin: 0 auto; }

        .fb-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.75rem; color: var(--text-soft); margin-bottom: 18px;
        }
        .fb-breadcrumb a { color: var(--rose); text-decoration: none; font-weight: 600; }
        .fb-breadcrumb a:hover { text-decoration: underline; }

        .fb-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 22px;
        }
        .fb-page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.35rem; color: var(--text); margin-bottom: 3px;
        }
        .fb-page-sub { font-size: 0.76rem; color: var(--text-soft); }

        .save-btn {
          padding: 9px 22px; border-radius: 8px; border: none;
          background: var(--rose); color: #fff;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 2px 8px rgba(176,92,82,0.2);
          transition: all 0.2s; white-space: nowrap;
        }
        .save-btn:hover:not(:disabled) { background: var(--rose-dark); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(176,92,82,0.28); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .save-btn.saved { background: #4a7a5a; box-shadow: 0 2px 8px rgba(74,122,90,0.2); }

        .section-card {
          background: var(--surface); border-radius: 10px;
          border: 1px solid var(--border);
          padding: 22px 24px; margin-bottom: 16px;
        }
        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: 0.95rem; color: var(--text);
          margin-bottom: 3px;
        }
        .section-sub { font-size: 0.74rem; color: var(--text-soft); margin-bottom: 16px; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .form-group { margin-bottom: 14px; }
        .form-label {
          display: block; font-size: 0.7rem; font-weight: 700;
          color: var(--text); margin-bottom: 5px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%; padding: 9px 12px;
          border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 0.85rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; background: var(--bg);
          transition: all 0.2s;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none; border-color: var(--rose);
          box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #c9aba6; }
        .form-textarea { resize: vertical; min-height: 78px; line-height: 1.5; }
        .form-select { cursor: pointer; appearance: auto; }

        .url-wrap { position: relative; }
        .url-check { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: #4a7a5a; }

        .divider { height: 1px; background: var(--border); margin: 14px 0; }

        .toggle-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid #f5ede9;
        }
        .toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
        .toggle-label { font-size: 0.83rem; font-weight: 600; color: var(--text); margin-bottom: 3px; }
        .toggle-desc { font-size: 0.71rem; color: var(--text-soft); line-height: 1.5; max-width: 420px; }

        .vic-toggle { position: relative; width: 44px; height: 23px; flex-shrink: 0; margin-left: 16px; }
        .vic-toggle input { opacity: 0; width: 0; height: 0; }
        .vic-toggle-track {
          position: absolute; inset: 0; cursor: pointer;
          background: #ddd0cc; border-radius: 23px;
          transition: all 0.3s;
        }
        .vic-toggle input:checked + .vic-toggle-track { background: var(--rose); }
        .vic-toggle-track::after {
          content: ''; position: absolute;
          left: 3px; top: 50%; transform: translateY(-50%);
          width: 17px; height: 17px; background: #fff;
          border-radius: 50%; transition: all 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .vic-toggle input:checked + .vic-toggle-track::after { left: calc(100% - 20px); }

        .qr-section { display: flex; gap: 24px; align-items: flex-start; }
        .qr-canvas-wrap {
          background: #fff; border: 1.5px solid var(--border); border-radius: 10px;
          padding: 10px; flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(42,31,29,0.06);
        }
        .qr-url-box {
          background: var(--rose-soft); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;
        }
        .qr-url-label { font-size: 0.6rem; font-weight: 700; color: var(--terra); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px; }
        .qr-url-text { font-size: 0.73rem; color: var(--text); word-break: break-all; font-family: monospace; }

        .qr-actions { display: flex; gap: 7px; flex-wrap: wrap; }
        .qr-btn {
          padding: 7px 14px; border-radius: 7px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 0.74rem; font-weight: 600; cursor: pointer;
          color: var(--text-mid); font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; display: flex; align-items: center; gap: 5px;
        }
        .qr-btn:hover { border-color: var(--border-md); color: var(--text); background: var(--rose-soft); }
        .qr-btn.primary { background: var(--rose); color: #fff; border-color: transparent; box-shadow: 0 1px 4px rgba(176,92,82,0.2); }
        .qr-btn.primary:hover { background: var(--rose-dark); border-color: transparent; color: #fff; }
        .qr-hint { font-size: 0.7rem; color: var(--text-soft); line-height: 1.6; margin-top: 10px; }

        .saved-banner {
          display: flex; align-items: center; gap: 8px;
          background: #edf4ef; border: 1px solid #b8d8c0;
          border-radius: 8px; padding: 9px 13px; margin-bottom: 14px;
          font-size: 0.79rem; color: #3a5a42; font-weight: 600;
        }
      `}</style>

      <div className="fb-wrap">
        <div className="fb-breadcrumb">
          <Link href="/dashboard/forms">My Forms</Link>
          <span>›</span>
          <span>{title || 'Form Builder'}</span>
        </div>

        <div className="fb-header">
          <div>
            <div className="fb-page-title">{title || 'Form Builder'}</div>
            <div className="fb-page-sub">Configure your feedback form and QR code settings</div>
          </div>
          <button className={`save-btn${saved ? ' saved' : ''}`} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {saved && <div className="saved-banner">✓ Your changes have been saved successfully.</div>}

        {/* Form Details */}
        <div className="section-card">
          <div className="section-title">Form Details</div>
          <div className="section-sub">Basic information about this feedback form</div>
          <div className="form-group">
            <label className="form-label">Form Name</label>
            <input type="text" className="form-input" placeholder="e.g. Dine-In Experience" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>

        {/* Review Shield */}
        <div className="section-card">
          <div className="section-title">Review Shield Settings</div>
          <div className="section-sub">Configure how customer ratings are routed</div>

          <div className="field-row">
            <div className="form-group">
              <label className="form-label">Location Name</label>
              <input type="text" className="form-input" placeholder="e.g. 123 MG Road, Mysuru" value={locationName} onChange={e => setLocationName(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Google Review URL</label>
            <div className="url-wrap">
              <input type="url" className="form-input" placeholder="https://g.page/r/yourbusiness/review" value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} style={{ paddingRight: googleUrl ? '36px' : '12px' }} />
              {googleUrl && <span className="url-check">✓</span>}
            </div>
          </div>

          <div className="divider"></div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Review Mode</div>
              <div className="toggle-desc">4–5 star ratings go to Google Review. 1–3 star ratings are captured privately.</div>
            </div>
            <label className="vic-toggle">
              <input type="checkbox" checked={reviewMode} onChange={e => setReviewMode(e.target.checked)} />
              <span className="vic-toggle-track"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Redirect on Positive</div>
              <div className="toggle-desc">Automatically open Google Review for customers who give a positive rating.</div>
            </div>
            <label className="vic-toggle">
              <input type="checkbox" checked={redirectOnPositive} onChange={e => setRedirectOnPositive(e.target.checked)} />
              <span className="vic-toggle-track"></span>
            </label>
          </div>
        </div>

        {/* QR Code */}
        <div className="section-card">
          <div className="section-title">Your QR Code</div>
          <div className="section-sub">Print and display this QR code for customers to scan</div>
          <div className="qr-section">
            <div className="qr-canvas-wrap">
              <canvas ref={qrCanvasRef} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="qr-url-box">
                <div className="qr-url-label">Feedback URL</div>
                <div className="qr-url-text">{feedbackUrl}</div>
              </div>
              <div className="qr-actions">
                <button className="qr-btn primary" onClick={downloadQR}>⬇ Download QR</button>
                <button className="qr-btn" onClick={() => navigator.clipboard.writeText(feedbackUrl)}>🔗 Copy Link</button>
              </div>
              <div className="qr-hint">Place this QR code on your tables, receipts, or signage. Customers scan it with their phone — no app required.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}