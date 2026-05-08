'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

type Form = {
  id: string
  title: string
  location_name: string | null
  response_count?: number
  avg_rating?: number
}

type DotStyle = 'square' | 'rounded' | 'dots'
type QRConfig = { fgColor: string; bgColor: string; dotStyle: DotStyle }
const DEFAULT_CONFIG: QRConfig = { fgColor: '#2a1f1d', bgColor: '#ffffff', dotStyle: 'square' }
const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function drawQRModules(
  ctx: CanvasRenderingContext2D,
  url: string,
  config: QRConfig,
  size: number,
  offsetX: number,
  offsetY: number
) {
  const qrData = QRCode.create(url, { errorCorrectionLevel: 'H' })
  const modules = qrData.modules
  const count = modules.size
  const moduleSize = size / count
  ctx.fillStyle = config.fgColor
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!modules.get(row, col)) continue
      const x = offsetX + col * moduleSize
      const y = offsetY + row * moduleSize
      const s = moduleSize * 0.88
      const gap = (moduleSize - s) / 2
      if (config.dotStyle === 'dots') {
        ctx.beginPath()
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, s / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
      } else if (config.dotStyle === 'rounded') {
        const rr = s * 0.32
        ctx.beginPath()
        ctx.moveTo(x + gap + rr, y + gap)
        ctx.lineTo(x + gap + s - rr, y + gap)
        ctx.quadraticCurveTo(x + gap + s, y + gap, x + gap + s, y + gap + rr)
        ctx.lineTo(x + gap + s, y + gap + s - rr)
        ctx.quadraticCurveTo(x + gap + s, y + gap + s, x + gap + s - rr, y + gap + s)
        ctx.lineTo(x + gap + rr, y + gap + s)
        ctx.quadraticCurveTo(x + gap, y + gap + s, x + gap, y + gap + s - rr)
        ctx.lineTo(x + gap, y + gap + rr)
        ctx.quadraticCurveTo(x + gap, y + gap, x + gap + rr, y + gap)
        ctx.closePath(); ctx.fill()
        ctx.beginPath()
      } else {
        ctx.fillRect(x, y, moduleSize, moduleSize)
      }
    }
  }
  ctx.beginPath()
}

async function drawCenterOverlay(
  ctx: CanvasRenderingContext2D,
  plan: string,
  businessName: string,
  logoUrl: string | null,
  centerX: number,
  centerY: number,
  qrSize: number
) {
  if (plan === 'pro') return

  if (plan === 'business' && logoUrl) {
    const badgeR = qrSize * 0.13
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(centerX, centerY, badgeR + 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.restore()
    try {
      const img = await loadImage(logoUrl)
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, badgeR, 0, Math.PI * 2)
      ctx.clip()
      const d = badgeR * 2
      ctx.drawImage(img, centerX - badgeR, centerY - badgeR, d, d)
      ctx.restore()
    } catch {}
    ctx.beginPath()
    return
  }

  if (plan === 'business' && !logoUrl) return

  if (plan === 'free') {
    const badgeR = qrSize * 0.13
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(centerX, centerY, badgeR + 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.restore()
    const maxW = badgeR * 1.7
    let fontSize = 9
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    while (ctx.measureText('QRFeedback.ai').width > maxW && fontSize > 5) {
      fontSize -= 0.5
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
    }
    ctx.fillStyle = '#b05c52'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('QRFeedback.ai', centerX, centerY)
    ctx.textBaseline = 'alphabetic'
    ctx.beginPath()
  }
}

async function generateQRPreview(
  url: string, config: QRConfig, plan: string, businessName: string, logoUrl: string | null
): Promise<HTMLCanvasElement> {
  const size = 220
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = config.bgColor
  ctx.fillRect(0, 0, size, size)
  await drawQRModules(ctx, url, config, size, 0, 0)
  await drawCenterOverlay(ctx, plan, businessName, logoUrl, size / 2, size / 2, size)
  return canvas
}

async function generatePrintCard(
  url: string, config: QRConfig, plan: string, businessName: string,
  formTitle: string, locationName: string | null, logoUrl: string | null
): Promise<HTMLCanvasElement> {
  const sc = 3
  const W  = 300 * sc   // 900px wide
  const H  = 530 * sc   // 1590px tall — fits header + QR + full info section

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── Colours ──────────────────────────────────────────────────────────────
  const BG   = '#faf5f3'
  const DARK = '#2a1f1d'
  const ROSE = '#9e3a30'
  const GOLD = '#c4896a'
  const MID  = '#7a5a56'
  const SOFT = '#e2cdc9'
  const WHITE= '#ffffff'

  // ── Rounded-rect helper (fill only, no stroke) ────────────────────────────
  function fillRR(x: number, y: number, w: number, h: number,
                  r: number | number[], color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    const [tl,tr,br,bl] = Array.isArray(r) ? r as number[] : [r,r,r,r] as number[]
    ctx.moveTo(x+tl, y)
    ctx.lineTo(x+w-tr, y);   ctx.quadraticCurveTo(x+w, y,   x+w, y+tr)
    ctx.lineTo(x+w, y+h-br); ctx.quadraticCurveTo(x+w, y+h, x+w-br, y+h)
    ctx.lineTo(x+bl, y+h);   ctx.quadraticCurveTo(x,   y+h, x,   y+h-bl)
    ctx.lineTo(x, y+tl);     ctx.quadraticCurveTo(x,   y,   x+tl, y)
    ctx.closePath(); ctx.fill(); ctx.beginPath()
  }

  // ── Filled circle helper ──────────────────────────────────────────────────
  function fillCircle(cx: number, cy: number, r: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill(); ctx.beginPath()
  }

  // ── 1. OUTER CARD BORDER ──────────────────────────────────────────────────
  const bdr   = 2.5 * sc
  const cardR = 12  * sc
  fillRR(0, 0, W, H, cardR, ROSE)
  fillRR(bdr, bdr, W - bdr*2, H - bdr*2, cardR - bdr, BG)

  // ── 2. HEADER ─────────────────────────────────────────────────────────────
  const hdrH = 132 * sc
  fillRR(bdr, bdr, W - bdr*2, hdrH, [cardR-bdr, cardR-bdr, 0, 0], DARK)

  // "SCAN TO LEAVE" line 1
  ctx.fillStyle = WHITE
  ctx.font = `900 ${18 * sc}px Arial Black, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.letterSpacing = `${1.5 * sc}px`
  ctx.fillText('SCAN TO LEAVE', W / 2, 48 * sc)
  // "YOUR FEEDBACK" line 2
  ctx.fillText('YOUR FEEDBACK', W / 2, 72 * sc)
  ctx.letterSpacing = '0px'

  // Gold italic tagline
  ctx.fillStyle = GOLD
  ctx.font = `italic ${7 * sc}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.fillText('Your voice shapes our service', W / 2, 90 * sc)

  // Divider: left line · dot · right line
  const dPad = 55 * sc
  const dY   = 99 * sc
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(dPad, dY, W/2 - dPad - 10*sc, 1*sc)
  ctx.fillRect(W/2 + 10*sc, dY, W/2 - dPad - 10*sc, 1*sc)
  fillCircle(W/2, dY, 2.5*sc, GOLD)

  // QRFEEDBACK.AI
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.font = `${9 * sc}px Arial, sans-serif`
  ctx.letterSpacing = `${2 * sc}px`
  ctx.textAlign = 'center'
  ctx.fillText('QRFEEDBACK.AI', W / 2, 118 * sc)
  ctx.letterSpacing = '0px'

  // ── 3. QR CODE CARD ───────────────────────────────────────────────────────
  const qPad = 18 * sc
  const qGap =  8 * sc
  const qX   = qPad
  const qY   = bdr + hdrH + qGap
  const qW   = W - qPad * 2      // 792px
  const qH   = qW                 // square
  const qBdr = 2   * sc
  const qR   = 9   * sc

  fillRR(qX, qY, qW, qH, qR, ROSE)
  fillRR(qX + qBdr, qY + qBdr, qW - qBdr*2, qH - qBdr*2, qR - qBdr, WHITE)

  const iPad     = 12 * sc
  const iX       = qX + qBdr + iPad
  const iY       = qY + qBdr + iPad
  const iSize    = qW - (qBdr + iPad) * 2

  ctx.fillStyle = config.bgColor
  ctx.fillRect(qX + qBdr, qY + qBdr, qW - qBdr*2, qH - qBdr*2)
  await drawQRModules(ctx, url, config, iSize, iX, iY)
  await drawCenterOverlay(ctx, plan, businessName, logoUrl,
    W / 2, qY + qH / 2, iSize)
  ctx.beginPath()

  // ── 4. INFO SECTION ───────────────────────────────────────────────────────
  const maxTW = qW - 16 * sc
  let   curY  = qY + qH + 18 * sc

  // Divider lines + diamond dot
  ctx.fillStyle = SOFT
  ctx.fillRect(qPad, curY, qW * 0.38, 1.2 * sc)
  ctx.fillRect(qPad + qW * 0.62, curY, qW * 0.38, 1.2 * sc)
  ctx.save()
  ctx.translate(W / 2, curY)
  ctx.rotate(Math.PI / 4)
  const ds = 4.5 * sc
  ctx.fillStyle = ROSE
  ctx.fillRect(-ds/2, -ds/2, ds, ds)
  ctx.restore()

  curY += 20 * sc

  // Business name (bold Georgia)
  ctx.fillStyle = DARK
  ctx.font = `700 ${12 * sc}px Georgia, serif`
  ctx.textAlign = 'center'
  const nWords = formTitle.split(' ')
  let nLine = ''
  const nLH = 16 * sc
  for (let i = 0; i < nWords.length; i++) {
    const t = nLine ? nLine + ' ' + nWords[i] : nWords[i]
    if (ctx.measureText(t).width > maxTW && nLine) {
      ctx.fillText(nLine, W/2, curY); nLine = nWords[i]; curY += nLH
    } else nLine = t
  }
  ctx.fillText(nLine, W/2, curY)
  curY += 14 * sc

  // "THANK YOU FOR YOUR FEEDBACK" — rose spaced caps
  if (plan !== 'free') {
    ctx.fillStyle = ROSE
    ctx.font = `600 ${4.8 * sc}px Arial, sans-serif`
    ctx.letterSpacing = `${1.8 * sc}px`
    ctx.textAlign = 'center'
    ctx.fillText('THANK YOU FOR YOUR FEEDBACK', W / 2, curY)
    ctx.letterSpacing = '0px'
    curY += 14 * sc
  }

  // Location text (soft grey Georgia, wraps)
  if (locationName) {
    ctx.fillStyle = MID
    ctx.font = `${6 * sc}px Georgia, serif`
    ctx.textAlign = 'center'
    const lWords = locationName.split(' ')
    let lLine = ''
    for (let i = 0; i < lWords.length; i++) {
      const t = lLine ? lLine + ' ' + lWords[i] : lWords[i]
      if (ctx.measureText(t).width > maxTW && lLine) {
        ctx.fillText(lLine, W/2, curY); lLine = lWords[i]; curY += 10 * sc
      } else lLine = t
    }
    ctx.fillText(lLine, W/2, curY)
  }

  // Free plan — powered by at bottom
  if (plan === 'free') {
    ctx.fillStyle = MID
    ctx.font = `${4.5 * sc}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('Powered by QRFeedback.ai', W / 2, H - bdr - 10 * sc)
  }

  return canvas
}

function getFeedbackUrl(formId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/feedback/${formId}`
}

export default function QRCodesPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<Form[]>([])
  const [plan, setPlan] = useState('free')
  const [businessName, setBusinessName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [configs, setConfigs] = useState<Record<string, QRConfig>>({})
  const [expandedForm, setExpandedForm] = useState<string | null>(null)
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})
  const [rendered, setRendered] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase
      .from('profiles').select('plan, business_name, logo_url').eq('id', user.id).single()
    const userPlan = profile?.plan || 'free'
    setPlan(userPlan)
    setBusinessName(profile?.business_name || 'My Business')
    setLogoUrl(userPlan === 'business' ? (profile?.logo_url || null) : null)
    const { data: formsData } = await supabase
      .from('forms').select('id, title, location_name').eq('user_id', user.id)
    if (!formsData || formsData.length === 0) { setLoading(false); return }
    const formIds = formsData.map((f: any) => f.id)
    const { data: responses } = await supabase
      .from('responses').select('form_id, rating').in('form_id', formIds)
    const countMap: Record<string, number[]> = {}
    responses?.forEach((r: any) => {
      if (!countMap[r.form_id]) countMap[r.form_id] = []
      countMap[r.form_id].push(r.rating)
    })
    const enriched = formsData.map((f: any) => ({
      ...f,
      response_count: countMap[f.id]?.length || 0,
      avg_rating: countMap[f.id]?.length
        ? parseFloat((countMap[f.id].reduce((s, r) => s + r, 0) / countMap[f.id].length).toFixed(1))
        : null,
    }))
    setForms(enriched)
    const initConfigs: Record<string, QRConfig> = {}
    formsData.forEach((f: any) => { initConfigs[f.id] = { ...DEFAULT_CONFIG } })
    setConfigs(initConfigs)
    setLoading(false)
  }

  async function renderQR(formId: string) {
    const canvas = canvasRefs.current[formId]
    if (!canvas) return
    const config = configs[formId] || DEFAULT_CONFIG
    const url = getFeedbackUrl(formId)
    const generated = await generateQRPreview(url, config, plan, businessName, logoUrl)
    const ctx = canvas.getContext('2d')!
    canvas.width = generated.width; canvas.height = generated.height
    ctx.drawImage(generated, 0, 0)
    setRendered(prev => ({ ...prev, [formId]: true }))
  }

  useEffect(() => {
    if (!loading) { forms.forEach(f => renderQR(f.id)) }
  }, [loading, configs, logoUrl])

  function updateConfig(formId: string, patch: Partial<QRConfig>) {
    setConfigs(prev => ({ ...prev, [formId]: { ...prev[formId], ...patch } }))
  }

  function downloadQR(formId: string, title: string) {
    const canvas = canvasRefs.current[formId]
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${title.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function printCard(form: Form) {
    setDownloadingPDF(form.id)
    try {
      const config = configs[form.id] || DEFAULT_CONFIG
      const url = getFeedbackUrl(form.id)
      const cardCanvas = await generatePrintCard(
        url, config, plan, businessName, form.title, form.location_name, logoUrl
      )
      const imgData = cardCanvas.toDataURL('image/png')
      const pw = window.open('', '_blank', 'width=520,height=720')
      if (!pw) { setDownloadingPDF(null); return }
      pw.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR Card — ${form.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #f5eeec 0%, #ede3e0 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 32px 20px;
      gap: 20px;
      font-family: Arial, sans-serif;
    }
    .card-wrap {
      width: 280px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow:
        0 1px 2px rgba(42,31,29,0.04),
        0 4px 12px rgba(42,31,29,0.10),
        0 16px 40px rgba(42,31,29,0.12);
    }
    .card-wrap img { width: 100%; height: auto; display: block; }
    .card-meta {
      font-size: 11px;
      color: #b09490;
      text-align: center;
      letter-spacing: 0.4px;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    button {
      padding: 10px 22px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: Arial, sans-serif;
      transition: all 0.15s;
    }
    .btn-print {
      background: #b05c52;
      color: #fff;
      box-shadow: 0 2px 8px rgba(176,92,82,0.3);
    }
    .btn-print:hover { background: #8c3d34; transform: translateY(-1px); }
    .btn-close {
      background: #fff;
      color: #2a1f1d;
      border: 1.5px solid #e8d5cf;
    }
    .btn-close:hover { background: #fdf6f4; }

    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body {
        background: #fff;
        padding: 0; margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw; height: 100vh;
        min-height: unset;
      }
      .card-meta { display: none; }
      .actions   { display: none !important; }
      .card-wrap {
        width: 148mm;
        border-radius: 6px;
        box-shadow: none;
        border: 0.5px solid #e8d5cf;
      }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="card-wrap">
    <img src="${imgData}" alt="QR Card" />
  </div>
  <div class="card-meta">${form.title}${form.location_name ? ' · ' + form.location_name : ''}</div>
  <div class="actions">
    <button class="btn-print" onclick="window.print()">🖨 Print / Save as PDF</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
</body>
</html>`)
      pw.document.close()
    } catch (err) { console.error('Print card error:', err) }
    setDownloadingPDF(null)
  }

  function copyUrl(formId: string) {
    navigator.clipboard.writeText(getFeedbackUrl(formId)).then(() => {
      setCopied(formId); setTimeout(() => setCopied(null), 2000)
    })
  }

  const canCustomize = plan === 'pro' || plan === 'business'
  const canBrandName = plan === 'business'
  const showLogoActive = plan === 'business' && !!logoUrl
  const showLogoUpload = plan === 'business' && !logoUrl

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading QR codes...</div>
    </div>
  )

  return (
    <>
      <style>{`
        :root{--bg:#fdf6f4;--surface:#fff;--border:#e8d5cf;--border-md:#d9c2bb;--rose:#b05c52;--rose-dark:#8c3d34;--rose-soft:#f7ece9;--text:#2a1f1d;--text-mid:#7a5a56;--text-soft:#b09490;--terra:#c4896a;--green:#4a7a5a;--green-soft:#edf4ef;}
        .qr-page{max-width:900px}
        .qr-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
        .qr-topbar h2{font-family:'DM Serif Display',serif;font-size:1.1rem;color:var(--text);margin-bottom:3px}
        .qr-topbar p{font-size:0.75rem;color:var(--text-soft)}
        .plan-badge{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-size:0.72rem;font-weight:700}
        .plan-dot{width:7px;height:7px;border-radius:50%}
        .plan-dot.free{background:var(--text-soft)}.plan-dot.pro{background:var(--terra)}.plan-dot.business{background:var(--green)}
        .qr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
        .qr-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:box-shadow 0.2s}
        .qr-card:hover{box-shadow:0 4px 20px rgba(42,31,29,0.09)}
        .qr-card-top{padding:20px;display:flex;flex-direction:column;align-items:center}
        .qr-canvas-wrap{background:#fff;border-radius:10px;border:1px solid var(--border);padding:10px;display:inline-flex;margin-bottom:14px;box-shadow:0 2px 12px rgba(42,31,29,0.07)}
        .qr-form-name{font-family:'DM Serif Display',serif;font-size:0.9rem;color:var(--text);text-align:center;margin-bottom:4px}
        .qr-location{font-size:0.7rem;color:var(--text-soft);text-align:center;margin-bottom:10px}
        .qr-stats{display:flex;gap:16px;margin-bottom:14px}
        .qr-stat{text-align:center}
        .qr-stat-val{font-size:1rem;font-weight:700;color:var(--text);font-family:'DM Serif Display',serif}
        .qr-stat-val.terra{color:var(--terra)}
        .qr-stat-lbl{font-size:0.6rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;font-weight:600}
        .qr-btn{padding:8px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);font-size:0.72rem;font-weight:600;cursor:pointer;color:var(--text-mid);font-family:'DM Sans',sans-serif;transition:all 0.15s;text-align:center;white-space:nowrap}
        .qr-btn:hover:not(:disabled){border-color:var(--border-md);color:var(--text)}
        .qr-btn:disabled{opacity:0.6;cursor:not-allowed}
        .qr-btn.primary{background:var(--rose);border-color:var(--rose);color:#fff}
        .qr-btn.primary:hover:not(:disabled){background:var(--rose-dark);border-color:var(--rose-dark)}
        .qr-btn.dark{background:#2a1f1d;border-color:#2a1f1d;color:#fff}
        .qr-btn.dark:hover:not(:disabled){background:#1a1210}
        .qr-btn.copied{background:var(--green-soft);border-color:var(--green);color:var(--green)}
        .logo-info{width:100%;margin-top:8px;padding:8px 12px;border-radius:8px;font-size:0.68rem;text-align:center;line-height:1.5}
        .logo-info.has-logo{background:var(--green-soft);color:var(--green);border:1px solid rgba(74,122,90,0.2)}
        .logo-info.neutral{background:var(--bg);color:var(--text-soft);border:1px solid var(--border)}
        .qr-customize-toggle{width:100%;padding:10px 20px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:transparent;border-left:none;border-right:none;border-bottom:none;font-family:'DM Sans',sans-serif}
        .qr-customize-toggle-left{display:flex;align-items:center;gap:8px}
        .qr-customize-label{font-size:0.74rem;font-weight:600;color:var(--text-mid)}
        .qr-customize-badge{font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:20px}
        .qr-customize-badge.pro{background:#fff3e8;color:var(--terra);border:1px solid #f0d0b0}
        .qr-customize-badge.business{background:var(--green-soft);color:var(--green);border:1px solid rgba(74,122,90,0.2)}
        .qr-chevron{font-size:0.7rem;color:var(--text-soft);transition:transform 0.2s}
        .qr-chevron.open{transform:rotate(180deg)}
        .qr-customize-panel{padding:16px 20px;background:var(--bg);border-top:1px solid var(--border)}
        .customize-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .customize-label{font-size:0.72rem;font-weight:600;color:var(--text)}
        .customize-sub{font-size:0.65rem;color:var(--text-soft);margin-top:1px}
        .color-input-wrap{display:flex;align-items:center;gap:6px}
        .color-input{width:32px;height:32px;border-radius:6px;border:1.5px solid var(--border);cursor:pointer;padding:2px;background:var(--surface)}
        .color-hex{font-size:0.72rem;color:var(--text-mid);font-family:monospace;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 8px;width:76px}
        .dot-style-pills{display:flex;gap:5px}
        .dot-pill{padding:4px 12px;border-radius:20px;border:1.5px solid var(--border);font-size:0.68rem;font-weight:600;cursor:pointer;background:var(--surface);color:var(--text-mid);transition:all 0.15s;font-family:'DM Sans',sans-serif}
        .dot-pill:hover{border-color:var(--rose);color:var(--rose)}
        .dot-pill.active{background:var(--rose-soft);border-color:var(--rose);color:var(--rose)}
        .locked-panel{padding:14px 20px;background:var(--bg);border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
        .locked-text{font-size:0.74rem;color:var(--text-soft);flex:1}
        .upgrade-btn{padding:6px 14px;border-radius:20px;border:none;background:var(--rose);color:#fff;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .upgrade-btn:hover{background:var(--rose-dark)}
        .empty-state{text-align:center;padding:56px 24px;background:var(--surface);border:1px solid var(--border);border-radius:14px}
        .empty-icon{font-size:2.5rem;margin-bottom:12px}
        .empty-title{font-family:'DM Serif Display',serif;font-size:1rem;color:var(--text);margin-bottom:6px}
        .empty-sub{font-size:0.78rem;color:var(--text-soft)}
        @media(max-width:600px){.qr-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="qr-page">
        <div className="qr-topbar">
          <div>
            <h2>QR Codes</h2>
            <p>Download and display your QR codes for customers to scan</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {showLogoActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-soft)', border: '1px solid rgba(74,122,90,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600 }}>
                <img src={logoUrl!} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
                Logo active
              </div>
            )}
            {showLogoUpload && (
              <button onClick={() => router.push('/dashboard/profile')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--rose-soft)', border: '1px solid rgba(176,92,82,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: '0.7rem', color: 'var(--rose)', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                ↑ Upload brand logo
              </button>
            )}
            <div className="plan-badge">
              <div className={`plan-dot ${plan}`}></div>
              <span style={{ color: 'var(--text-mid)', textTransform: 'capitalize' }}>{plan} Plan</span>
            </div>
          </div>
        </div>

        {forms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◻</div>
            <div className="empty-title">No forms yet</div>
            <div className="empty-sub">Create a form first to generate your QR codes</div>
          </div>
        ) : (
          <div className="qr-grid">
            {forms.map(form => {
              const config = configs[form.id] || DEFAULT_CONFIG
              const isExpanded = expandedForm === form.id
              const logoInfoClass = plan === 'business' && logoUrl ? 'has-logo' : 'neutral'
              const logoInfoText =
                plan === 'free' ? 'QRFeedback.ai brandmark shown in QR center'
                : plan === 'pro' ? 'Clean QR code — no center overlay'
                : logoUrl ? '✓ Your brand logo is shown in the QR center'
                : 'No logo uploaded · Add one in Profile to show it in the QR center'

              return (
                <div key={form.id} className="qr-card">
                  <div className="qr-card-top">
                    <div className="qr-canvas-wrap">
                      <canvas ref={el => { canvasRefs.current[form.id] = el; if (el && !rendered[form.id]) renderQR(form.id) }} />
                    </div>
                    <div className="qr-form-name">{form.title}</div>
                    {form.location_name && <div className="qr-location">📍 {form.location_name}</div>}
                    <div className="qr-stats">
                      <div className="qr-stat">
                        <div className="qr-stat-val">{form.response_count ?? 0}</div>
                        <div className="qr-stat-lbl">Responses</div>
                      </div>
                      <div className="qr-stat">
                        <div className={`qr-stat-val ${form.avg_rating ? 'terra' : ''}`}>
                          {form.avg_rating ? `${form.avg_rating}★` : '—'}
                        </div>
                        <div className="qr-stat-lbl">Avg Rating</div>
                      </div>
                    </div>

                    {/* Copy URL full width, PNG + Print side by side */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        className={`qr-btn ${copied === form.id ? 'copied' : ''}`}
                        style={{ width: '100%', padding: '9px 8px' }}
                        onClick={() => copyUrl(form.id)}
                      >
                        {copied === form.id ? '✓ Copied' : '🔗 Copy URL'}
                      </button>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="qr-btn primary" style={{ flex: 1 }} onClick={() => downloadQR(form.id, form.title)}>
                          ↓ PNG
                        </button>
                        <button className="qr-btn dark" style={{ flex: 1 }} disabled={downloadingPDF === form.id} onClick={() => printCard(form)}>
                          {downloadingPDF === form.id ? '...' : '🖨 Print'}
                        </button>
                      </div>
                    </div>

                    <div className={`logo-info ${logoInfoClass}`}>{logoInfoText}</div>
                  </div>

                  <button className="qr-customize-toggle" onClick={() => setExpandedForm(isExpanded ? null : form.id)}>
                    <div className="qr-customize-toggle-left">
                      <span className="qr-customize-label">Customize QR</span>
                      {!canCustomize && <span className="qr-customize-badge pro">Pro / Business</span>}
                      {canCustomize && canBrandName && <span className="qr-customize-badge business">White-label</span>}
                      {canCustomize && !canBrandName && <span className="qr-customize-badge pro">Pro</span>}
                    </div>
                    <span className={`qr-chevron ${isExpanded ? 'open' : ''}`}>▼</span>
                  </button>

                  {isExpanded && !canCustomize && (
                    <div className="locked-panel">
                      <span className="locked-text">Custom colors and styles are available on Pro and Business plans.</span>
                      <button className="upgrade-btn" onClick={() => router.push('/dashboard/profile')}>Upgrade</button>
                    </div>
                  )}

                  {isExpanded && canCustomize && (
                    <div className="qr-customize-panel">
                      <div className="customize-row">
                        <div><div className="customize-label">QR Color</div><div className="customize-sub">Color of the QR dots</div></div>
                        <div className="color-input-wrap">
                          <input type="color" className="color-input" value={config.fgColor} onChange={e => updateConfig(form.id, { fgColor: e.target.value })} />
                          <input type="text" className="color-hex" value={config.fgColor} onChange={e => updateConfig(form.id, { fgColor: e.target.value })} />
                        </div>
                      </div>
                      <div className="customize-row">
                        <div><div className="customize-label">Background</div><div className="customize-sub">Background color of the QR</div></div>
                        <div className="color-input-wrap">
                          <input type="color" className="color-input" value={config.bgColor} onChange={e => updateConfig(form.id, { bgColor: e.target.value })} />
                          <input type="text" className="color-hex" value={config.bgColor} onChange={e => updateConfig(form.id, { bgColor: e.target.value })} />
                        </div>
                      </div>
                      <div className="customize-row" style={{ marginBottom: 0 }}>
                        <div><div className="customize-label">Dot Style</div><div className="customize-sub">Shape of the QR modules</div></div>
                        <div className="dot-style-pills">
                          {DOT_STYLES.map(s => (
                            <button key={s.value} className={`dot-pill ${config.dotStyle === s.value ? 'active' : ''}`} onClick={() => updateConfig(form.id, { dotStyle: s.value })}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}