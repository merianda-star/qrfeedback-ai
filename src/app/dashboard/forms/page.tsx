'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Form = {
  id: string; title: string; description: string | null
  created_at: string; review_mode: boolean; redirect_on_positive: boolean
  is_active: boolean
}
type FormStats = { [formId: string]: { total: number; positive: number; negative: number; avg: number } }

const FREE_FORM_LIMIT = 3

export default function FormsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [formStats, setFormStats] = useState<FormStats>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Form | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('free')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)

    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', user.id).single()
    setPlan(profile?.plan || 'free')

    const { data: formsData } = await supabase
      .from('forms').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (formsData) {
      setForms(formsData)
      const formIds = formsData.map((f: any) => f.id)
      const { data: responses } = formIds.length > 0
        ? await supabase.from('responses').select('form_id, rating').in('form_id', formIds)
        : { data: [] }
      if (responses) {
        const stats: FormStats = {}
        formsData.forEach((f: any) => {
          const fr = responses.filter((r: any) => r.form_id === f.id)
          const total = fr.length
          const positive = fr.filter((r: any) => r.rating >= 4).length
          const negative = fr.filter((r: any) => r.rating <= 3).length
          const avg = total > 0 ? fr.reduce((s: number, r: any) => s + (r.rating || 0), 0) / total : 0
          stats[f.id] = { total, positive, negative, avg: Math.round(avg * 10) / 10 }
        })
        setFormStats(stats)
      }
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
    if (!error && data) {
      setShowModal(false); setNewTitle(''); setNewDesc('')
      router.push(`/dashboard/forms/${data.id}`)
    }
    setCreating(false)
  }

  async function deleteForm(form: Form) {
    setDeletingId(form.id)
    await supabase.from('responses').delete().eq('form_id', form.id)
    await supabase.from('forms').delete().eq('id', form.id)
    setForms(prev => prev.filter(f => f.id !== form.id))
    setConfirmDelete(null); setDeletingId(null)
  }

  async function toggleFormActive(form: Form) {
    setTogglingId(form.id)
    const newValue = !form.is_active
    const { error } = await supabase
      .from('forms').update({ is_active: newValue }).eq('id', form.id)
    if (!error) {
      setForms(prev => prev.map(f => f.id === form.id ? { ...f, is_active: newValue } : f))
    }
    setTogglingId(null)
  }

  const filtered = forms.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const isFree = !plan || plan === 'free'
  const atFormLimit = isFree && forms.length >= FREE_FORM_LIMIT

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading forms...</div>
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

        /* ── Header ── */
        .forms-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
        .forms-header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 140px; max-width: 280px; }
        .search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.83rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--surface); transition: all 0.2s; }
        .search-input:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); }
        .search-input::placeholder { color: #c9aba6; }
        .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: var(--text-soft); pointer-events: none; }
        .count-badge { font-size: 0.75rem; color: var(--text-soft); background: var(--rose-soft); border: 1px solid var(--border); padding: 4px 10px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
        .new-btn { padding: 8px 18px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; box-shadow: 0 2px 8px rgba(176,92,82,0.2); transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .new-btn:hover { background: var(--rose-dark); transform: translateY(-1px); }
        .new-btn.locked { background: var(--text-soft); box-shadow: none; }

        /* ── Banners ── */
        .limit-banner { background: #fff9f0; border: 1px solid #f0d8a0; border-left: 3px solid var(--terra); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .limit-banner-txt { font-size: 0.78rem; color: var(--text-mid); line-height: 1.5; flex: 1; min-width: 160px; }
        .limit-upgrade-btn { padding: 6px 14px; border-radius: 20px; border: none; background: var(--rose); color: #fff; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; text-decoration: none; }

        /* ── Grid ── */
        .forms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }

        /* ── Form card ── */
        .form-card { background: var(--surface); border-radius: 10px; border: 1px solid var(--border); padding: 18px; transition: all 0.2s; display: flex; flex-direction: column; }
        .form-card:hover { box-shadow: 0 4px 20px rgba(176,92,82,0.08); border-color: var(--border-md); }
        .form-card.closed { opacity: 0.75; }
        .fc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
        .fc-icon { width: 40px; height: 40px; border-radius: 9px; background: var(--rose-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
        .fc-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
        .fc-badge { display: flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }
        .fc-badge.active { background: var(--green-soft); border: 1px solid rgba(74,122,90,0.2); color: var(--green); }
        .fc-badge.closed { background: #f5f0ee; border: 1px solid var(--border); color: var(--text-soft); }
        .fc-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
        .fc-badge.active .fc-badge-dot { background: var(--green); }
        .fc-badge.closed .fc-badge-dot { background: var(--text-soft); }

        .toggle-wrap { display: flex; align-items: center; gap: 5px; cursor: pointer; }
        .toggle-track { width: 32px; height: 18px; border-radius: 9px; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .toggle-track.on { background: var(--green); }
        .toggle-track.off { background: #d9c2bb; }
        .toggle-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; position: absolute; top: 2px; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .toggle-track.on .toggle-thumb { left: 16px; }
        .toggle-track.off .toggle-thumb { left: 2px; }

        .fc-name { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); margin-bottom: 4px; }
        .fc-desc { font-size: 0.74rem; color: var(--text-soft); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fc-date { font-size: 0.64rem; color: var(--text-soft); margin-bottom: 12px; }

        .fc-stats { display: flex; gap: 6px; margin-bottom: 12px; }
        .fc-stat { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 7px 6px; text-align: center; min-width: 0; }
        .fc-stat-val { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); line-height: 1; }
        .fc-stat-val.pos { color: var(--green); }
        .fc-stat-val.neg { color: var(--rose); }
        .fc-stat-label { font-size: 0.55rem; color: var(--text-soft); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px; }

        .fc-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; }
        .fc-btn { padding: 6px 10px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); font-size: 0.72rem; font-weight: 600; cursor: pointer; color: var(--text-mid); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all 0.14s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .fc-btn:hover { border-color: var(--border-md); color: var(--text); background: var(--rose-soft); }
        .fc-btn.primary { background: var(--rose); color: #fff; border-color: transparent; box-shadow: 0 1px 4px rgba(176,92,82,0.2); }
        .fc-btn.primary:hover { background: var(--rose-dark); border-color: transparent; color: #fff; }
        .fc-btn.danger { color: #c0504a; }
        .fc-btn.danger:hover { background: #fef5f4; border-color: #f0c4be; color: var(--rose-dark); }

        /* ── Empty ── */
        .empty-box { text-align: center; padding: 56px 24px; background: var(--surface); border-radius: 10px; border: 1.5px dashed var(--border); grid-column: 1 / -1; }
        .empty-icon { font-size: 2.6rem; margin-bottom: 14px; opacity: 0.45; }
        .empty-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 7px; }
        .empty-sub { font-size: 0.8rem; color: var(--text-soft); line-height: 1.7; margin-bottom: 22px; }
        .empty-btn { padding: 10px 24px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; box-shadow: 0 2px 8px rgba(176,92,82,0.25); transition: all 0.2s; }
        .empty-btn:hover { background: var(--rose-dark); transform: translateY(-1px); }

        /* ── Modals ── */
        .modal-bg { position: fixed; inset: 0; background: rgba(42,31,29,0.4); z-index: 500; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 16px; }
        .modal { background: var(--surface); border-radius: 12px; padding: 24px 22px; width: 440px; max-width: 100%; box-shadow: 0 20px 60px rgba(42,31,29,0.15); border: 1px solid var(--border); }
        .modal-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 4px; }
        .modal-sub { font-size: 0.78rem; color: var(--text-soft); margin-bottom: 18px; }
        .m-label { display: block; font-size: 0.72rem; font-weight: 700; color: var(--text); margin-bottom: 5px; letter-spacing: 0.4px; text-transform: uppercase; }
        .m-input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.85rem; color: var(--text); font-family: 'DM Sans', sans-serif; margin-bottom: 14px; background: var(--bg); transition: all 0.2s; }
        .m-input:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.08); background: #fff; }
        .m-input::placeholder { color: #c9aba6; }
        .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; flex-wrap: wrap; }
        .m-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.8rem; font-weight: 600; cursor: pointer; background: var(--surface); color: var(--text-mid); font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .m-btn:hover { background: var(--rose-soft); }
        .m-btn.confirm { background: var(--rose); color: #fff; border-color: transparent; box-shadow: 0 2px 8px rgba(176,92,82,0.2); }
        .m-btn.confirm:hover { background: var(--rose-dark); }
        .m-btn.danger-confirm { background: #c0504a; color: #fff; border-color: transparent; }
        .m-btn.danger-confirm:hover { background: #a03a35; }
        .m-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .delete-warning { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 10px 13px; margin-bottom: 16px; font-size: 0.78rem; color: #8c3d34; line-height: 1.5; }
        .upgrade-modal-icon { font-size: 2.5rem; text-align: center; margin-bottom: 12px; }
        .upgrade-feature-list { display: flex; flex-direction: column; gap: 6px; margin: 14px 0; }
        .upgrade-feature { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--text-mid); }
        .upgrade-feature-check { color: var(--green); font-weight: 700; }
        .upgrade-price { text-align: center; margin: 14px 0 4px; font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--text); }
        .upgrade-price-sub { text-align: center; font-size: 0.72rem; color: var(--text-soft); margin-bottom: 14px; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .forms-grid { grid-template-columns: 1fr; }
          .forms-header { gap: 8px; }
          .forms-header-left { flex-wrap: nowrap; }
          .search-wrap { max-width: none; min-width: 0; }
          .empty-box { padding: 40px 16px; }
          .fc-actions { gap: 5px; }
          .fc-btn { padding: 6px 8px; font-size: 0.7rem; }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .forms-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {atFormLimit && (
        <div className="limit-banner">
          <span style={{ fontSize: '1rem' }}>🔒</span>
          <div className="limit-banner-txt">
            <strong style={{ color: '#2a1f1d' }}>You've reached the 3 form limit</strong> on the Free plan. Upgrade to Pro for unlimited forms.
          </div>
          <a href="/dashboard/profile" className="limit-upgrade-btn">Upgrade →</a>
        </div>
      )}

      <div className="forms-header">
        <div className="forms-header-left">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search forms..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="count-badge">
            {isFree ? `${forms.length} / ${FREE_FORM_LIMIT}` : `${filtered.length} form${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <button className={`new-btn ${atFormLimit ? 'locked' : ''}`} onClick={handleNewForm}>
          {atFormLimit ? '🔒 Upgrade' : '+ New Form'}
        </button>
      </div>

      <div className="forms-grid">
        {filtered.length === 0 && forms.length > 0 ? (
          <div className="empty-box">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No forms match your search</div>
            <div className="empty-sub">Try a different keyword.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No forms yet</div>
            <div className="empty-sub">Create your first feedback form to start collecting reviews.</div>
            <button className="empty-btn" onClick={handleNewForm}>+ Create your first form</button>
          </div>
        ) : (
          filtered.map(form => {
            const stats = formStats[form.id] || { total: 0, positive: 0, negative: 0, avg: 0 }
            const isActive = form.is_active !== false
            return (
              <div key={form.id} className={`form-card ${!isActive ? 'closed' : ''}`}>
                <div className="fc-top">
                  <div className="fc-icon">📋</div>
                  <div className="fc-badges">
                    <div className={`fc-badge ${isActive ? 'active' : 'closed'}`}>
                      <div className="fc-badge-dot"></div>
                      {isActive ? 'Active' : 'Closed'}
                    </div>
                    <div
                      className="toggle-wrap"
                      onClick={() => !togglingId && toggleFormActive(form)}
                      title={isActive ? 'Click to close form' : 'Click to open form'}
                      style={{ opacity: togglingId === form.id ? 0.5 : 1, cursor: togglingId ? 'not-allowed' : 'pointer' }}
                    >
                      <div className={`toggle-track ${isActive ? 'on' : 'off'}`}>
                        <div className="toggle-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fc-name">{form.title}</div>
                {form.description && <div className="fc-desc">{form.description}</div>}
                <div className="fc-date">Created {new Date(form.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div className="fc-stats">
                  <div className="fc-stat"><div className="fc-stat-val">{stats.total}</div><div className="fc-stat-label">Responses</div></div>
                  <div className="fc-stat"><div className="fc-stat-val pos">{stats.positive}</div><div className="fc-stat-label">Positive</div></div>
                  <div className="fc-stat"><div className="fc-stat-val neg">{stats.negative}</div><div className="fc-stat-label">Negative</div></div>
                  <div className="fc-stat"><div className="fc-stat-val">{stats.avg > 0 ? stats.avg : '—'}</div><div className="fc-stat-label">Avg</div></div>
                </div>
                <div className="fc-actions">
                  <Link href={`/dashboard/forms/${form.id}`} className="fc-btn primary">⚙ Manage</Link>
                  <Link href={`/dashboard/responses?form=${form.id}`} className="fc-btn">Responses</Link>
                  <Link href={`/dashboard/analytics?form=${form.id}`} className="fc-btn">Analytics</Link>
                  <button className="fc-btn danger" onClick={() => setConfirmDelete(form)}>🗑</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <div className="modal-title">Create New Form</div>
            <div className="modal-sub">Set up a new feedback form for your business.</div>
            <label className="m-label">Form Name</label>
            <input className="m-input" placeholder="e.g. Dine-In Experience" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && createForm()} />
            <label className="m-label">Description (optional)</label>
            <input className="m-input" placeholder="What is this form for?" value={newDesc} onChange={e => setNewDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && createForm()} />
            <div className="modal-actions">
              <button className="m-btn" onClick={() => { setShowModal(false); setNewTitle(''); setNewDesc('') }}>Cancel</button>
              <button className="m-btn confirm" onClick={createForm} disabled={creating || !newTitle.trim()}>{creating ? 'Creating...' : 'Create Form'}</button>
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

      {confirmDelete && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null) }}>
          <div className="modal">
            <div className="modal-title">Delete Form</div>
            <div className="delete-warning">⚠ This will permanently delete <strong>"{confirmDelete.title}"</strong> and all its responses. This cannot be undone.</div>
            <div className="modal-actions">
              <button className="m-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="m-btn danger-confirm" onClick={() => deleteForm(confirmDelete)} disabled={deletingId === confirmDelete.id}>
                {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}