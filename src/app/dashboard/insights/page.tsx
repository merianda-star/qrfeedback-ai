'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'

type ProcessedResponse = {
  id: string
  form_id: string
  rating: number
  ai_category: string
  ai_summary: string
  ai_suggested_reply: string
  ai_sentiment_score: number
  submitted_at: string
  form_title?: string
}

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  food:        { label: '🍽 Food Quality',   color: '#c4696a', bg: '#fef3e8' },
  service:     { label: '💼 Service',         color: '#b05c52', bg: '#fef0f0' },
  cleanliness: { label: '🧹 Cleanliness',     color: '#3a7a9a', bg: '#e8f4fb' },
  pricing:     { label: '💰 Pricing',         color: '#a07820', bg: '#fefbe8' },
  waiting:     { label: '⏱ Wait Time',        color: '#5a5ab0', bg: '#f0f0fe' },
  other:       { label: '◈ Other',            color: '#7a5a56', bg: '#f5f0ee' },
}

const ROSE = '#b05c52'
const TERRA = '#c4896a'
const GREEN = '#4a7a5a'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e8d5cf', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', color: '#2a1f1d', boxShadow: '0 4px 12px rgba(42,31,29,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#7a5a56' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || ROSE }}>{p.name}: <b>{p.value}</b></div>
      ))}
    </div>
  )
}

export default function InsightsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('free')
  const [responses, setResponses] = useState<ProcessedResponse[]>([])
  const [forms, setForms] = useState<Record<string, string>>({})
  const [expandedReply, setExpandedReply] = useState<string | null>(null)
  const [totalNegative, setTotalNegative] = useState(0)
  const [selectedForm, setSelectedForm] = useState<string>('all')

  useEffect(() => { loadData() }, [])

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
    if (formIds.length === 0) { setLoading(false); return }

    // Count total negative responses
    const { count } = await supabase.from('responses').select('*', { count: 'exact', head: true })
      .in('form_id', formIds).lte('rating', 3)
    setTotalNegative(count || 0)

    // Load AI-processed responses
    const { data } = await supabase.from('responses').select('*')
      .in('form_id', formIds)
      .eq('ai_processed', true)
      .lte('rating', 3)
      .order('submitted_at', { ascending: false })

    setResponses((data || []).map((r: any) => ({ ...r, form_title: formMap[r.form_id] || 'Unknown Form' })))
    setLoading(false)
  }

  const isFree = plan === 'free'

  // Filter by selected form
  const filtered = selectedForm === 'all'
    ? responses
    : responses.filter(r => r.form_id === selectedForm)

  // Stats
  const total = filtered.length
  const avgSentiment = total ? filtered.reduce((s, r) => s + (r.ai_sentiment_score || 0), 0) / total : 0
  const processedRate = totalNegative > 0 ? Math.round((total / totalNegative) * 100) : 0

  // Category breakdown
  const categoryCount: Record<string, number> = {}
  filtered.forEach(r => {
    const cat = r.ai_category || 'other'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  const categoryData = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => ({
      name: CATEGORY_STYLES[cat]?.label || cat,
      count,
      color: CATEGORY_STYLES[cat]?.color || ROSE,
    }))

  const topCategory = categoryData[0]?.name || '—'

  // Sentiment over time (last 30 days by week)
  const weeklyMap: Record<string, number[]> = {}
  filtered.forEach(r => {
    const d = new Date(r.submitted_at)
    const weekKey = `Week ${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('en-IN', { month: 'short' })}`
    if (!weeklyMap[weekKey]) weeklyMap[weekKey] = []
    weeklyMap[weekKey].push(r.ai_sentiment_score || 0)
  })

  // Pie for sentiment distribution
  const sentimentPie = [
    { name: 'Strongly negative (< -0.5)', value: filtered.filter(r => r.ai_sentiment_score < -0.5).length, color: '#b05c52' },
    { name: 'Mildly negative (-0.5–0)', value: filtered.filter(r => r.ai_sentiment_score >= -0.5 && r.ai_sentiment_score < 0).length, color: '#c4896a' },
    { name: 'Neutral / mild (0–0.3)', value: filtered.filter(r => r.ai_sentiment_score >= 0).length, color: '#4a7a5a' },
  ].filter(d => d.value > 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading AI insights...</div>
    </div>
  )

  return (
    <>
      <style>{`
        :root {
          --bg: #fdf6f4; --surface: #ffffff; --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --green: #4a7a5a; --green-soft: #edf4ef;
        }
        .insights-page { max-width: 960px; }
        .ins-topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .ins-topbar h2 { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 3px; }
        .ins-topbar p { font-size: 0.75rem; color: var(--text-soft); }
        .plan-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: var(--green-soft); color: var(--green); border: 1px solid rgba(74,122,90,0.2); margin-left: 8px; }

        .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .stat-val { font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: var(--text); line-height: 1; margin-bottom: 5px; }
        .stat-val.green { color: var(--green); }
        .stat-val.rose { color: var(--rose); }
        .stat-val.terra { color: var(--terra); }
        .stat-label { font-size: 0.68rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .stat-sub { font-size: 0.7rem; color: var(--text-soft); margin-top: 3px; }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .chart-card.full { grid-column: 1 / -1; }
        .chart-title { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); margin-bottom: 4px; }
        .chart-sub { font-size: 0.7rem; color: var(--text-soft); margin-bottom: 16px; }
        .empty-chart { height: 160px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; }
        .empty-chart-icon { font-size: 1.5rem; }
        .empty-chart-text { font-size: 0.75rem; color: var(--text-soft); }

        .response-cards { display: flex; flex-direction: column; gap: 12px; }
        .insight-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .insight-card-header { padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid var(--border); background: var(--bg); }
        .insight-rating { width: 40px; height: 40px; border-radius: 50%; background: var(--rose-soft); border: 2px solid rgba(176,92,82,0.2); display: flex; align-items: center; justify-content: center; font-family: 'DM Serif Display', serif; font-size: 1rem; font-weight: 700; color: var(--rose); flex-shrink: 0; }
        .insight-meta { flex: 1; }
        .insight-meta-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; flex-wrap: wrap; gap: 4px; }
        .insight-form-name { font-size: 0.82rem; font-weight: 700; color: var(--text); }
        .insight-time { font-size: 0.68rem; color: var(--text-soft); }
        .insight-stars { font-size: 0.82rem; color: var(--terra); letter-spacing: 1px; }
        .cat-badge { font-size: 0.62rem; font-weight: 700; padding: 2px 9px; border-radius: 20px; margin-top: 4px; display: inline-block; }
        .insight-card-body { padding: 14px 16px; }
        .summary-box { background: var(--rose-soft); border: 1px solid var(--border); border-radius: 8px; padding: 10px 13px; margin-bottom: 12px; }
        .summary-label { font-size: 0.6rem; font-weight: 700; color: var(--rose); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .summary-text { font-size: 0.8rem; color: var(--text); line-height: 1.6; }
        .sentiment-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .sentiment-label { font-size: 0.68rem; color: var(--text-soft); font-weight: 600; white-space: nowrap; }
        .sentiment-track { flex: 1; height: 6px; background: var(--rose-soft); border-radius: 3px; overflow: hidden; }
        .sentiment-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
        .sentiment-val { font-size: 0.68rem; font-weight: 700; white-space: nowrap; }
        .reply-toggle { width: 100%; padding: 8px 13px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--bg); font-size: 0.74rem; font-weight: 600; color: var(--text-mid); cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s; }
        .reply-toggle:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .reply-content { margin-top: 8px; background: var(--green-soft); border: 1px solid rgba(74,122,90,0.2); border-radius: 8px; padding: 12px 13px; }
        .reply-label { font-size: 0.6rem; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .reply-text { font-size: 0.78rem; color: var(--text); line-height: 1.65; }

        .lock-overlay { background: var(--rose-soft); border: 1px solid var(--border); border-radius: 12px; padding: 40px; text-align: center; }
        .lock-icon { font-size: 2rem; margin-bottom: 14px; }
        .lock-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 8px; }
        .lock-sub { font-size: 0.82rem; color: var(--text-mid); margin-bottom: 20px; line-height: 1.6; max-width: 420px; margin-left: auto; margin-right: auto; }
        .lock-btn { padding: 10px 24px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .lock-btn:hover { background: var(--rose-dark); }

        .empty-state { text-align: center; padding: 48px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
        .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .empty-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); margin-bottom: 6px; }
        .empty-sub { font-size: 0.78rem; color: var(--text-soft); line-height: 1.6; }

        @media (max-width: 640px) {
          .stats-strip { grid-template-columns: repeat(2, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
          .chart-card.full { grid-column: 1; }
        }
      `}</style>

      <div className="insights-page">

        {/* Top bar */}
        <div className="ins-topbar">
          <div>
            <h2>AI Insights
              {(plan === 'pro' || plan === 'business') && (
                <span className="plan-badge">✦ {plan === 'business' ? 'Business' : 'Pro'}</span>
              )}
            </h2>
            <p>AI-powered analysis of your negative feedback</p>
          </div>
          {Object.keys(forms).length > 1 && !isFree && (
            <select
              value={selectedForm}
              onChange={e => setSelectedForm(e.target.value)}
              style={{
                padding: '7px 28px 7px 12px', borderRadius: 20,
                border: '1.5px solid var(--border)', fontSize: '0.74rem',
                fontWeight: 600, color: 'var(--text-mid)', background: 'var(--bg)',
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', outline: 'none',
                appearance: 'none' as const,
              }}
            >
              <option value="all">All Forms</option>
              {Object.entries(forms).map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Locked for free users */}
        {isFree ? (
          <div className="lock-overlay">
            <div className="lock-icon">✦</div>
            <div className="lock-title">AI Insights — Pro & Business Feature</div>
            <div className="lock-sub">Upgrade to Pro to unlock AI-powered complaint analysis. Every negative response is automatically classified, summarised, scored for sentiment, and comes with a suggested owner reply.</div>
            <button className="lock-btn" onClick={() => router.push('/dashboard/profile')}>Upgrade to Pro →</button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-strip">
              <div className="stat-card">
                <div className="stat-val">{total}</div>
                <div className="stat-label">Complaints Analysed</div>
                <div className="stat-sub">{processedRate}% of negatives</div>
              </div>
              <div className="stat-card">
                <div className="stat-val terra">{avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}</div>
                <div className="stat-label">Avg Sentiment</div>
                <div className="stat-sub">{avgSentiment < -0.5 ? 'Strongly negative' : avgSentiment < 0 ? 'Mildly negative' : 'Neutral'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-val rose" style={{ fontSize: '1rem', paddingTop: 6 }}>{topCategory}</div>
                <div className="stat-label">Top Complaint</div>
              </div>
              <div className="stat-card">
                <div className="stat-val green">{totalNegative}</div>
                <div className="stat-label">Total Negatives</div>
                <div className="stat-sub">All time</div>
              </div>
            </div>

            {total === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <div className="empty-title">No AI insights yet</div>
                <div className="empty-sub">
                  AI insights appear automatically when customers leave 1–3 star feedback.<br />
                  Each negative response is processed within 15 seconds of submission.
                </div>
              </div>
            ) : (
              <>
                {/* Charts */}
                <div className="charts-grid">
                  <div className="chart-card">
                    <div className="chart-title">Complaint Categories</div>
                    <div className="chart-sub">What customers complain about most</div>
                    {categoryData.length === 0 ? (
                      <div className="empty-chart"><div className="empty-chart-icon">📊</div><div className="empty-chart-text">No data yet</div></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={categoryData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#b09490' }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#b09490' }} width={100} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="chart-card">
                    <div className="chart-title">Sentiment Distribution</div>
                    <div className="chart-sub">How negative the complaints are</div>
                    {sentimentPie.length === 0 ? (
                      <div className="empty-chart"><div className="empty-chart-icon">🍩</div><div className="empty-chart-text">No data yet</div></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {sentimentPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.7rem' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Individual response cards */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: 'var(--text)' }}>Individual Complaints</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--rose-soft)', color: 'var(--rose)' }}>{total} processed</div>
                  </div>
                  <div className="response-cards">
                    {filtered.map(r => {
                      const catStyle = CATEGORY_STYLES[r.ai_category] || CATEGORY_STYLES.other
                      const sentColor = r.ai_sentiment_score < -0.3 ? ROSE : r.ai_sentiment_score < 0.3 ? TERRA : GREEN
                      const sentPct = Math.round(((r.ai_sentiment_score + 1) / 2) * 100)
                      const isReplyOpen = expandedReply === r.id

                      return (
                        <div key={r.id} className="insight-card">
                          <div className="insight-card-header">
                            <div className="insight-rating">{r.rating}</div>
                            <div className="insight-meta">
                              <div className="insight-meta-top">
                                <span className="insight-form-name">{r.form_title}</span>
                                <span className="insight-time">{new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="insight-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                              <span className="cat-badge" style={{ background: catStyle.bg, color: catStyle.color }}>{catStyle.label}</span>
                            </div>
                          </div>
                          <div className="insight-card-body">
                            {r.ai_summary && (
                              <div className="summary-box">
                                <div className="summary-label">AI Summary</div>
                                <div className="summary-text">{r.ai_summary}</div>
                              </div>
                            )}
                            <div className="sentiment-row">
                              <span className="sentiment-label">Sentiment</span>
                              <div className="sentiment-track">
                                <div className="sentiment-fill" style={{ width: `${sentPct}%`, background: sentColor }} />
                              </div>
                              <span className="sentiment-val" style={{ color: sentColor }}>
                                {r.ai_sentiment_score > 0 ? '+' : ''}{r.ai_sentiment_score.toFixed(2)}
                              </span>
                            </div>
                            {r.ai_suggested_reply && (
                              <>
                                <button className="reply-toggle" onClick={() => setExpandedReply(isReplyOpen ? null : r.id)}>
                                  <span>💬 Suggested Reply</span>
                                  <span style={{ fontSize: '0.7rem' }}>{isReplyOpen ? '▲' : '▼'}</span>
                                </button>
                                {isReplyOpen && (
                                  <div className="reply-content">
                                    <div className="reply-label">Suggested owner response</div>
                                    <div className="reply-text">{r.ai_suggested_reply}</div>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(r.ai_suggested_reply)}
                                      style={{ marginTop: 10, padding: '5px 13px', borderRadius: 7, border: '1px solid rgba(74,122,90,0.3)', background: 'transparent', fontSize: '0.7rem', fontWeight: 600, color: 'var(--green)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                      📋 Copy reply
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}