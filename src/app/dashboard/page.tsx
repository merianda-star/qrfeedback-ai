'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Form = {
  id: string; title: string; description: string
  created_at: string; review_mode: boolean
}

type Stats = {
  totalResponses: number; avgRating: number
  googleRedirects: number; negativeCount: number
}

const FREE_FORM_LIMIT = 3

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    startRef.current = null
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, decimals])

  return value
}

function AnimatedStat({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const animated = useCountUp(value, 1000, decimals)
  return <>{decimals > 0 ? animated.toFixed(decimals) : Math.floor(animated).toLocaleString()}{suffix}</>
}

export default function OverviewPage() {
  const supabase = createClient()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [stats, setStats] = useState<Stats>({ totalResponses: 0, avgRating: 0, googleRedirects: 0, negativeCount: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('free')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', user.id).single()
    setPlan(profile?.plan || 'free')

    const { data: formsData } = await supabase
      .from('forms').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (formsData) setForms(formsData)

    const formIds = formsData?.map((f: any) => f.id) || []
    const { data: responsesData } = formIds.length > 0
      ? await supabase.from('responses').select('rating, ai_processed').in('form_id', formIds)
      : { data: [] }

    if (responsesData) {
      const total = responsesData.length
      const avg = total > 0 ? responsesData.reduce((s: number, r: any) => s + (r.rating || 0), 0) / total : 0
      const positive = responsesData.filter((r: any) => r.rating >= 4).length
      const negative = responsesData.filter((r: any) => r.rating <= 3).length
      setStats({ totalResponses: total, avgRating: Math.round(avg * 10) / 10, googleRedirects: positive, negativeCount: negative })
    }
    setLoading(false)
  }

  function handleNewForm() {
    const isFree = !plan || plan === 'free'
    if (isFree && forms.length >= FREE_FORM_LIMIT) {
      setShowUpgradeModal(true)
    } else {
      setShowModal(true)
    }
  }

  async function createForm() {
    if (!newTitle.trim() || !user) return
    setCreating(true)
    const { data, error } = await supabase
      .from('forms').insert({ title: newTitle, description: newDesc, user_id: user.id })
      .select().single()
    if (!error && data) router.push(`/dashboard/forms/${data.id}`)
    setCreating(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading your dashboard...</div>
    </div>
  )

  const isFree = !plan || plan === 'free'
  const atFormLimit = isFree && forms.length >= FREE_FORM_LIMIT
  const positiveRate = stats.totalResponses > 0 ? Math.round((stats.googleRedirects / stats.totalResponses) * 100) : 0
  const negativeRate = stats.totalResponses > 0 ? Math.round((stats.negativeCount / stats.totalResponses) * 100) : 0

  const statCards = [
    { icon: '📊', label: 'Total Responses', value: stats.totalResponses, decimals: 0, display: stats.totalResponses === 0 ? '0' : null, sub: 'All time', cls: '', accent: '#c4896a' },
    { icon: '⭐', label: 'Average Rating', value: stats.avgRating, decimals: 1, display: stats.avgRating === 0 ? '—' : null, suffix: stats.avgRating > 0 ? '★' : '', sub: 'Across all forms', cls: '', accent: '#b05c52' },
    { icon: '🔗', label: 'Google Redirects', value: stats.googleRedirects, decimals: 0, display: null, sub: stats.totalResponses > 0 ? `${positiveRate}% positive rate` : 'No data yet', cls: stats.googleRedirects > 0 ? 'up' : '', accent: '#4a7a5a' },
    { icon: '🔒', label: 'Captured Privately', value: stats.negativeCount, decimals: 0, display: null, sub: stats.totalResponses > 0 ? `${negativeRate}% negative rate` : 'No data yet', cls: stats.negativeCount > 0 ? 'down' : '', accent: '#b05c52' },
  ]

  return (
    <>
      <style>{`
        :root {
          --bg: #fdf6f4; --surface: #ffffff;
          --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --green: #4a7a5a; --green-soft: #edf4ef;
        }

        /* ── Stat grid ── */
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .stat-card { background: var(--surface); border-radius: 12px; padding: 20px 20px 16px; border: 1px solid var(--border); transition: box-shadow 0.2s, transform 0.2s; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent-color); border-radius: 12px 12px 0 0; }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(176,92,82,0.1); transform: translateY(-2px); }
        .stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1rem; background: var(--rose-soft); margin-bottom: 14px; }
        .stat-label { font-size: 0.67rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .stat-value { font-family: 'DM Serif Display', serif; font-size: 2rem; color: var(--text); letter-spacing: -0.5px; margin-bottom: 5px; line-height: 1; animation: statPop 0.4s ease both; }
        @keyframes statPop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .stat-sub { font-size: 0.7rem; font-weight: 500; color: var(--text-soft); }
        .stat-sub.up { color: var(--green); }
        .stat-sub.down { color: var(--rose); }

        /* ── Section header ── */
        .section-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); gap: 8px; flex-wrap: wrap; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); }
        .section-link { font-size: 0.76rem; font-weight: 600; color: var(--rose); text-decoration: none; white-space: nowrap; }
        .section-link:hover { text-decoration: underline; }

        /* ── Forms grid ── */
        .forms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .form-card { background: var(--surface); border-radius: 10px; border: 1px solid var(--border); padding: 18px; transition: all 0.2s; }
        .form-card:hover { box-shadow: 0 4px 20px rgba(176,92,82,0.08); border-color: var(--border-md); }
        .fc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .fc-icon { width: 38px; height: 38px; border-radius: 9px; background: var(--rose-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .fc-badge { display: flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; background: var(--green-soft); border: 1px solid rgba(74,122,90,0.2); font-size: 0.6rem; font-weight: 700; color: var(--green); letter-spacing: 0.4px; text-transform: uppercase; }
        .fc-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); }
        .fc-name { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); margin-bottom: 4px; }
        .fc-desc { font-size: 0.74rem; color: var(--text-soft); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fc-date { font-size: 0.64rem; color: var(--text-soft); margin-bottom: 12px; }
        .fc-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .fc-btn { padding: 6px 12px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); font-size: 0.72rem; font-weight: 600; cursor: pointer; color: var(--text-mid); text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all 0.14s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .fc-btn:hover { border-color: var(--border-md); color: var(--text); background: var(--rose-soft); }
        .fc-btn.primary { background: var(--rose); color: #fff; border-color: transparent; box-shadow: 0 1px 3px rgba(176,92,82,0.2); }
        .fc-btn.primary:hover { background: var(--rose-dark); border-color: transparent; color: #fff; }

        /* ── Banners ── */
        .limit-banner { background: #fff9f0; border: 1px solid #f0d8a0; border-left: 3px solid var(--terra); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .limit-banner-txt { font-size: 0.78rem; color: var(--text-mid); line-height: 1.5; flex: 1; min-width: 180px; }
        .limit-upgrade-btn { padding: 6px 14px; border-radius: 20px; border: none; background: var(--rose); color: #fff; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; text-decoration: none; }
        .limit-upgrade-btn:hover { background: var(--rose-dark); }

        .alert-box { background: #fff9f8; border: 1px solid var(--border); border-left: 3px solid var(--rose); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .alert-txt { font-size: 0.78rem; color: var(--text-mid); line-height: 1.5; flex: 1; min-width: 180px; }
        .alert-link { font-size: 0.76rem; font-weight: 700; color: var(--rose); text-decoration: none; white-space: nowrap; }
        .alert-link:hover { text-decoration: underline; }

        /* ── Empty state ── */
        .empty-box { text-align: center; padding: 56px 24px; background: var(--surface); border-radius: 10px; border: 1.5px dashed var(--border); }
        .empty-icon { font-size: 2.4rem; margin-bottom: 12px; opacity: 0.5; }
        .empty-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 7px; }
        .empty-sub { font-size: 0.8rem; color: var(--text-soft); line-height: 1.7; margin-bottom: 22px; }
        .empty-btn { padding: 10px 24px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; box-shadow: 0 2px 8px rgba(176,92,82,0.25); transition: all 0.2s; }
        .empty-btn:hover { background: var(--rose-dark); transform: translateY(-1px); }

        /* ── Modals ── */
        .modal-bg { position: fixed; inset: 0; background: rgba(42,31,29,0.4); z-index: 500; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 16px; }
        .modal { background: var(--surface); border-radius: 12px; padding: 28px 30px; width: 440px; max-width: 100%; box-shadow: 0 20px 60px rgba(42,31,29,0.15); border: 1px solid var(--border); }
        .modal-title { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); margin-bottom: 4px; }
        .modal-sub { font-size: 0.78rem; color: var(--text-soft); margin-bottom: 20px; }
        .m-label { display: block; font-size: 0.72rem; font-weight: 700; color: var(--text); margin-bottom: 5px; letter-spacing: 0.4px; text-transform: uppercase; }
        .m-input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 0.85rem; color: var(--text); font-family: 'DM Sans', sans-serif; margin-bottom: 14px; background: var(--bg); transition: all 0.2s; }
        .m-input:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.08); background: #fff; }
        .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; flex-wrap: wrap; }
        .m-btn { padding: 8px 18px; border-radius: 7px; border: 1px solid var(--border); font-size: 0.8rem; font-weight: 600; cursor: pointer; background: var(--surface); color: var(--text-mid); font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .m-btn:hover { background: var(--rose-soft); }
        .m-btn.confirm { background: var(--rose); color: #fff; border-color: transparent; box-shadow: 0 2px 8px rgba(176,92,82,0.2); }
        .m-btn.confirm:hover { background: var(--rose-dark); }
        .m-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .upgrade-modal-icon { font-size: 2.5rem; text-align: center; margin-bottom: 12px; }
        .upgrade-feature-list { display: flex; flex-direction: column; gap: 6px; margin: 16px 0; }
        .upgrade-feature { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--text-mid); }
        .upgrade-feature-check { color: var(--green); font-weight: 700; font-size: 0.8rem; }
        .upgrade-price { text-align: center; margin: 16px 0 4px; font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--text); }
        .upgrade-price-sub { text-align: center; font-size: 0.72rem; color: var(--text-soft); margin-bottom: 16px; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
          .stat-card { padding: 14px 14px 12px; }
          .stat-value { font-size: 1.6rem; }
          .stat-icon { width: 30px; height: 30px; font-size: 0.85rem; margin-bottom: 10px; }
          .stat-label { font-size: 0.6rem; }

          .forms-grid { grid-template-columns: 1fr; }
          .empty-box { padding: 36px 16px; }

          .section-hdr { gap: 6px; }
          .alert-box { padding: 10px 12px; }
          .limit-banner { padding: 10px 12px; }

          .modal { padding: 22px 18px; }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .forms-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {stats.negativeCount > 0 && (
        <div className="alert-box">
          <span style={{ fontSize: '1rem' }}>⚑</span>
          <div className="alert-txt">
            <strong style={{ color: '#2a1f1d' }}>{stats.negativeCount} negative {stats.negativeCount === 1 ? 'response requires' : 'responses require'} your attention</strong> — captured privately and awaiting review.
          </div>
          <Link href="/dashboard/responses" className="alert-link">Review now →</Link>
        </div>
      )}

      {atFormLimit && (
        <div className="limit-banner">
          <span style={{ fontSize: '1rem' }}>🔒</span>
          <div className="limit-banner-txt">
            <strong style={{ color: '#2a1f1d' }}>You've reached the 3 form limit</strong> on the Free plan. Upgrade to Pro for unlimited forms.
          </div>
          <a href="/dashboard/profile" className="limit-upgrade-btn">Upgrade →</a>
        </div>
      )}

      <div className="stat-grid">
        {statCards.map((s, i) => (
          <div key={s.label} className="stat-card" style={{ '--accent-color': s.accent } as React.CSSProperties}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {s.display !== null ? s.display : (
                <AnimatedStat value={s.value} decimals={s.decimals} suffix={(s as any).suffix || ''} />
              )}
            </div>
            <div className={`stat-sub ${s.cls}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-hdr">
        <div className="section-title">
          Active Forms
          {isFree && <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400, marginLeft: 8 }}>{forms.length} / {FREE_FORM_LIMIT} used</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/dashboard/forms" className="section-link">View all →</Link>
          <button onClick={handleNewForm} className="fc-btn primary" style={{ opacity: atFormLimit ? 0.7 : 1 }}>
            {atFormLimit ? '🔒 Limit Reached' : '+ New Form'}
          </button>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No forms yet</div>
          <div className="empty-sub">Create your first feedback form to begin collecting<br />intelligent reviews from your customers.</div>
          <button className="empty-btn" onClick={handleNewForm}>+ Create your first form</button>
        </div>
      ) : (
        <div className="forms-grid">
          {forms.map(form => (
            <div key={form.id} className="form-card">
              <div className="fc-top">
                <div className="fc-icon">📋</div>
                <div className="fc-badge"><div className="fc-badge-dot"></div>Active</div>
              </div>
              <div className="fc-name">{form.title}</div>
              {form.description && <div className="fc-desc">{form.description}</div>}
              <div className="fc-date">Created {new Date(form.created_at).toLocaleDateString()}</div>
              <div className="fc-actions">
                <Link href={`/dashboard/forms/${form.id}`} className="fc-btn primary">⚙ Manage</Link>
                <Link href={`/dashboard/responses?form=${form.id}`} className="fc-btn">Responses</Link>
                <Link href={`/dashboard/analytics?form=${form.id}`} className="fc-btn">Analytics</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <div className="modal-title">Create New Form</div>
            <div className="modal-sub">Set up a new feedback form for your business.</div>
            <label className="m-label">Form Name</label>
            <input className="m-input" placeholder="e.g. Dine-In Experience" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            <label className="m-label">Description (optional)</label>
            <input className="m-input" placeholder="What is this form for?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <div className="modal-actions">
              <button className="m-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="m-btn confirm" onClick={createForm} disabled={creating || !newTitle.trim()}>
                {creating ? 'Creating...' : 'Create Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowUpgradeModal(false) }}>
          <div className="modal">
            <div className="upgrade-modal-icon">🚀</div>
            <div className="modal-title" style={{ textAlign: 'center' }}>Upgrade to Pro</div>
            <div className="modal-sub" style={{ textAlign: 'center' }}>You've used all 3 forms on the Free plan. Upgrade to create unlimited forms.</div>
            <div className="upgrade-feature-list">
              <div className="upgrade-feature"><span className="upgrade-feature-check">✓</span> Unlimited forms & QR codes</div>
              <div className="upgrade-feature"><span className="upgrade-feature-check">✓</span> Unlimited responses</div>
              <div className="upgrade-feature"><span className="upgrade-feature-check">✓</span> AI complaint analysis</div>
              <div className="upgrade-feature"><span className="upgrade-feature-check">✓</span> Custom QR colors & styles</div>
              <div className="upgrade-feature"><span className="upgrade-feature-check">✓</span> Weekly AI digest email</div>
            </div>
            <div className="upgrade-price">$19<span style={{ fontSize: '1rem', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>/mo</span></div>
            <div className="upgrade-price-sub">Cancel anytime</div>
            <div className="modal-actions" style={{ justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <Link href="/dashboard/profile" className="m-btn confirm" style={{ textAlign: 'center', textDecoration: 'none' }}>Upgrade to Pro →</Link>
              <button className="m-btn" onClick={() => setShowUpgradeModal(false)}>Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}