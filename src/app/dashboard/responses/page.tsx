'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type Response = {
  id: string
  form_id: string
  rating: number
  answers: Record<string, string | number>
  ai_processed: boolean
  ai_sentiment_score: number | null
  ai_category: string | null
  ai_summary: string | null
  ai_suggested_reply: string | null
  customer_email: string | null
  submitted_at: string
  form_title?: string
}

type FilterPeriod = 'today' | 'week' | 'month' | 'pick'

type AIUsage = {
  plan: string
  process: { used: number; limit: number; remaining: number }
  reply:   { used: number; limit: number; remaining: number }
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

const CATEGORY_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  food:        { label: '🍽 Food',        bg: '#fef3e8', color: '#c4696a' },
  service:     { label: '💼 Service',     bg: '#fef0f0', color: '#b05c52' },
  cleanliness: { label: '🧹 Cleanliness', bg: '#e8f4fb', color: '#3a7a9a' },
  pricing:     { label: '💰 Pricing',     bg: '#fefbe8', color: '#a07820' },
  waiting:     { label: '⏱ Wait Time',   bg: '#f0f0fe', color: '#5a5ab0' },
  other:       { label: '◈ Other',        bg: '#f5f0ee', color: '#7a5a56' },
}

function getDateRange(period: FilterPeriod, pickYear: number, pickMonth: number) {
  const nowUTC = new Date()
  const nowY = nowUTC.getUTCFullYear(), nowM = nowUTC.getUTCMonth(), nowD = nowUTC.getUTCDate(), nowDow = nowUTC.getUTCDay()
  let from: Date, to: Date
  if (period === 'today') {
    from = new Date(Date.UTC(nowY, nowM, nowD, 0, 0, 0, 0))
    to   = new Date(Date.UTC(nowY, nowM, nowD, 23, 59, 59, 999))
  } else if (period === 'week') {
    const diff = nowDow === 0 ? 6 : nowDow - 1
    from = new Date(Date.UTC(nowY, nowM, nowD - diff, 0, 0, 0, 0))
    to   = new Date(Date.UTC(nowY, nowM, nowD, 23, 59, 59, 999))
  } else if (period === 'month') {
    from = new Date(Date.UTC(nowY, nowM, 1, 0, 0, 0, 0))
    to   = new Date(Date.UTC(nowY, nowM, nowD, 23, 59, 59, 999))
  } else {
    from = new Date(Date.UTC(pickYear, pickMonth, 1, 0, 0, 0, 0))
    to   = new Date(Date.UTC(pickYear, pickMonth + 1, 0, 23, 59, 59, 999))
  }
  return { from, to }
}

function starStr(n: number) { return '★'.repeat(n) + '☆'.repeat(5 - n) }

function timeAgo(dateStr: string) {
  const submitted = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
  const diff = Date.now() - submitted.getTime()
  const mins = Math.floor(diff / 60000), hrs = Math.floor(mins / 60), days = Math.floor(hrs / 24)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return submitted.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(((score + 1) / 2) * 100)
  const color = score < -0.3 ? '#b05c52' : score < 0.3 ? '#c4896a' : '#4a7a5a'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: '0.62rem', color: '#b09490', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sentiment</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color }}>{score > 0 ? '+' : ''}{score.toFixed(2)}</span>
      </div>
      <div style={{ height: 5, background: '#f7ece9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: '0.55rem', color: '#b09490' }}>Negative</span>
        <span style={{ fontSize: '0.55rem', color: '#b09490' }}>Positive</span>
      </div>
    </div>
  )
}

function ReplyModal({ response, aiUsage, onClose, onReplyUsed }: {
  response: Response
  aiUsage: AIUsage | null
  onClose: () => void
  onReplyUsed: () => void
}) {
  const canUseAI = !!response.ai_suggested_reply && (aiUsage?.reply.remaining ?? 0) > 0
  const aiLimitReached = !!response.ai_suggested_reply && (aiUsage?.reply.remaining ?? 1) <= 0
  const [tab, setTab] = useState<'ai' | 'custom'>(canUseAI ? 'ai' : 'custom')
  const [replyText, setReplyText] = useState(canUseAI ? response.ai_suggested_reply! : '')
  const [aiLoading, setAILoading] = useState(false)

  async function handleSwitchToAI() {
    if (!canUseAI || tab === 'ai') return
    setAILoading(true)
    await fetch('/api/ai-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'reply' }),
    })
    setAILoading(false)
    setTab('ai')
    setReplyText(response.ai_suggested_reply || '')
    onReplyUsed()
  }

  function handleTabSwitch(newTab: 'ai' | 'custom') {
    if (newTab === 'ai') { handleSwitchToAI(); return }
    setTab('custom')
    setReplyText('')
  }

  function handleSend() {
    if (!replyText.trim() || !response.customer_email) return
    const to = encodeURIComponent(response.customer_email)
    const subject = encodeURIComponent('Following up on your recent experience')
    const body = encodeURIComponent(replyText.trim())
    window.open(`https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`, '_blank')
  }

  const replyLimit = aiUsage?.reply.limit ?? 0
  const replyUsed  = aiUsage?.reply.used ?? 0
  const replyRemaining = aiUsage?.reply.remaining ?? 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,31,29,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, border: '1px solid #e8d5cf', boxShadow: '0 24px 64px rgba(42,31,29,0.18)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #e8d5cf', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: '#2a1f1d', marginBottom: 3 }}>Reply to Customer</div>
            <div style={{ fontSize: '0.72rem', color: '#b09490', display: 'flex', alignItems: 'center', gap: 5, wordBreak: 'break-all' }}>
              <span>✉</span><span>{response.customer_email}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b09490', fontSize: '1.1rem', padding: 4, lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>

        {response.ai_suggested_reply && aiUsage && aiUsage.plan !== 'free' && (
          <div style={{ padding: '10px 20px 0' }}>
            <div style={{ background: aiLimitReached ? '#fef5f4' : '#edf4ef', border: `1px solid ${aiLimitReached ? '#f0c4be' : 'rgba(74,122,90,0.2)'}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: aiLimitReached ? '#8c3d34' : '#4a7a5a' }}>
                  {aiLimitReached ? '⚠ Daily AI reply limit reached' : `✦ AI replies today`}
                </span>
                {!aiLimitReached && (
                  <div style={{ flex: 1, height: 5, background: 'rgba(74,122,90,0.15)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                    <div style={{ height: '100%', width: `${(replyUsed / replyLimit) * 100}%`, background: replyUsed / replyLimit > 0.8 ? '#c4896a' : '#4a7a5a', borderRadius: 3 }} />
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: aiLimitReached ? '#8c3d34' : '#4a7a5a', whiteSpace: 'nowrap' }}>
                {replyUsed}/{replyLimit}
              </span>
            </div>
            {aiLimitReached && (
              <div style={{ fontSize: '0.69rem', color: '#7a5a56', marginTop: 5, padding: '0 2px' }}>
                You've used all {replyLimit} AI replies for today. Limit resets at midnight. You can still write a manual reply below.
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => !aiLimitReached && !aiLoading && handleTabSwitch('ai')}
            style={{ padding: '7px 14px', borderRadius: 20, border: '1.5px solid', fontSize: '0.76rem', fontWeight: 700,
              cursor: (!response.ai_suggested_reply || aiLimitReached) ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
              borderColor: tab === 'ai' ? '#b05c52' : '#e8d5cf',
              background: tab === 'ai' ? '#f7ece9' : 'transparent',
              color: tab === 'ai' ? '#b05c52' : aiLimitReached ? '#d0b0ac' : '#b09490',
              opacity: !response.ai_suggested_reply ? 0.4 : 1 }}>
            {aiLoading ? '...' : `✦ Use AI Reply${aiLimitReached ? ' (limit reached)' : replyRemaining < replyLimit ? ` (${replyRemaining} left)` : ''}`}
          </button>
          <button
            onClick={() => handleTabSwitch('custom')}
            style={{ padding: '7px 14px', borderRadius: 20, border: '1.5px solid', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
              borderColor: tab === 'custom' ? '#b05c52' : '#e8d5cf',
              background: tab === 'custom' ? '#f7ece9' : 'transparent',
              color: tab === 'custom' ? '#b05c52' : '#b09490' }}>
            ✏ Write Own
          </button>
        </div>

        <div style={{ padding: '8px 20px 0' }}>
          <div style={{ fontSize: '0.69rem', color: '#b09490', lineHeight: 1.5 }}>
            {tab === 'ai' ? "AI-drafted reply based on the customer's feedback. Edit before sending." : 'Write a personalised reply from scratch.'}
          </div>
        </div>

        <div style={{ padding: '12px 20px' }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
            placeholder={tab === 'custom' ? 'Write your reply to the customer here...' : ''}
            rows={6}
            style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e8d5cf', borderRadius: 10, fontSize: '0.82rem', color: '#2a1f1d', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.65, resize: 'vertical', outline: 'none', background: '#fdf6f4' }}
            onFocus={e => { e.target.style.borderColor = '#b05c52'; e.target.style.boxShadow = '0 0 0 3px rgba(176,92,82,0.08)' }}
            onBlur={e => { e.target.style.borderColor = '#e8d5cf'; e.target.style.boxShadow = 'none' }}
            autoFocus />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: '0.65rem', color: '#b09490' }}>{replyText.length > 0 ? `${replyText.length} characters` : ''}</span>
            {tab === 'ai' && replyText !== response.ai_suggested_reply && (
              <button onClick={() => setReplyText(response.ai_suggested_reply || '')}
                style={{ fontSize: '0.65rem', color: '#b05c52', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                ↺ Reset to AI reply
              </button>
            )}
          </div>
        </div>

        <div style={{ margin: '0 20px 14px', background: '#fef9ec', border: '1px solid #f0d98a', borderRadius: 9, padding: '9px 12px', fontSize: '0.69rem', color: '#7a6020', lineHeight: 1.5, display: 'flex', gap: 8 }}>
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>Clicking "Send Reply" will open your email client with this message pre-filled.</span>
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #e8d5cf', background: '#fff', fontSize: '0.8rem', fontWeight: 600, color: '#7a5a56', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
          <button onClick={handleSend} disabled={!replyText.trim()}
            style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: replyText.trim() ? '#b05c52' : '#f7ece9', color: replyText.trim() ? '#fff' : '#b09490', fontSize: '0.82rem', fontWeight: 700, cursor: replyText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif', boxShadow: replyText.trim() ? '0 3px 10px rgba(176,92,82,0.25)' : 'none' }}>
            ✉ Send Reply via Email
          </button>
        </div>
      </div>
    </div>
  )
}

function ResponsesPageInner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const formFilterParam = searchParams.get('form')

  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Response[]>([])
  const [forms, setForms] = useState<Record<string, string>>({})
  const [plan, setPlan] = useState('free')
  const [selectedForm, setSelectedForm] = useState<string>(formFilterParam || 'all')
  const [period, setPeriod] = useState<FilterPeriod>('week')
  const [pickYear, setPickYear] = useState(new Date().getUTCFullYear())
  const [pickMonth, setPickMonth] = useState(new Date().getUTCMonth())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [expandedReply, setExpandedReply] = useState<string | null>(null)
  const [replyModalResponse, setReplyModalResponse] = useState<Response | null>(null)
  const [aiUsage, setAIUsage] = useState<AIUsage | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const userPlan = profile?.plan || 'free'
    setPlan(userPlan)

    const { data: formsData } = await supabase.from('forms').select('id, title').eq('user_id', user.id)
    const formMap: Record<string, string> = {}
    formsData?.forEach((f: any) => { formMap[f.id] = f.title })
    setForms(formMap)

    const formIds = formsData?.map((f: any) => f.id) || []
    if (formIds.length === 0) { setLoading(false); return }

    const { data: allResponses } = await supabase
      .from('responses').select('*').in('form_id', formIds).order('submitted_at', { ascending: false })

    const mapped = (allResponses || []).map((r: any) => ({ ...r, form_title: formMap[r.form_id] || 'Unknown Form' }))
    setResponses(mapped)

    const nowUTC = new Date()
    const startOfMonthUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), 1))
    setMonthlyCount(mapped.filter((r: any) => new Date(r.submitted_at.endsWith('Z') ? r.submitted_at : r.submitted_at + 'Z') >= startOfMonthUTC).length)

    if (userPlan !== 'free') {
      const usageRes = await fetch('/api/ai-usage')
      if (usageRes.ok) setAIUsage(await usageRes.json())
    }

    setLoading(false)
  }

  function handleReplyUsed() {
    setAIUsage(prev => prev ? {
      ...prev,
      reply: {
        ...prev.reply,
        used: prev.reply.used + 1,
        remaining: Math.max(0, prev.reply.remaining - 1),
      }
    } : null)
  }

  const { from, to } = getDateRange(period, pickYear, pickMonth)
  const filtered = responses.filter(r => {
    const d = new Date(r.submitted_at.endsWith('Z') ? r.submitted_at : r.submitted_at + 'Z')
    return d >= from && d <= to && (selectedForm === 'all' || r.form_id === selectedForm)
  })

  const avgRating = filtered.length ? (filtered.reduce((s, r) => s + r.rating, 0) / filtered.length).toFixed(1) : '—'
  const positiveCount = filtered.filter(r => r.rating >= 4).length
  const negativeCount = filtered.filter(r => r.rating <= 3).length
  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : `${MONTH_NAMES[pickMonth]} ${pickYear}`
  const canExport = plan === 'pro' || plan === 'business'

  function exportCSV() {
    if (!canExport || filtered.length === 0) return
    const allAnswerKeys = new Set<string>()
    filtered.forEach(r => Object.keys(r.answers || {}).forEach(k => allAnswerKeys.add(k)))
    const answerKeys = Array.from(allAnswerKeys).sort((a, b) => parseInt(a) - parseInt(b))
    const headers = ['Form Name', 'Rating', 'Sentiment', 'AI Category', 'AI Summary', 'Customer Email', 'Submitted At', ...answerKeys.map(k => `Q${k}`)]
    const rows = filtered.map(r => {
      const sentiment = r.rating >= 4 ? 'Positive' : 'Negative'
      const date = new Date(r.submitted_at.endsWith('Z') ? r.submitted_at : r.submitted_at + 'Z')
        .toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      const answerCells = answerKeys.map(k => { const val = r.answers?.[k]; if (!val) return ''; if (Array.isArray(val)) return val.join('; '); return String(val).replace(/,/g, ';') })
      return [(r.form_title || '').replace(/,/g, ';'), r.rating, sentiment, r.ai_category || '', (r.ai_summary || '').replace(/,/g, ';'), r.customer_email || '', date, ...answerCells]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `responses-export-${new Date().toISOString().split('T')[0]}.csv`; link.click(); URL.revokeObjectURL(url)
  }

  function exportEmails() {
    if (!canExport) return
    const emails = [...new Set(filtered.filter(r => r.rating <= 3 && r.customer_email).map(r => r.customer_email as string))]
    if (emails.length === 0) return
    const csv = 'email\n' + emails.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `customer-emails-${new Date().toISOString().split('T')[0]}.csv`; link.click(); URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading responses...</div>
    </div>
  )

  return (
    <>
      <style>{`
        :root { --bg:#fdf6f4;--surface:#fff;--border:#e8d5cf;--border-md:#d9c2bb;--rose:#b05c52;--rose-dark:#8c3d34;--rose-soft:#f7ece9;--text:#2a1f1d;--text-mid:#7a5a56;--text-soft:#b09490;--terra:#c4896a;--green:#4a7a5a;--green-soft:#edf4ef; }
        .resp-page{max-width:860px}
        .ai-usage-bar{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .usage-section{display:flex;align-items:center;gap:8px;flex:1;min-width:140px}
        .usage-label{font-size:0.68rem;color:var(--text-soft);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap}
        .usage-track{flex:1;height:5px;background:var(--rose-soft);border-radius:3px;overflow:hidden;min-width:40px}
        .usage-fill{height:100%;border-radius:3px;transition:width 0.4s}
        .usage-nums{font-size:0.72rem;font-weight:700;color:var(--text);white-space:nowrap}
        .usage-divider{width:1px;height:28px;background:var(--border);flex-shrink:0}
        .usage-bar{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .usage-track-old{flex:1;min-width:80px;height:6px;background:var(--rose-soft);border-radius:3px;overflow:hidden}
        .upgrade-pill{padding:4px 12px;border-radius:20px;border:none;background:var(--rose);color:#fff;font-size:0.68rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .upgrade-pill:hover{background:var(--rose-dark)}
        .stats-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 14px}
        .stat-val{font-family:'DM Serif Display',serif;font-size:1.6rem;color:var(--text);line-height:1;margin-bottom:4px}
        .stat-val.green{color:var(--green)}.stat-val.rose{color:var(--rose)}.stat-val.terra{color:var(--terra)}
        .stat-label{font-size:0.65rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;font-weight:600}
        .filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap}
        .filter-label{font-size:0.72rem;color:var(--text-soft);font-weight:600}
        .filter-pill{padding:6px 12px;border-radius:20px;border:1.5px solid var(--border);font-size:0.74rem;font-weight:600;cursor:pointer;background:var(--bg);color:var(--text-mid);transition:all 0.15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .filter-pill:hover{border-color:var(--rose);color:var(--rose)}
        .filter-pill.active{background:var(--rose-soft);border-color:var(--rose);color:var(--rose)}
        .month-picker{display:flex;align-items:center;gap:6px;background:var(--surface);border:1.5px solid var(--border);border-radius:20px;padding:4px 12px}
        .month-picker select{border:none;background:transparent;font-size:0.74rem;color:var(--text-mid);font-family:'DM Sans',sans-serif;cursor:pointer;font-weight:600;outline:none}
        .export-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px}
        .section-hdr{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
        .section-hdr-title{font-family:'DM Serif Display',serif;font-size:1rem;color:var(--text);white-space:nowrap}
        .section-hdr-line{flex:1;height:1px;background:var(--border)}
        .section-hdr-count{font-size:0.65rem;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--rose-soft);color:var(--rose);white-space:nowrap}
        .export-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);font-size:0.76rem;font-weight:600;cursor:pointer;color:var(--text-mid);font-family:'DM Sans',sans-serif;transition:all 0.15s;white-space:nowrap}
        .export-btn:hover{border-color:var(--green);color:var(--green);background:var(--green-soft)}
        .export-btn.locked{opacity:0.5;cursor:default}
        .export-btn.locked:hover{border-color:var(--border);color:var(--text-mid);background:var(--surface)}
        .resp-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:10px;overflow:hidden;transition:box-shadow 0.2s}
        .resp-card:hover{box-shadow:0 4px 16px rgba(42,31,29,0.08)}
        .resp-card-top{padding:14px 16px;cursor:pointer;display:flex;align-items:flex-start;gap:12px}
        .rating-circle{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:1rem;font-weight:700;flex-shrink:0;border:2px solid}
        .rating-circle.pos{background:var(--green-soft);color:var(--green);border-color:rgba(74,122,90,0.2)}
        .rating-circle.neg{background:var(--rose-soft);color:var(--rose);border-color:rgba(176,92,82,0.2)}
        .resp-main{flex:1;min-width:0}
        .resp-top-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:5px;gap:8px}
        .resp-form-name{font-size:0.83rem;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .resp-time{font-size:0.68rem;color:var(--text-soft);white-space:nowrap;flex-shrink:0}
        .resp-stars{font-size:0.85rem;color:var(--terra);margin-bottom:5px;letter-spacing:1px}
        .resp-badges{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
        .resp-badge{font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:20px;border:1px solid;white-space:nowrap}
        .resp-badge.positive{background:var(--green-soft);color:var(--green);border-color:rgba(74,122,90,0.25)}
        .resp-badge.negative{background:var(--rose-soft);color:var(--rose);border-color:rgba(176,92,82,0.2)}
        .resp-badge.unprocessed{background:#fef9e8;color:#a07820;border-color:#e8d880}
        .resp-badge.has-email{background:#e8f4fb;color:#3a7a9a;border-color:rgba(58,122,154,0.25);cursor:pointer}
        .resp-preview{font-size:0.76rem;color:var(--text-mid);margin-top:6px;line-height:1.5;font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .resp-expand-icon{color:var(--text-soft);font-size:0.75rem;flex-shrink:0;margin-top:4px;transition:transform 0.2s}
        .resp-expand-icon.open{transform:rotate(180deg)}
        .resp-answers{border-top:1px solid var(--border);padding:14px 16px;background:var(--bg)}
        .answers-grid{display:flex;flex-direction:column;gap:8px}
        .answer-row{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 12px;display:flex;align-items:flex-start;gap:10px}
        .answer-q-num{font-size:0.6rem;font-weight:700;color:var(--rose);text-transform:uppercase;letter-spacing:0.5px;width:22px;flex-shrink:0;margin-top:2px}
        .answer-body{flex:1;min-width:0}
        .answer-q-text{font-size:0.72rem;color:var(--text-soft);margin-bottom:3px}
        .answer-val{font-size:0.8rem;font-weight:600;color:var(--text);word-break:break-word}
        .answer-val.stars{color:var(--terra);font-size:0.88rem;letter-spacing:1px}
        .answer-meta{font-size:0.65rem;color:var(--text-soft);margin-top:2px}
        .answers-footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap;gap:8px}
        .full-date{font-size:0.68rem;color:var(--text-soft)}
        .ai-badge{font-size:0.62rem;font-weight:700;padding:3px 9px;border-radius:20px}
        .ai-badge.pending{background:#fef9e8;color:#a07820;border:1px solid #e8d880}
        .ai-badge.done{background:var(--green-soft);color:var(--green);border:1px solid rgba(74,122,90,0.2)}
        .reply-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1.5px solid rgba(58,122,154,0.35);background:#e8f4fb;color:#3a7a9a;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;white-space:nowrap}
        .reply-btn:hover{background:#d0eaf5;border-color:#3a7a9a}
        .customer-email-strip{background:#e8f4fb;border:1px solid rgba(58,122,154,0.2);border-radius:9px;padding:10px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
        .customer-email-left{display:flex;align-items:center;gap:8px;min-width:0}
        .customer-email-label{font-size:0.62rem;font-weight:700;color:#3a7a9a;text-transform:uppercase;letter-spacing:0.5px}
        .customer-email-val{font-size:0.76rem;font-weight:600;color:#2a5a7a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ai-panel{margin-top:12px;border:1px solid rgba(176,92,82,0.15);border-radius:10px;overflow:hidden}
        .ai-panel-header{background:linear-gradient(135deg,#fdf0ee,#fff8f6);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(176,92,82,0.12)}
        .ai-panel-title{font-size:0.72rem;font-weight:700;color:var(--rose);display:flex;align-items:center;gap:6px}
        .ai-panel-body{padding:12px;background:var(--surface)}
        .ai-summary-box{background:var(--rose-soft);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:10px}
        .ai-summary-label{font-size:0.6rem;font-weight:700;color:var(--rose);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
        .ai-summary-text{font-size:0.78rem;color:var(--text);line-height:1.6}
        .ai-reply-toggle{width:100%;padding:8px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);font-size:0.74rem;font-weight:600;color:var(--text-mid);cursor:pointer;font-family:'DM Sans',sans-serif;text-align:left;display:flex;justify-content:space-between;align-items:center;transition:all 0.15s}
        .ai-reply-toggle:hover{border-color:var(--rose);color:var(--rose);background:var(--rose-soft)}
        .ai-reply-content{margin-top:8px;background:var(--green-soft);border:1px solid rgba(74,122,90,0.2);border-radius:8px;padding:10px 12px}
        .ai-reply-label{font-size:0.6rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px}
        .ai-reply-text{font-size:0.78rem;color:var(--text);line-height:1.65}
        .ai-pending-box{background:#fef9e8;border:1px solid #e8d880;border-radius:8px;padding:12px;display:flex;align-items:center;gap:10px}
        .ai-pending-spinner{width:16px;height:16px;border:2px solid #e8d880;border-top-color:#a07820;border-radius:50%;animation:spin 1s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .empty-state{text-align:center;padding:48px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px}
        .empty-icon{font-size:2.5rem;margin-bottom:12px}
        .empty-title{font-family:'DM Serif Display',serif;font-size:1rem;color:var(--text);margin-bottom:6px}
        .empty-sub{font-size:0.78rem;color:var(--text-soft)}
        @media(max-width:640px){.stats-strip{grid-template-columns:repeat(2,1fr);gap:8px}.stat-val{font-size:1.4rem}.resp-card-top{padding:12px;gap:10px}.rating-circle{width:36px;height:36px;font-size:0.9rem}.resp-answers{padding:12px}.export-bar{flex-direction:column;align-items:flex-start}.section-hdr{width:100%}}
      `}</style>

      {replyModalResponse && (
        <ReplyModal
          response={replyModalResponse}
          aiUsage={aiUsage}
          onClose={() => setReplyModalResponse(null)}
          onReplyUsed={handleReplyUsed}
        />
      )}

      <div className="resp-page">

        {plan === 'free' && (
          <div className="usage-bar">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600, whiteSpace: 'nowrap' }}>This month</span>
            <div className="usage-track-old"><div style={{ height: '100%', width: `${Math.min((monthlyCount / 50) * 100, 100)}%`, borderRadius: 3, background: 'linear-gradient(90deg, var(--rose), var(--terra))' }}></div></div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{monthlyCount}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>/ 50</span>
            {monthlyCount >= 40 && <button className="upgrade-pill" onClick={() => router.push('/dashboard/profile')}>Upgrade</button>}
          </div>
        )}

        {plan !== 'free' && aiUsage && (
          <div className="ai-usage-bar">
            <div className="usage-section">
              <span className="usage-label">AI Processing</span>
              <div className="usage-track">
                <div className="usage-fill" style={{
                  width: `${Math.min((aiUsage.process.used / aiUsage.process.limit) * 100, 100)}%`,
                  background: aiUsage.process.used / aiUsage.process.limit > 0.9 ? '#b05c52' : aiUsage.process.used / aiUsage.process.limit > 0.7 ? '#c4896a' : '#4a7a5a'
                }} />
              </div>
              <span className="usage-nums">{aiUsage.process.used.toLocaleString()} / {aiUsage.process.limit.toLocaleString()}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-soft)' }}>this month</span>
            </div>
            <div className="usage-divider" />
            <div className="usage-section">
              <span className="usage-label">AI Replies</span>
              <div className="usage-track">
                <div className="usage-fill" style={{
                  width: `${Math.min((aiUsage.reply.used / aiUsage.reply.limit) * 100, 100)}%`,
                  background: aiUsage.reply.remaining === 0 ? '#b05c52' : aiUsage.reply.used / aiUsage.reply.limit > 0.7 ? '#c4896a' : '#4a7a5a'
                }} />
              </div>
              <span className="usage-nums">{aiUsage.reply.used} / {aiUsage.reply.limit}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-soft)' }}>today</span>
            </div>
            {aiUsage.reply.remaining === 0 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--rose)', fontWeight: 700, background: 'var(--rose-soft)', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                AI replies reset at midnight
              </span>
            )}
          </div>
        )}

        <div className="stats-strip">
          <div className="stat-card"><div className="stat-val">{filtered.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-card"><div className="stat-val terra">{avgRating}</div><div className="stat-label">Avg Rating</div></div>
          <div className="stat-card"><div className="stat-val green">{positiveCount}</div><div className="stat-label">Positive</div></div>
          <div className="stat-card"><div className="stat-val rose">{negativeCount}</div><div className="stat-label">Negative</div></div>
        </div>

        <div className="filter-bar">
          <span className="filter-label">Show:</span>
          {Object.keys(forms).length > 1 && (
            <select value={selectedForm} onChange={e => setSelectedForm(e.target.value)} style={{ padding: '5px 10px', borderRadius: 20, border: '1.5px solid var(--border)', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-mid)', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', outline: 'none', maxWidth: 140 }}>
              <option value="all">All Forms</option>
              {Object.entries(forms).map(([id, title]) => <option key={id} value={id}>{title}</option>)}
            </select>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['today', 'week', 'month', 'pick'] as FilterPeriod[]).map(p => (
              <button key={p} className={`filter-pill ${period === p ? 'active' : ''}`} onClick={() => { setPeriod(p); if (p === 'pick') setShowPicker(true) }}>
                {p === 'today' ? 'Today' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Pick'}
              </button>
            ))}
          </div>
          {(period === 'pick' || showPicker) && (
            <div className="month-picker">
              <select value={pickMonth} onChange={e => setPickMonth(Number(e.target.value))}>{MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
              <select value={pickYear} onChange={e => setPickYear(Number(e.target.value))}>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select>
            </div>
          )}
        </div>

        <div className="export-bar">
          <div className="section-hdr">
            <div className="section-hdr-title">{periodLabel}</div>
            <div className="section-hdr-line"></div>
            <div className="section-hdr-count">{filtered.length} response{filtered.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!canExport && <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>🔒 Pro+</span>}
            <button className={`export-btn ${!canExport ? 'locked' : ''}`} onClick={canExport ? exportEmails : undefined}>✉ Export Emails</button>
            <button className={`export-btn ${!canExport ? 'locked' : ''}`} onClick={canExport ? exportCSV : undefined}>↓ Export CSV</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No responses {periodLabel.toLowerCase()}</div>
            <div className="empty-sub">Responses will appear here once customers scan your QR code and submit feedback</div>
          </div>
        ) : (
          filtered.map(r => {
            const isPos = r.rating >= 4
            const isExpanded = expandedId === r.id
            const isReplyExpanded = expandedReply === r.id
            const previewText = r.answers?.[7] as string || r.answers?.[8] as string || ''
            const catStyle = r.ai_category ? CATEGORY_STYLES[r.ai_category] || CATEGORY_STYLES.other : null
            const hasEmail = !isPos && !!r.customer_email

            return (
              <div key={r.id} className="resp-card">
                <div className="resp-card-top" onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                  <div className={`rating-circle ${isPos ? 'pos' : 'neg'}`}>{r.rating}</div>
                  <div className="resp-main">
                    <div className="resp-top-row">
                      <span className="resp-form-name">{r.form_title}</span>
                      <span className="resp-time">{timeAgo(r.submitted_at)}</span>
                    </div>
                    <div className="resp-stars">{starStr(r.rating)}</div>
                    <div className="resp-badges">
                      <span className={`resp-badge ${isPos ? 'positive' : 'negative'}`}>{isPos ? '😊 Positive' : '⚠ Negative'}</span>
                      {!isPos && !r.ai_processed && <span className="resp-badge unprocessed">⏳ Processing</span>}
                      {!isPos && r.ai_processed && catStyle && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.color}30` }}>{catStyle.label}</span>
                      )}
                      {hasEmail && (
                        <span className="resp-badge has-email" onClick={e => { e.stopPropagation(); setReplyModalResponse(r) }}>✉ Reply</span>
                      )}
                    </div>
                    {!isPos && r.ai_processed && r.ai_summary && !isExpanded && (
                      <div className="resp-preview">✦ {r.ai_summary}</div>
                    )}
                    {!r.ai_summary && previewText && !isExpanded && (
                      <div className="resp-preview">"{previewText}"</div>
                    )}
                  </div>
                  <div className={`resp-expand-icon ${isExpanded ? 'open' : ''}`}>▼</div>
                </div>

                {isExpanded && (
                  <div className="resp-answers">
                    {hasEmail && (
                      <div className="customer-email-strip">
                        <div className="customer-email-left">
                          <span style={{ fontSize: '1rem', flexShrink: 0 }}>✉</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="customer-email-label">Customer Email</div>
                            <div className="customer-email-val">{r.customer_email}</div>
                          </div>
                        </div>
                        <button className="reply-btn" onClick={e => { e.stopPropagation(); setReplyModalResponse(r) }}>✉ Reply</button>
                      </div>
                    )}

                    {!isPos && (
                      <div className="ai-panel" style={{ marginBottom: 12 }}>
                        <div className="ai-panel-header">
                          <div className="ai-panel-title">✦ AI Insights</div>
                          {r.ai_processed && catStyle && (
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: catStyle.bg, color: catStyle.color }}>{catStyle.label}</span>
                          )}
                        </div>
                        <div className="ai-panel-body">
                          {!r.ai_processed ? (
                            <div className="ai-pending-box">
                              <div className="ai-pending-spinner"></div>
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a07820', marginBottom: 2 }}>AI is processing this response</div>
                                <div style={{ fontSize: '0.68rem', color: '#c4a040' }}>Usually takes 10–15 seconds</div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {r.ai_summary && (
                                <div className="ai-summary-box">
                                  <div className="ai-summary-label">Summary</div>
                                  <div className="ai-summary-text">{r.ai_summary}</div>
                                </div>
                              )}
                              {r.ai_sentiment_score !== null && r.ai_sentiment_score !== undefined && (
                                <SentimentBar score={r.ai_sentiment_score} />
                              )}
                              {r.ai_suggested_reply && (
                                <div style={{ marginTop: 10 }}>
                                  <button className="ai-reply-toggle" onClick={e => { e.stopPropagation(); setExpandedReply(isReplyExpanded ? null : r.id) }}>
                                    <span>💬 Suggested Reply</span>
                                    <span style={{ fontSize: '0.7rem' }}>{isReplyExpanded ? '▲' : '▼'}</span>
                                  </button>
                                  {isReplyExpanded && (
                                    <div className="ai-reply-content">
                                      <div className="ai-reply-label">Suggested owner response</div>
                                      <div className="ai-reply-text">{r.ai_suggested_reply}</div>
                                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(r.ai_suggested_reply || '') }}
                                          style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(74,122,90,0.3)', background: 'transparent', fontSize: '0.7rem', fontWeight: 600, color: 'var(--green)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                          📋 Copy
                                        </button>
                                        {hasEmail && (
                                          <button onClick={e => { e.stopPropagation(); setReplyModalResponse(r) }}
                                            style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(58,122,154,0.3)', background: '#e8f4fb', fontSize: '0.7rem', fontWeight: 600, color: '#3a7a9a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                            ✉ Send
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="answers-grid">
                      {Object.entries(r.answers || {}).map(([qId, val]) => {
                        const qNum = parseInt(qId)
                        const isStarAnswer = typeof val === 'number' && val >= 1 && val <= 5
                        return (
                          <div key={qId} className="answer-row">
                            <div className="answer-q-num">Q{qNum}</div>
                            <div className="answer-body">
                              <div className="answer-val">
                                {isStarAnswer ? <span className="stars">{starStr(val as number)}</span> : String(val)}
                              </div>
                              {isStarAnswer && <div className="answer-meta">{['','Terrible','Poor','Average','Good','Excellent'][val as number]}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="answers-footer">
                      <span className="full-date">{formatDate(r.submitted_at)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {hasEmail && (
                          <button className="reply-btn" onClick={e => { e.stopPropagation(); setReplyModalResponse(r) }}>✉ Reply</button>
                        )}
                        <span className={`ai-badge ${r.ai_processed ? 'done' : 'pending'}`}>
                          {r.ai_processed ? '✦ AI Done' : '⏳ AI Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default function ResponsesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading responses...</div>
      </div>
    }>
      <ResponsesPageInner />
    </Suspense>
  )
}