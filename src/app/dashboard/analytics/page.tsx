'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'

type Response = {
  id: string
  form_id: string
  rating: number
  answers: Record<string, string | number>
  submitted_at: string
}

type FilterRange = '7d' | '30d' | '90d' | 'all'

const ROSE = '#b05c52'
const TERRA = '#c4896a'
const GREEN = '#4a7a5a'
const AMBER = '#d4956a'
const SLATE = '#7a8a9a'
const COLORS = [ROSE, TERRA, GREEN, AMBER, SLATE, '#9a6a8a', '#6a8a9a']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getFromDate(range: FilterRange): Date {
  const now = new Date()
  if (range === '7d') return new Date(new Date().setDate(now.getDate() - 7))
  if (range === '30d') return new Date(new Date().setDate(now.getDate() - 30))
  if (range === '90d') return new Date(new Date().setDate(now.getDate() - 90))
  return new Date('2020-01-01')
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function getStats(data: Response[]) {
  const total = data.length
  const avg = total ? data.reduce((s, r) => s + r.rating, 0) / total : 0
  const positive = data.filter(r => r.rating >= 4).length
  const negative = data.filter(r => r.rating <= 3).length
  return { total, avg, positive, negative }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e8d5cf', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', color: '#2a1f1d', boxShadow: '0 4px 12px rgba(42,31,29,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#7a5a56' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || ROSE }}>
          {p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(p.name?.includes('Rating') || p.name?.includes('Avg') ? 1 : 0) : p.value}</b>
        </div>
      ))}
    </div>
  )
}

function LockedOverlay({ plan, requiredPlan = 'Pro' }: { plan: string, requiredPlan?: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 12, backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', background: 'rgba(253,246,244,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 8 }}>
      <div style={{ fontSize: '1.4rem' }}>🔒</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2a1f1d' }}>{requiredPlan} Feature</div>
      <div style={{ fontSize: '0.7rem', color: '#7a5a56', textAlign: 'center', maxWidth: 160 }}>Upgrade to {requiredPlan} to unlock this chart</div>
      <button onClick={() => window.location.href = '/dashboard/profile'} style={{ marginTop: 4, padding: '6px 16px', borderRadius: 20, border: 'none', background: '#b05c52', color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Upgrade →</button>
    </div>
  )
}

function AnalyticsPageInner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const formFilterParam = searchParams.get('form')

  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Response[]>([])
  const [forms, setForms] = useState<Record<string, string>>({})
  const [range, setRange] = useState<FilterRange>('30d')
  const [selectedForm, setSelectedForm] = useState<string>(formFilterParam || 'all')
  const [plan, setPlan] = useState('free')

  const [compA_from, setCompA_from] = useState('')
  const [compA_to, setCompA_to] = useState('')
  const [compB_from, setCompB_from] = useState('')
  const [compB_to, setCompB_to] = useState('')

  useEffect(() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    setCompA_from(new Date(y, m - 1, 1).toISOString().split('T')[0])
    setCompA_to(new Date(y, m, 0).toISOString().split('T')[0])
    setCompB_from(new Date(y, m, 1).toISOString().split('T')[0])
    setCompB_to(new Date(y, m + 1, 0).toISOString().split('T')[0])
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    setPlan(profile?.plan || 'free')
    const { data: formsData } = await supabase.from('forms').select('id, title').eq('user_id', user.id)
    const formMap: Record<string, string> = {}
    formsData?.forEach((f: any) => { formMap[f.id] = f.title })
    setForms(formMap)
    const formIds = formsData?.map((f: any) => f.id) || []
    if (formIds.length > 0) {
      const { data } = await supabase.from('responses').select('*').in('form_id', formIds).order('submitted_at', { ascending: true })
      setResponses(data || [])
    }
    setLoading(false)
  }

  const isFree = plan === 'free'
  const isPro = plan === 'pro'
  const isBusiness = plan === 'business'
  const effectiveRange: FilterRange = isFree && (range === '90d' || range === 'all') ? '30d' : range
  const fromDate = getFromDate(effectiveRange)

  const filtered = responses.filter(r =>
    new Date(r.submitted_at) >= fromDate && (selectedForm === 'all' || r.form_id === selectedForm)
  )

  const { total, avg: avgRating, positive, negative } = getStats(filtered)
  const posRate = total ? Math.round((positive / total) * 100) : 0

  const ratingsByDay: Record<string, number[]> = {}
  filtered.forEach(r => {
    const day = new Date(r.submitted_at).toISOString().split('T')[0]
    if (!ratingsByDay[day]) ratingsByDay[day] = []
    ratingsByDay[day].push(r.rating)
  })
  const ratingsOverTime = Object.entries(ratingsByDay).sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ratings]) => ({ date: formatDay(date), 'Avg Rating': parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)) }))

  const volumeByDay: Record<string, number> = {}
  filtered.forEach(r => {
    const day = new Date(r.submitted_at).toISOString().split('T')[0]
    volumeByDay[day] = (volumeByDay[day] || 0) + 1
  })
  const volumeOverTime = Object.entries(volumeByDay).sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: formatDay(date), Responses: count }))

  const sentimentData = [
    { name: 'Positive (4–5★)', value: positive, color: GREEN },
    { name: 'Negative (1–3★)', value: negative, color: ROSE },
  ].filter(d => d.value > 0)

  const ratingByForm: Record<string, number[]> = {}
  filtered.forEach(r => {
    const name = forms[r.form_id] || 'Unknown'
    if (!ratingByForm[name]) ratingByForm[name] = []
    ratingByForm[name].push(r.rating)
  })
  const avgByForm = Object.entries(ratingByForm).map(([name, ratings]) => ({
    name: name.length > 20 ? name.slice(0, 18) + '…' : name,
    'Avg Rating': parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)),
  }))

  const breakdownMap: Record<string, number> = {}
  filtered.forEach(r => {
    Object.values(r.answers || {}).forEach(val => {
      if (typeof val === 'string' && val.length > 0 && val.length < 60 && isNaN(Number(val))) {
        breakdownMap[val] = (breakdownMap[val] || 0) + 1
      }
    })
  })
  const breakdownData = Object.entries(breakdownMap).sort(([, a], [, b]) => b - a).slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  const dowCounts = Array(7).fill(0)
  filtered.forEach(r => { dowCounts[new Date(r.submitted_at).getDay()]++ })
  const maxDow = Math.max(...dowCounts, 1)
  const dowData = DAYS.map((day, i) => ({ day, count: dowCounts[i] }))

  function getCompStats(fromStr: string, toStr: string) {
    if (!fromStr || !toStr) return { total: 0, avg: 0, positive: 0, negative: 0 }
    const from = new Date(fromStr), to = new Date(toStr + 'T23:59:59')
    return getStats(filtered.filter(r => {
      const d = new Date(r.submitted_at)
      return d >= from && d <= to
    }))
  }
  const compA = getCompStats(compA_from, compA_to)
  const compB = getCompStats(compB_from, compB_to)

  const canExport = isPro || isBusiness

  function exportCSV() {
    if (!canExport || filtered.length === 0) return
    const allAnswerKeys = new Set<string>()
    filtered.forEach(r => Object.keys(r.answers || {}).forEach(k => allAnswerKeys.add(k)))
    const answerKeys = Array.from(allAnswerKeys).sort((a, b) => parseInt(a) - parseInt(b))
    const headers = ['Form Name', 'Rating', 'Sentiment', 'Submitted At', ...answerKeys.map(k => `Q${k}`)]
    const rows = filtered.map(r => {
      const sentiment = r.rating >= 4 ? 'Positive' : 'Negative'
      const date = new Date(r.submitted_at.endsWith('Z') ? r.submitted_at : r.submitted_at + 'Z')
        .toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      const answerCells = answerKeys.map(k => {
        const val = r.answers?.[k]
        if (val === undefined || val === null) return ''
        if (Array.isArray(val)) return val.join('; ')
        return String(val).replace(/,/g, ';')
      })
      return [(forms[r.form_id] || 'Unknown').replace(/,/g, ';'), r.rating, sentiment, date, ...answerCells]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
    link.click(); URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading analytics...</div>
    </div>
  )

  const availableRanges: { val: FilterRange; label: string; locked: boolean }[] = [
    { val: '7d',  label: 'Last 7 days',  locked: false },
    { val: '30d', label: 'Last 30 days', locked: false },
    { val: '90d', label: 'Last 90 days', locked: isFree },
    { val: 'all', label: 'All time',     locked: isFree },
  ]

  return (
    <>
      <style>{`
        :root { --bg:#fdf6f4;--surface:#fff;--border:#e8d5cf;--border-md:#d9c2bb;--rose:#b05c52;--rose-dark:#8c3d34;--rose-soft:#f7ece9;--text:#2a1f1d;--text-mid:#7a5a56;--text-soft:#b09490;--terra:#c4896a;--green:#4a7a5a;--green-soft:#edf4ef; }
        .analytics-page{max-width:960px}
        .an-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
        .an-topbar-left h2{font-family:'DM Serif Display',serif;font-size:1.1rem;color:var(--text);margin-bottom:3px}
        .an-topbar-left p{font-size:0.75rem;color:var(--text-soft)}
        .range-pills{display:flex;gap:5px;flex-wrap:wrap}
        .range-pill{padding:6px 13px;border-radius:20px;border:1.5px solid var(--border);font-size:0.74rem;font-weight:600;cursor:pointer;background:var(--bg);color:var(--text-mid);transition:all 0.15s;font-family:'DM Sans',sans-serif}
        .range-pill:hover:not(.locked-pill){border-color:var(--rose);color:var(--rose)}
        .range-pill.active{background:var(--rose-soft);border-color:var(--rose);color:var(--rose)}
        .range-pill.locked-pill{opacity:0.5;cursor:default}
        .stats-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px}
        .stat-val{font-family:'DM Serif Display',serif;font-size:1.8rem;color:var(--text);line-height:1;margin-bottom:5px}
        .stat-val.green{color:var(--green)}.stat-val.rose{color:var(--rose)}.stat-val.terra{color:var(--terra)}
        .stat-label{font-size:0.68rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;font-weight:600}
        .stat-sub{font-size:0.7rem;color:var(--text-soft);margin-top:3px}
        .charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .chart-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative;overflow:hidden}
        .chart-card.full{grid-column:1/-1}
        .chart-title{font-family:'DM Serif Display',serif;font-size:0.95rem;color:var(--text);margin-bottom:4px}
        .chart-sub{font-size:0.7rem;color:var(--text-soft);margin-bottom:16px}
        .breakdown-list{display:flex;flex-direction:column;gap:8px}
        .breakdown-row{display:flex;align-items:center;gap:10px}
        .breakdown-label{font-size:0.75rem;color:var(--text-mid);width:160px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .breakdown-track{flex:1;height:8px;background:var(--rose-soft);border-radius:4px;overflow:hidden}
        .breakdown-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--rose),var(--terra));transition:width 0.5s}
        .breakdown-count{font-size:0.72rem;font-weight:700;color:var(--text);width:24px;text-align:right;flex-shrink:0}
        .empty-chart{height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px}
        .empty-chart-icon{font-size:1.5rem}.empty-chart-text{font-size:0.75rem;color:var(--text-soft)}
        .form-select{padding:6px 28px 6px 12px;border-radius:20px;border:1.5px solid var(--border);font-size:0.74rem;font-weight:600;color:var(--text-mid);background:var(--bg);font-family:'DM Sans',sans-serif;cursor:pointer;outline:none;transition:all 0.15s;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23b09490' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
        .export-btn{display:flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);font-size:0.76rem;font-weight:600;cursor:pointer;color:var(--text-mid);font-family:'DM Sans',sans-serif;transition:all 0.15s;white-space:nowrap}
        .export-btn:hover{border-color:var(--green);color:var(--green);background:var(--green-soft)}
        .export-btn.locked{opacity:0.5;cursor:default}
        .export-btn.locked:hover{border-color:var(--border);color:var(--text-mid);background:var(--surface)}
        .dow-grid{display:flex;gap:8px;align-items:flex-end}
        .dow-col{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1}
        .dow-bar-track{width:100%;height:100px;background:var(--rose-soft);border-radius:6px;display:flex;align-items:flex-end;overflow:hidden}
        .dow-bar-fill{width:100%;border-radius:6px 6px 0 0;background:linear-gradient(180deg,var(--rose),var(--terra));transition:height 0.5s;min-height:4px}
        .dow-label{font-size:0.68rem;font-weight:700;color:var(--text-soft)}
        .dow-count{font-size:0.7rem;font-weight:700;color:var(--text)}
        .comp-section{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:12px;position:relative;overflow:hidden}
        .comp-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:start}
        .comp-panel{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px}
        .comp-panel-title{font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px}
        .comp-date-row{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
        .comp-date-input{padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:0.74rem;color:var(--text);font-family:'DM Sans',sans-serif;background:var(--surface);outline:none;flex:1;min-width:110px}
        .comp-date-input:focus{border-color:var(--rose)}
        .comp-stat{margin-bottom:8px}
        .comp-stat-val{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--text)}
        .comp-stat-label{font-size:0.65rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px}
        .comp-vs{display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:var(--text-soft);padding-top:40px}
        .comp-delta{display:inline-flex;align-items:center;gap:3px;font-size:0.68rem;font-weight:700;padding:2px 7px;border-radius:20px;margin-left:6px}
        .comp-delta.up{background:var(--green-soft);color:var(--green)}
        .comp-delta.down{background:var(--rose-soft);color:var(--rose)}
        .comp-delta.neutral{background:#f0f0f0;color:#888}
        .plan-badge{display:inline-flex;align-items:center;gap:4px;font-size:0.62rem;font-weight:700;padding:2px 8px;border-radius:20px;background:var(--green-soft);color:var(--green);border:1px solid rgba(74,122,90,0.2);margin-left:8px}
        @media(max-width:640px){.stats-strip{grid-template-columns:repeat(2,1fr)}.charts-grid{grid-template-columns:1fr}.chart-card.full{grid-column:1}.comp-grid{grid-template-columns:1fr}.comp-vs{padding-top:0}}
      `}</style>

      <div className="analytics-page">
        <div className="an-topbar">
          <div className="an-topbar-left">
            <h2>Analytics
              {isBusiness && <span className="plan-badge">✦ Business</span>}
              {isPro && <span className="plan-badge" style={{background:'#fef3e8',color:'#c4896a',borderColor:'#f0d8c0'}}>◈ Pro</span>}
            </h2>
            <p>Insights from your customer feedback</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            {!isFree && Object.keys(forms).length > 1 && (
              <select className="form-select" value={selectedForm} onChange={e => setSelectedForm(e.target.value)}>
                <option value="all">All Forms</option>
                {Object.entries(forms).map(([id, title]) => <option key={id} value={id}>{title}</option>)}
              </select>
            )}
            <div className="range-pills">
              {availableRanges.map(({ val, label, locked }) => (
                <button key={val} className={`range-pill ${effectiveRange === val ? 'active' : ''} ${locked ? 'locked-pill' : ''}`}
                  onClick={() => !locked && setRange(val)}>
                  {locked && '🔒 '}{label}
                </button>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {!canExport && <span style={{fontSize:'0.68rem',color:'var(--text-soft)'}}>🔒 Pro+</span>}
              <button className={`export-btn ${!canExport ? 'locked' : ''}`} onClick={canExport ? exportCSV : undefined}>↓ Export CSV</button>
            </div>
          </div>
        </div>

        {isFree && (
          <div style={{background:'#fef9e8',border:'1px solid #e8d880',borderRadius:10,padding:'10px 16px',marginBottom:16,fontSize:'0.78rem',color:'#a07820',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <span>🔒 You're on the <b>Free plan</b> — date range limited to 30 days. Advanced charts on Pro and Business.</span>
            <button onClick={() => window.location.href='/dashboard/profile'} style={{padding:'5px 14px',borderRadius:20,border:'none',background:'#b05c52',color:'#fff',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>Upgrade →</button>
          </div>
        )}

        <div className="stats-strip">
          <div className="stat-card"><div className="stat-val">{total}</div><div className="stat-label">Total Responses</div></div>
          <div className="stat-card"><div className="stat-val terra">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div><div className="stat-label">Avg Rating</div><div className="stat-sub">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</div></div>
          <div className="stat-card"><div className="stat-val green">{positive}</div><div className="stat-label">Positive Reviews</div><div className="stat-sub">{posRate}% of total</div></div>
          <div className="stat-card"><div className="stat-val rose">{negative}</div><div className="stat-label">Negative Reviews</div><div className="stat-sub">{total ? 100 - posRate : 0}% of total</div></div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">Ratings Over Time</div>
            <div className="chart-sub">Daily average star rating</div>
            {ratingsOverTime.length === 0 ? <div className="empty-chart"><div className="empty-chart-icon">📈</div><div className="empty-chart-text">No data for this period</div></div> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={ratingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0"/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#b09490'}}/>
                  <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{fontSize:10,fill:'#b09490'}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line type="monotone" dataKey="Avg Rating" stroke={ROSE} strokeWidth={2.5} dot={{fill:ROSE,r:4}} activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-title">Sentiment Breakdown</div>
            <div className="chart-sub">Positive vs negative responses</div>
            {sentimentData.length === 0 ? <div className="empty-chart"><div className="empty-chart-icon">🍩</div><div className="empty-chart-text">No data for this period</div></div> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'0.72rem'}}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-title">Response Volume</div>
            <div className="chart-sub">Number of responses per day</div>
            {volumeOverTime.length === 0 ? <div className="empty-chart"><div className="empty-chart-icon">📊</div><div className="empty-chart-text">No data for this period</div></div> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={volumeOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0"/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#b09490'}}/>
                  <YAxis allowDecimals={false} tick={{fontSize:10,fill:'#b09490'}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="Responses" fill={TERRA} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )}
            {isFree && <LockedOverlay plan={plan}/>}
          </div>

          <div className="chart-card">
            <div className="chart-title">Rating by Form</div>
            <div className="chart-sub">Average star rating per form</div>
            {avgByForm.length === 0 ? <div className="empty-chart"><div className="empty-chart-icon">📋</div><div className="empty-chart-text">No data for this period</div></div> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={avgByForm} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0" horizontal={false}/>
                  <XAxis type="number" domain={[0,5]} ticks={[1,2,3,4,5]} tick={{fontSize:10,fill:'#b09490'}}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#b09490'}} width={80}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="Avg Rating" radius={[0,4,4,0]}>
                    {avgByForm.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {isFree && <LockedOverlay plan={plan}/>}
          </div>

          <div className="chart-card full">
            <div className="chart-title">Review Breakdown</div>
            <div className="chart-sub">Most common responses from choice questions</div>
            {breakdownData.length === 0 ? <div className="empty-chart"><div className="empty-chart-icon">◈</div><div className="empty-chart-text">No choice answers yet</div></div> : (
              <div className="breakdown-list">
                {breakdownData.map((item, i) => (
                  <div key={i} className="breakdown-row">
                    <div className="breakdown-label">{item.name}</div>
                    <div className="breakdown-track"><div className="breakdown-fill" style={{width:`${(item.count / breakdownData[0].count) * 100}%`}}/></div>
                    <div className="breakdown-count">{item.count}</div>
                  </div>
                ))}
              </div>
            )}
            {isFree && <LockedOverlay plan={plan}/>}
          </div>

          <div className="chart-card full">
            <div className="chart-title">Response Heatmap <span style={{fontSize:'0.7rem',color:'var(--text-soft)',fontFamily:'DM Sans,sans-serif',fontWeight:400}}>— by day of week</span></div>
            <div className="chart-sub">Which days get the most feedback</div>
            <div className="dow-grid">
              {dowData.map((d, i) => (
                <div key={i} className="dow-col">
                  <div className="dow-count">{d.count}</div>
                  <div className="dow-bar-track"><div className="dow-bar-fill" style={{height:`${Math.max((d.count / maxDow) * 100, 4)}%`}}/></div>
                  <div className="dow-label">{d.day}</div>
                </div>
              ))}
            </div>
            {!isBusiness && <LockedOverlay plan={plan} requiredPlan="Business"/>}
          </div>
        </div>

        <div className="comp-section">
          <div className="chart-title" style={{marginBottom:4}}>Comparison Mode <span style={{fontSize:'0.7rem',fontFamily:'DM Sans,sans-serif',fontWeight:400,color:'var(--text-soft)',marginLeft:8}}>Compare any two date ranges</span></div>
          <div className="chart-sub">Side-by-side metrics for two custom periods</div>
          <div className="comp-grid">
            <div className="comp-panel">
              <div className="comp-panel-title">Period A</div>
              <div className="comp-date-row">
                <input type="date" className="comp-date-input" value={compA_from} onChange={e => setCompA_from(e.target.value)}/>
                <span style={{fontSize:'0.72rem',color:'var(--text-soft)'}}>to</span>
                <input type="date" className="comp-date-input" value={compA_to} onChange={e => setCompA_to(e.target.value)}/>
              </div>
              {(['total','avg','positive','negative'] as const).map((key, i) => {
                const labels = ['Responses','Avg Rating','Positive','Negative']
                const colors = ['var(--text)', TERRA, GREEN, ROSE]
                const val = key === 'avg' ? compA.avg : compA[key]
                return <div key={key} className="comp-stat"><div className="comp-stat-val" style={{color:colors[i]}}>{key==='avg'?(val>0?(val as number).toFixed(1):'—'):val}</div><div className="comp-stat-label">{labels[i]}</div></div>
              })}
            </div>
            <div className="comp-vs">VS</div>
            <div className="comp-panel">
              <div className="comp-panel-title">Period B</div>
              <div className="comp-date-row">
                <input type="date" className="comp-date-input" value={compB_from} onChange={e => setCompB_from(e.target.value)}/>
                <span style={{fontSize:'0.72rem',color:'var(--text-soft)'}}>to</span>
                <input type="date" className="comp-date-input" value={compB_to} onChange={e => setCompB_to(e.target.value)}/>
              </div>
              {(['total','avg','positive','negative'] as const).map((key, i) => {
                const labels = ['Responses','Avg Rating','Positive','Negative']
                const colors = ['var(--text)', TERRA, GREEN, ROSE]
                const valA = key === 'avg' ? compA.avg : compA[key]
                const valB = key === 'avg' ? compB.avg : compB[key]
                const delta = valA > 0 ? ((valB - valA) / valA) * 100 : 0
                const improved = key === 'negative' ? delta < 0 : delta > 0
                return <div key={key} className="comp-stat"><div className="comp-stat-val" style={{color:colors[i]}}>{key==='avg'?(valB>0?(valB as number).toFixed(1):'—'):valB}{valA>0&&<span className={`comp-delta ${delta===0?'neutral':improved?'up':'down'}`}>{delta>0?'↑':delta<0?'↓':'='} {Math.abs(delta).toFixed(0)}%</span>}</div><div className="comp-stat-label">{labels[i]}</div></div>
              })}
            </div>
          </div>
          {!isBusiness && <LockedOverlay plan={plan} requiredPlan="Business"/>}
        </div>
      </div>
    </>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading analytics...</div>
      </div>
    }>
      <AnalyticsPageInner />
    </Suspense>
  )
}