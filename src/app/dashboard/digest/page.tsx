'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Digest = {
  id: string
  week_start: string
  week_end: string
  total_responses: number
  positive_count: number
  negative_count: number
  avg_rating: number
  top_issues: { category: string; count: number }[]
  top_positives: string[]
  areas_to_improve: string[]
  sentiment_trend: string
  ai_summary: string
  ai_action_items: string
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  food: '🍽 Food', service: '💼 Service', cleanliness: '🧹 Cleanliness',
  pricing: '💰 Pricing', waiting: '⏱ Wait Time', other: '◈ Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  food: '#b05c52', service: '#c4896a', cleanliness: '#3a7a9a',
  pricing: '#a07820', waiting: '#5a5ab0', other: '#7a5a56',
}

function formatWeek(start: string, end: string) {
  const s = new Date(start); const e = new Date(end)
  return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function formatWeekShort(start: string) {
  return new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

function toDateStr(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getCurrentMonday(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Mini calendar — click a date, highlights forward 7 days
function WeekCalendar({ selectedStart, onSelectStart }: { selectedStart: Date | null; onSelectStart: (d: Date) => void }) {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const weekEnd = selectedStart ? addDays(selectedStart, 6) : null
  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i))

  const today = new Date(); today.setHours(0, 0, 0, 0)

  const isInRange = (d: Date) => selectedStart && weekEnd ? d >= selectedStart && d <= weekEnd : false
  const isStart = (d: Date) => selectedStart ? isSameDay(d, selectedStart) : false
  const isEnd = (d: Date) => weekEnd ? isSameDay(d, weekEnd) : false

  const monthName = calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '1rem', padding: '2px 6px', lineHeight: 1 }}>‹</button>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text)' }}>{monthName}</div>
        <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '1rem', padding: '2px 6px', lineHeight: 1 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-soft)', textAlign: 'center' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const inRange = isInRange(day)
          const start = isStart(day)
          const end = isEnd(day)
          const isToday = isSameDay(day, today)
          const isFuture = day > today

          return (
            <div
              key={i}
              onClick={() => !isFuture && onSelectStart(new Date(day))}
              style={{
                padding: '5px 2px', textAlign: 'center', fontSize: '0.7rem',
                fontWeight: (start || end) ? 700 : inRange ? 600 : 400,
                borderRadius: start ? '6px 0 0 6px' : end ? '0 6px 6px 0' : inRange ? 0 : 6,
                background: start || end ? '#b05c52' : inRange ? 'rgba(176,92,82,0.13)' : 'transparent',
                color: start || end ? '#fff' : inRange ? '#8c3d34' : isFuture ? '#d9c2bb' : isToday ? '#b05c52' : 'var(--text)',
                cursor: isFuture ? 'not-allowed' : 'pointer',
                userSelect: 'none' as const,
                transition: 'background 0.12s',
              }}
            >
              {day.getDate()}
            </div>
          )
        })}
      </div>
      {selectedStart && weekEnd && (
        <div style={{ marginTop: 10, padding: '7px 10px', background: 'var(--rose-soft)', borderRadius: 8, fontSize: '0.71rem', color: 'var(--rose)', fontWeight: 600, textAlign: 'center' }}>
          📅 {selectedStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}

function SentimentDonut({ positive, negative }: { positive: number; negative: number }) {
  const total = positive + negative
  if (total === 0) return null
  const posPct = positive / total
  const negPct = negative / total
  const r = 36, cx = 44, cy = 44, stroke = 10
  const circ = 2 * Math.PI * r
  // Start from top (offset by 25% of circumference)
  const startOffset = circ * 0.25
  const posArc = circ * posPct
  const negArc = circ * negPct
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ebe8" strokeWidth={stroke} />
      {/* Positive arc — starts at top */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4a7a5a" strokeWidth={stroke}
        strokeDasharray={`${posArc} ${circ - posArc}`}
        strokeDashoffset={startOffset}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Negative arc — starts right after positive ends */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#b05c52" strokeWidth={stroke}
        strokeDasharray={`${negArc} ${circ - negArc}`}
        strokeDashoffset={startOffset - posArc}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#2a1f1d" fontFamily="DM Serif Display, serif">
        {Math.round(posPct * 100)}%
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fill="#b09490" fontFamily="DM Sans, sans-serif">
        positive
      </text>
    </svg>
  )
}

function CategoryBars({ issues }: { issues: { category: string; count: number }[] }) {
  if (!issues || issues.length === 0) return null
  const max = issues[0]?.count || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {issues.map((issue, i) => {
        const pct = Math.round((issue.count / max) * 100)
        const color = CATEGORY_COLORS[issue.category] || '#7a5a56'
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
              <span style={{ color: '#2a1f1d', fontWeight: 600 }}>{CATEGORY_LABELS[issue.category] || issue.category}</span>
              <span style={{ color, fontWeight: 700 }}>{issue.count} complaint{issue.count !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ height: 7, background: '#f5ede9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RatingSparkline({ digests, fullWidth = false }: { digests: Digest[], fullWidth?: boolean }) {
  if (digests.length < 2) return null
  const reversed = [...digests].reverse()
  const ratings = reversed.map(d => d.avg_rating)
  const min = Math.max(0, Math.min(...ratings) - 0.5)
  const max = Math.min(5, Math.max(...ratings) + 0.5)
  const W = fullWidth ? 580 : 280
  const H = 80, pad = 18
  const xStep = (W - pad * 2) / Math.max(ratings.length - 1, 1)
  const points = ratings.map((r, i) => {
    const x = pad + i * xStep
    const y = pad + (1 - (r - min) / (max - min)) * (H - pad * 2)
    return { x, y, r }
  })
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" height={H + 16} viewBox={`0 0 ${W} ${H + 16}`} style={{ minWidth: 220 }}>
        {[0, 0.5, 1].map((t, i) => { const y = pad + t * (H - pad * 2); return <line key={i} x1={pad} y1={y} x2={W - pad} y2={y} stroke="#e8d5cf" strokeWidth={1} strokeDasharray="3,3" /> })}
        <path d={`${pathD} L${points[points.length - 1].x},${H - pad} L${points[0].x},${H - pad} Z`} fill="rgba(176,92,82,0.08)" />
        <path d={pathD} fill="none" stroke="#b05c52" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke="#b05c52" strokeWidth={2} />
            <text x={p.x} y={H + 12} textAnchor="middle" fontSize="9" fill="#b09490" fontFamily="DM Sans, sans-serif">{formatWeekShort(reversed[i].week_start)}</text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2a1f1d" fontFamily="DM Sans, sans-serif">{p.r.toFixed(1)}★</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function DigestPage() {
  const supabase = createClient()
  const router = useRouter()
  const [digests, setDigests] = useState<Digest[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingCustom, setGeneratingCustom] = useState(false)
  const [genMsg, setGenMsg] = useState('')
  const [genError, setGenError] = useState('')
  const [selected, setSelected] = useState<Digest | null>(null)
  const [userId, setUserId] = useState('')

  // Date range state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', user.id).single()
    if (!profile || (profile.plan !== 'business' && profile.plan !== 'pro')) {
      router.push('/dashboard'); return
    }

    const { data } = await supabase
      .from('weekly_digests').select('*').eq('user_id', user.id)
      .order('week_start', { ascending: false }).limit(8)
    setDigests(data || [])
    if (data && data.length > 0) setSelected(data[0])
    setLoading(false)
  }

  async function generateDigest() {
    setGenerating(true)
    setGenMsg(''); setGenError('')
    const res = await fetch('/api/digest/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    const json = await res.json()
    setGenerating(false)
    if (json.success) {
      setGenMsg(`✓ Digest generated for ${json.totalResponses} responses!`)
      setTimeout(() => setGenMsg(''), 5000)
      loadData()
    } else {
      setGenError(json.reason || json.error || 'Failed to generate digest')
    }
  }

  async function generateCustomDigest() {
    if (!rangeStart) return
    setGeneratingCustom(true)
    setGenMsg(''); setGenError('')
    const weekEnd = addDays(rangeStart, 6)
    const res = await fetch('/api/digest/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        custom_start: toDateStr(rangeStart),
        custom_end: toDateStr(weekEnd),
        tz_offset: new Date().getTimezoneOffset(), // e.g. IST = -330
      }),
    })
    const json = await res.json()
    setGeneratingCustom(false)
    if (json.success) {
      setGenMsg(`✓ Custom digest generated for ${json.totalResponses} responses!`)
      setShowDatePicker(false); setRangeStart(null)
      setTimeout(() => setGenMsg(''), 5000)
      loadData()
    } else {
      setGenError(json.reason || json.error || 'Failed to generate digest')
    }
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function deleteDigest(dig: Digest, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(dig.id)
    const res = await fetch('/api/digest/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dig.id }),
    })
    if (res.ok) {
      setDigests(prev => prev.filter(d => d.id !== dig.id))
      if (selected?.id === dig.id) {
        const remaining = digests.filter(d => d.id !== dig.id)
        setSelected(remaining.length > 0 ? remaining[0] : null)
      }
    }
    setDeletingId(null)
  }

  const [downloading, setDownloading] = useState(false)

  async function downloadPDF() {
    if (!d || downloading) return
    setDownloading(true)

    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')

    const element = document.getElementById('digest-content')
    if (!element) { setDownloading(false); return }

    const originalWidth = element.style.width
    const originalMaxWidth = element.style.maxWidth
    element.style.width = '900px'
    element.style.maxWidth = '900px'

    // Hide the download button during capture
    const dlBtn = document.getElementById('pdf-download-btn')
    if (dlBtn) dlBtn.style.visibility = 'hidden'

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fdf6f4',
      width: 900,
      windowWidth: 900,
    })

    if (dlBtn) dlBtn.style.visibility = 'visible'
    element.style.width = originalWidth
    element.style.maxWidth = originalMaxWidth

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfW = 210
    const pdfH = 297
    const margin = 8
    const contentW = pdfW - margin * 2

    const pxToMm = contentW / canvas.width
    const pageContentH = pdfH - margin * 2
    const pxPerPage = pageContentH / pxToMm

    for (let page = 0; page * pxPerPage < canvas.height; page++) {
      if (page > 0) pdf.addPage()
      const srcY = Math.floor(page * pxPerPage)
      const srcH = Math.min(pxPerPage, canvas.height - srcY)
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = Math.ceil(srcH)
      const ctx = sliceCanvas.getContext('2d')!
      ctx.fillStyle = '#fdf6f4'
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)
      pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentW, srcH * pxToMm)
    }

    pdf.save(`digest-${d.week_start}-to-${d.week_end}.pdf`)
    setDownloading(false)
  }

  const trendIcon = (t: string) => t === 'improving' ? '📈' : t === 'declining' ? '📉' : '➡️'
  const trendColor = (t: string) => t === 'improving' ? '#4a7a5a' : t === 'declining' ? '#b05c52' : '#c4896a'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading digests...</div>
    </div>
  )

  const d = selected
  const monday = getCurrentMonday()
  const sunday = addDays(monday, 6)
  const currentWeekLabel = `${monday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`

  return (
    <>
      <style>{`
        :root {
          --bg: #fdf6f4; --surface: #ffffff; --border: #e8d5cf;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --green: #4a7a5a; --green-soft: #edf4ef;
        }
        .digest-wrap { display: grid; grid-template-columns: 260px 1fr; gap: 20px; max-width: 1060px; }
        .digest-sidebar { display: flex; flex-direction: column; gap: 10px; }

        .gen-btn { width: 100%; padding: 11px 14px; border-radius: 10px; border: none; background: var(--rose); color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 3px 10px rgba(176,92,82,0.25); text-align: left; display: flex; flex-direction: column; gap: 2px; }
        .gen-btn:hover:not(:disabled) { background: var(--rose-dark); transform: translateY(-1px); }
        .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .gen-btn-label { font-size: 0.82rem; font-weight: 700; }
        .gen-btn-week { font-size: 0.62rem; font-weight: 400; opacity: 0.75; }

        .divider-row { display: flex; align-items: center; gap: 8px; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 0.58rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }

        .custom-toggle { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-mid); font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; }
        .custom-toggle:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .custom-toggle.open { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }

        .gen-range-btn { width: 100%; padding: 10px; border-radius: 9px; border: none; background: var(--rose); color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 2px 8px rgba(176,92,82,0.2); }
        .gen-range-btn:hover:not(:disabled) { background: var(--rose-dark); transform: translateY(-1px); }
        .gen-range-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .cal-hint { font-size: 0.68rem; color: var(--text-soft); text-align: center; padding: 2px 0; }

        .gen-msg { background: var(--green-soft); border: 1px solid rgba(74,122,90,0.25); border-radius: 8px; padding: 9px 12px; font-size: 0.74rem; color: var(--green); font-weight: 600; }
        .gen-err { background: var(--rose-soft); border: 1px solid rgba(176,92,82,0.2); border-radius: 8px; padding: 9px 12px; font-size: 0.74rem; color: var(--rose); }

        .digest-list { display: flex; flex-direction: column; gap: 8px; }
        .digest-item { background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
        .digest-item:hover { border-color: var(--rose); }
        .digest-item.active { border-color: var(--rose); background: var(--rose-soft); }
        .digest-item-week { font-size: 0.78rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .digest-item-stats { font-size: 0.7rem; color: var(--text-soft); display: flex; gap: 10px; }
        .digest-delete-btn { background: none; border: none; cursor: pointer; font-size: 0.8rem; padding: 2px 4px; border-radius: 5px; color: var(--text-soft); opacity: 0; transition: all 0.15s; flex-shrink: 0; line-height: 1; }
        .digest-item:hover .digest-delete-btn { opacity: 1; }
        .digest-delete-btn:hover { background: #fef5f4; color: var(--rose); }
        .digest-delete-btn:disabled { cursor: not-allowed; opacity: 0.5; }

        .digest-main { display: flex; flex-direction: column; gap: 14px; }
        .d-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 22px; }
        .d-card-title { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .stat-box { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px; text-align: center; }
        .stat-box.green { background: var(--green-soft); border-color: rgba(74,122,90,0.25); }
        .stat-box.rose { background: var(--rose-soft); border-color: rgba(176,92,82,0.2); }
        .stat-box.amber { background: #fef9ec; border-color: #f0d98a; }
        .stat-val { font-family: 'DM Serif Display', serif; font-size: 1.8rem; line-height: 1; margin-bottom: 4px; }
        .stat-lbl { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-box { background: var(--rose-soft); border-left: 3px solid var(--rose); border-radius: 0 8px 8px 0; padding: 14px 16px; }
        .summary-text { font-size: 0.85rem; color: var(--text); line-height: 1.7; }
        .list-item { display: flex; gap: 8px; font-size: 0.82rem; color: var(--text); margin-bottom: 7px; line-height: 1.5; }
        .action-box { background: #fef9ec; border: 1px solid #f0d98a; border-radius: 10px; padding: 14px 16px; }
        .action-text { font-size: 0.82rem; color: var(--text); line-height: 1.7; }
        .empty-state { text-align: center; padding: 60px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
        .empty-icon { font-size: 2.5rem; margin-bottom: 14px; }
        .empty-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 8px; }
        .empty-sub { font-size: 0.78rem; color: var(--text-soft); line-height: 1.6; margin-bottom: 20px; }
        @media (max-width: 760px) { .digest-wrap { grid-template-columns: 1fr; } .stats-row { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="digest-wrap">
        {/* ── Sidebar ── */}
        <div className="digest-sidebar">

          {/* Generate current Mon–Sun */}
          <button className="gen-btn" onClick={generateDigest} disabled={generating || generatingCustom}>
            <span className="gen-btn-label">{generating ? '⏳ Generating...' : '✦ Generate This Week\'s Digest'}</span>
            <span className="gen-btn-week">{currentWeekLabel}</span>
          </button>

          {/* Divider */}
          <div className="divider-row">
            <div className="divider-line" />
            <span className="divider-text">or custom range</span>
            <div className="divider-line" />
          </div>

          {/* Custom date range toggle */}
          <button
            className={`custom-toggle ${showDatePicker ? 'open' : ''}`}
            onClick={() => { setShowDatePicker(!showDatePicker); setRangeStart(null) }}
          >
            <span>📅 Custom Date Range</span>
            <span style={{ fontSize: '0.75rem' }}>{showDatePicker ? '▲' : '▼'}</span>
          </button>

          {/* Calendar — only shown when toggled open */}
          {showDatePicker && (
            <>
              <WeekCalendar selectedStart={rangeStart} onSelectStart={setRangeStart} />
              {rangeStart ? (
                <button className="gen-range-btn" onClick={generateCustomDigest} disabled={generatingCustom}>
                  {generatingCustom ? '⏳ Generating...' : '✦ Generate for Selected Week'}
                </button>
              ) : (
                <div className="cal-hint">Pick a start date — next 7 days will highlight</div>
              )}
            </>
          )}

          {genMsg && <div className="gen-msg">{genMsg}</div>}
          {genError && <div className="gen-err">✗ {genError}</div>}

          {digests.length > 0 && (
            <div className="digest-list">
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-soft)', padding: '4px 2px' }}>Previous Digests</div>
              {digests.map(dig => (
                <div key={dig.id} className={`digest-item ${selected?.id === dig.id ? 'active' : ''}`} onClick={() => setSelected(dig)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="digest-item-week">{formatWeek(dig.week_start, dig.week_end)}</div>
                      <div className="digest-item-stats">
                        <span>{trendIcon(dig.sentiment_trend)} {dig.avg_rating.toFixed(1)}★</span>
                        <span>{dig.total_responses} reviews</span>
                      </div>
                    </div>
                    <button
                      className="digest-delete-btn"
                      onClick={(e) => deleteDigest(dig, e)}
                      disabled={deletingId === dig.id}
                      title="Delete digest"
                    >
                      {deletingId === dig.id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        {!d ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No digests yet</div>
            <div className="empty-sub">Generate your first weekly digest to see an AI-powered overview of your feedback, trends, and action items.</div>
            <button className="gen-btn" style={{ maxWidth: 260, margin: '0 auto' }} onClick={generateDigest} disabled={generating}>
              {generating ? '⏳ Generating...' : '✦ Generate First Digest'}
            </button>
          </div>
        ) : (
          <div className="digest-main" id="digest-content">

            <div className="d-card" style={{ background: 'linear-gradient(135deg, var(--rose-soft), var(--bg))' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', color: 'var(--text)', marginBottom: 4 }}>Weekly Digest</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{formatWeek(d.week_start, d.week_end)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    id="pdf-download-btn"
                    onClick={downloadPDF}
                    disabled={downloading}
                    style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-mid)', fontSize: '0.72rem', fontWeight: 600, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', opacity: downloading ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!downloading) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rose)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)' }}}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-mid)' }}
                  >
                    {downloading ? '⏳ Generating...' : '↓ Download PDF'}
                  </button>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: d.sentiment_trend === 'improving' ? 'var(--green-soft)' : d.sentiment_trend === 'declining' ? 'var(--rose-soft)' : '#fef9ec', color: trendColor(d.sentiment_trend), fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${trendColor(d.sentiment_trend)}33` }}>
                    {trendIcon(d.sentiment_trend)} {d.sentiment_trend.charAt(0).toUpperCase() + d.sentiment_trend.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-card">
              <div className="d-card-title" style={{ color: 'var(--text-soft)' }}>This Week's Numbers</div>
              <div className="stats-row">
                <div className="stat-box"><div className="stat-val" style={{ color: 'var(--text)' }}>{d.total_responses}</div><div className="stat-lbl" style={{ color: 'var(--text-soft)' }}>Total Reviews</div></div>
                <div className="stat-box green"><div className="stat-val" style={{ color: 'var(--green)' }}>{d.positive_count}</div><div className="stat-lbl" style={{ color: 'var(--green)' }}>Positive</div></div>
                <div className="stat-box rose"><div className="stat-val" style={{ color: 'var(--rose)' }}>{d.negative_count}</div><div className="stat-lbl" style={{ color: 'var(--rose)' }}>Negative</div></div>
                <div className="stat-box amber"><div className="stat-val" style={{ color: 'var(--terra)' }}>{d.avg_rating.toFixed(1)}★</div><div className="stat-lbl" style={{ color: trendColor(d.sentiment_trend) }}>Avg Rating</div></div>
              </div>
            </div>

            {(d.total_responses > 0 || (d.top_issues && d.top_issues.length > 0)) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="d-card">
                  <div className="d-card-title" style={{ color: 'var(--text-soft)' }}>Sentiment Breakdown</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <SentimentDonut positive={d.positive_count} negative={d.negative_count} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a7a5a', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text)' }}>Positive <strong style={{ color: 'var(--green)' }}>{d.positive_count}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#b05c52', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text)' }}>Negative <strong style={{ color: 'var(--rose)' }}>{d.negative_count}</strong></span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 4 }}>{d.total_responses} total reviews</div>
                    </div>
                  </div>
                </div>
                {d.top_issues && d.top_issues.length > 0 && (
                  <div className="d-card">
                    <div className="d-card-title" style={{ color: 'var(--rose)' }}>⚠ Top Complaint Areas</div>
                    <CategoryBars issues={d.top_issues} />
                  </div>
                )}
              </div>
            )}

            {d.ai_summary && (
              <div className="d-card">
                <div className="d-card-title" style={{ color: 'var(--rose)' }}>✦ AI Summary</div>
                <div className="summary-box"><div className="summary-text">{d.ai_summary}</div></div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {d.top_positives && d.top_positives.length > 0 && (
                <div className="d-card" style={{ background: 'var(--green-soft)', border: '1px solid rgba(74,122,90,0.2)' }}>
                  <div className="d-card-title" style={{ color: 'var(--green)' }}>😊 What Customers Loved</div>
                  {d.top_positives.map((p, i) => (<div key={i} className="list-item"><span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span><span>{p}</span></div>))}
                </div>
              )}
              {d.areas_to_improve && d.areas_to_improve.length > 0 && (
                <div className="d-card" style={{ background: 'var(--rose-soft)', border: '1px solid rgba(176,92,82,0.15)' }}>
                  <div className="d-card-title" style={{ color: 'var(--rose)' }}>📋 Areas to Improve</div>
                  {d.areas_to_improve.map((a, i) => (<div key={i} className="list-item"><span style={{ color: 'var(--rose)', flexShrink: 0 }}>→</span><span>{a}</span></div>))}
                </div>
              )}
              {digests.length >= 2 && (
                <div className="d-card" style={{ gridColumn: (d.top_positives?.length > 0 && d.areas_to_improve?.length > 0) ? '1 / -1' : 'auto' }}>
                  <div className="d-card-title" style={{ color: 'var(--text-soft)' }}>📈 Rating Trend (Week over Week)</div>
                  <RatingSparkline digests={digests} fullWidth={(d.top_positives?.length > 0 && d.areas_to_improve?.length > 0)} />
                </div>
              )}
            </div>

            {d.ai_action_items && (
              <div className="d-card">
                <div className="d-card-title" style={{ color: '#a07820' }}>⚡ This Week's Action Items</div>
                <div className="action-box"><div className="action-text">{d.ai_action_items}</div></div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  )
}