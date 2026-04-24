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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath(); ctx.fill()
}

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
      } else {
        ctx.fillRect(x, y, moduleSize, moduleSize)
      }
    }
  }
}

// ── CENTER OVERLAY ──
// Business + logo uploaded → logo image in center
// Business + no logo      → nothing (clean QR)
// Pro                     → nothing (clean QR)
// Free                    → QRFeedback.ai text badge
async function drawCenterOverlay(
  ctx: CanvasRenderingContext2D,
  plan: string,
  businessName: string,
  logoUrl: string | null,
  centerX: number,
  centerY: number,
  qrSize: number
) {
  // Pro: always clean, no overlay
  if (plan === 'pro') return

  // Business with logo uploaded
  if (plan === 'business' && logoUrl) {
    const badgeR = qrSize * 0.13
    // White circle background
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(centerX, centerY, badgeR + 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
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
    } catch {
      // image load failed — fall through to nothing
    }
    return
  }

  // Business with no logo → clean QR
  if (plan === 'business' && !logoUrl) return

  // Free → QRFeedback.ai text badge
  if (plan === 'free') {
    const badgeR = qrSize * 0.13
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(centerX, centerY, badgeR + 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
    drawTextBadge(ctx, 'QRFeedback.ai', centerX, centerY, badgeR, true)
  }
}

function drawTextBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number, cy: number,
  radius: number,
  isRose: boolean
) {
  const maxW = radius * 1.7
  let fontSize = 9
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  while (ctx.measureText(text).width > maxW && fontSize > 5) {
    fontSize -= 0.5
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
  }
  ctx.fillStyle = isRose ? '#b05c52' : '#2a1f1d'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy)
  ctx.textBaseline = 'alphabetic'
}

// Preview QR (shown on dashboard cards)
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

// Full printable card
async function generatePrintCard(
  url: string, config: QRConfig, plan: string, businessName: string,
  formTitle: string, locationName: string | null, logoUrl: string | null
): Promise<HTMLCanvasElement> {
  const sc = 2.5
  const W = 340 * sc
  const H = 480 * sc

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#fdf8f3'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(176,92,82,0.04)'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 18 * sc) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }

  const headerH = 72 * sc
  const grad = ctx.createLinearGradient(0, 0, W, headerH)
  grad.addColorStop(0, '#2a1f1d')
  grad.addColorStop(1, '#4a3028')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, headerH)

  ctx.fillStyle = '#b05c52'
  ctx.fillRect(0, headerH - 3 * sc, W, 3 * sc)

  ctx.fillStyle = '#fdf8f3'
  ctx.font = `${5.5 * sc}px Georgia, serif`
  ctx.letterSpacing = `${2 * sc}px`
  ctx.textAlign = 'center'
  ctx.fillText('SCAN TO LEAVE YOUR FEEDBACK', W / 2, 28 * sc)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = 'rgba(196,137,106,0.8)'
  ctx.font = `${8 * sc}px Georgia, serif`
  ctx.fillText('✦', W / 2 - 24 * sc, 50 * sc)
  ctx.fillText('✦', W / 2 + 24 * sc, 50 * sc)
  ctx.fillStyle = '#c4896a'
  ctx.font = `italic ${8 * sc}px Georgia, serif`
  ctx.fillText('Your voice shapes our service', W / 2, 50 * sc)

  const qrPad = 20 * sc
  const qrSize = W - qrPad * 2
  const qrY = headerH + 16 * sc

  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(42,31,29,0.12)'
  ctx.shadowBlur = 12 * sc
  ctx.shadowOffsetY = 4 * sc
  ctx.fillRect(qrPad, qrY, qrSize, qrSize)
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  ctx.strokeStyle = '#e8d5cf'
  ctx.lineWidth = 1 * sc
  ctx.strokeRect(qrPad, qrY, qrSize, qrSize)

  const qrInnerPad = 10 * sc
  const qrInnerSize = qrSize - qrInnerPad * 2
  ctx.fillStyle = config.bgColor
  ctx.fillRect(qrPad + qrInnerPad, qrY + qrInnerPad, qrInnerSize, qrInnerSize)
  await drawQRModules(ctx, url, config, qrInnerSize, qrPad + qrInnerPad, qrY + qrInnerPad)
  await drawCenterOverlay(ctx, plan, businessName, logoUrl, W / 2, qrY + qrSize / 2, qrInnerSize)

  const infoY = qrY + qrSize + 20 * sc

  ctx.strokeStyle = '#e8d5cf'
  ctx.lineWidth = 1 * sc
  ctx.beginPath()
  ctx.moveTo(qrPad, infoY); ctx.lineTo(W / 2 - 14 * sc, infoY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(W / 2 + 14 * sc, infoY); ctx.lineTo(W - qrPad, infoY)
  ctx.stroke()
  ctx.fillStyle = '#b05c52'
  ctx.font = `${8 * sc}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.fillText('✦', W / 2, infoY + 3 * sc)

  ctx.fillStyle = '#2a1f1d'
  ctx.textAlign = 'center'
  const nameFontSize = 13 * sc
  ctx.font = `bold ${nameFontSize}px Georgia, serif`

  const maxW = W - qrPad * 2 - 8 * sc
  const nameWords = formTitle.split(' ')
  let nameLine = ''
  let nameY = infoY + 20 * sc
  const nameLineH = 16 * sc
  for (let i = 0; i < nameWords.length; i++) {
    const test = nameLine ? nameLine + ' ' + nameWords[i] : nameWords[i]
    if (ctx.measureText(test).width > maxW && nameLine) {
      ctx.fillText(nameLine, W / 2, nameY)
      nameLine = nameWords[i]; nameY += nameLineH
    } else nameLine = test
  }
  ctx.fillText(nameLine, W / 2, nameY)

  if (locationName) {
    const locY = nameY + 14 * sc
    ctx.fillStyle = '#7a5a56'
    ctx.font = `${8 * sc}px Georgia, serif`
    const locWords = locationName.split(' ')
    let locLine = ''; let locLineY = locY
    for (let i = 0; i < locWords.length; i++) {
      const test = locLine ? locLine + ' ' + locWords[i] : locWords[i]
      if (ctx.measureText(test).width > maxW && locLine) {
        ctx.fillText(locLine, W / 2, locLineY)
        locLine = locWords[i]; locLineY += 11 * sc
      } else locLine = test
    }
    ctx.fillText(locLine, W / 2, locLineY)
  }

  const footerH = 36 * sc
  const footerY = H - footerH

  if (plan === 'free') {
    ctx.fillStyle = '#2a1f1d'
    ctx.fillRect(0, footerY, W, footerH)
    ctx.fillStyle = '#b09490'
    ctx.font = `${6 * sc}px Georgia, serif`
    ctx.textAlign = 'center'
    ctx.letterSpacing = `${0.5 * sc}px`
    ctx.fillText('Powered by', W / 2, footerY + 13 * sc)
    ctx.letterSpacing = '0px'
    ctx.fillStyle = '#b05c52'
    ctx.font = `bold ${8 * sc}px Georgia, serif`
    ctx.fillText('QRFeedback.ai', W / 2, footerY + 26 * sc)
  } else {
    ctx.strokeStyle = '#e8d5cf'
    ctx.lineWidth = 1 * sc
    ctx.beginPath()
    ctx.moveTo(qrPad, footerY + 8 * sc)
    ctx.lineTo(W - qrPad, footerY + 8 * sc)
    ctx.stroke()
    ctx.fillStyle = '#b09490'
    ctx.font = `${5.5 * sc}px Georgia, serif`
    ctx.textAlign = 'center'
    ctx.letterSpacing = `${1 * sc}px`
    ctx.fillText('THANK YOU FOR YOUR FEEDBACK', W / 2, footerY + 24 * sc)
    ctx.letterSpacing = '0px'
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
    // Only use logo if Business plan
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
      const pw = window.open('', '_blank', 'width=640,height=760')
      if (!pw) { setDownloadingPDF(null); return }
      pw.document.write(`<!DOCTYPE html>
<html><head>
<title>QR Card — ${form.title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f0ebe7;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;padding:24px}
.card{width:340px;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(42,31,29,0.18)}
img{width:100%;display:block}
.actions{margin-top:20px;display:flex;gap:10px}
button{padding:10px 24px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:sans-serif}
.btn-print{background:#b05c52;color:#fff}
.btn-close{background:#fff;color:#2a1f1d;border:1.5px solid #e8d5cf}
@media print{body{background:white;padding:0}button{display:none!important}.card{box-shadow:none;border-radius:0;width:100%}@page{size:A5 portrait;margin:0.5cm}}
</style></head>
<body>
<div class="card"><img src="${imgData}"/></div>
<div class="actions">
<button class="btn-print" onclick="window.print()">🖨 Print / Save as PDF</button>
<button class="btn-close" onclick="window.close()">Close</button>
</div>
</body></html>`)
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

  // Topbar logo status — only relevant for Business users
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
        :root { --bg:#fdf6f4;--surface:#fff;--border:#e8d5cf;--border-md:#d9c2bb;--rose:#b05c52;--rose-dark:#8c3d34;--rose-soft:#f7ece9;--text:#2a1f1d;--text-mid:#7a5a56;--text-soft:#b09490;--terra:#c4896a;--green:#4a7a5a;--green-soft:#edf4ef; }
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
        .qr-actions{display:flex;gap:7px;width:100%;flex-wrap:wrap}
        .qr-btn{flex:1;min-width:70px;padding:8px 8px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);font-size:0.72rem;font-weight:600;cursor:pointer;color:var(--text-mid);font-family:'DM Sans',sans-serif;transition:all 0.15s;text-align:center;white-space:nowrap}
        .qr-btn:hover:not(:disabled){border-color:var(--border-md);color:var(--text)}
        .qr-btn:disabled{opacity:0.6;cursor:not-allowed}
        .qr-btn.primary{background:var(--rose);border-color:var(--rose);color:#fff}
        .qr-btn.primary:hover:not(:disabled){background:var(--rose-dark);border-color:var(--rose-dark)}
        .qr-btn.dark{background:#2a1f1d;border-color:#2a1f1d;color:#fff}
        .qr-btn.dark:hover:not(:disabled){background:#1a1210}
        .qr-btn.copied{background:var(--green-soft);border-color:var(--green);color:var(--green)}
        .logo-info{width:100%;margin-top:8px;padding:8px 12px;border-radius:8px;font-size:0.68rem;text-align:center;line-height:1.5}
        .logo-info.has-logo{background:var(--green-soft);color:var(--green);border:1px solid rgba(74,122,90,0.2)}
        .logo-info.no-logo{background:var(--rose-soft);color:var(--text-soft)}
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
            {/* Logo status — Business plan only */}
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

              // Per-card info banner
              const logoInfoClass = plan === 'business' && logoUrl ? 'has-logo' : 'neutral'
              const logoInfoText =
                plan === 'free'
                  ? 'QRFeedback.ai brandmark shown in QR center'
                  : plan === 'pro'
                  ? 'Clean QR code — no center overlay'
                  : logoUrl
                  ? '✓ Your brand logo is shown in the QR center'
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
                    <div className="qr-actions">
                      <button className={`qr-btn ${copied === form.id ? 'copied' : ''}`} onClick={() => copyUrl(form.id)}>
                        {copied === form.id ? '✓ Copied' : '🔗 Copy URL'}
                      </button>
                      <button className="qr-btn primary" onClick={() => downloadQR(form.id, form.title)}>↓ PNG</button>
                      <button className="qr-btn dark" disabled={downloadingPDF === form.id} onClick={() => printCard(form)}>
                        {downloadingPDF === form.id ? '...' : '🖨 Print'}
                      </button>
                    </div>
                    <div className={`logo-info ${logoInfoClass}`}>
                      {logoInfoText}
                    </div>
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