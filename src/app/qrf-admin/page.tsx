'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  full_name: string | null
  plan: string
  business_name: string | null
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  form_count: number
  response_count: number
  failed_ai_count: number
  trial_ends_at: string | null
}

type Stats = {
  total_users: number
  free_users: number
  pro_users: number
  business_users: number
  total_responses: number
  total_forms: number
  failed_ai: number
  new_this_week: number
}

type ContactRequest = {
  id: string
  name: string
  business_name: string
  email: string
  business_type: string
  message: string | null
  status: 'new' | 'replied'
  created_at: string
  replied_at: string | null
}

const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  free:     { bg: '#f7ece9', color: '#b05c52' },
  pro:      { bg: '#fef3e8', color: '#c4896a' },
  business: { bg: '#edf4ef', color: '#4a7a5a' },
}

const BIZ_TYPE_LABELS: Record<string, string> = {
  restaurant: '🍽 Restaurant / Café',
  retail: '🛍 Retail',
  healthcare: '🏥 Healthcare',
  services: '💼 Services',
  hospitality: '🏨 Hotel / Hospitality',
  other: '⬡ Other',
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDaysLeft(trialEndsAt: string): number {
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

function getSignupChartData(users: User[]) {
  const last14: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]; last14[key] = 0
  }
  users.forEach(u => { const key = u.created_at.split('T')[0]; if (key in last14) last14[key]++ })
  return Object.entries(last14).map(([date, count]) => ({ date, count }))
}

export default function AdminPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [actionError, setActionError] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'failed-ai' | 'signup-activity' | 'trial-expiry' | 'inactive' | 'contact-requests'>('users')
  const [failedAI, setFailedAI] = useState<any[]>([])

  // Contact requests
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [contactLoading, setContactLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyMsg, setReplyMsg] = useState('')
  const [replyError, setReplyError] = useState('')
  const [contactFilter, setContactFilter] = useState<'all' | 'new' | 'replied'>('all')

  const [showEmailChange, setShowEmailChange] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [trialDays, setTrialDays] = useState('7')
  const [trialPlan, setTrialPlan] = useState<'pro' | 'business'>('pro')
  const [showTrialEdit, setShowTrialEdit] = useState(false)
  const [inactiveEmailLoading, setInactiveEmailLoading] = useState<string | null>(null)
  const [inactiveEmailMsg, setInactiveEmailMsg] = useState<Record<string, string>>({})

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (activeTab === 'contact-requests' && contactRequests.length === 0) loadContactRequests()
  }, [activeTab])

  useEffect(() => {
    setShowEmailChange(false); setNewEmail('')
    setShowDelete(false); setDeleteConfirm('')
    setActionMsg(''); setActionError('')
    setShowTrialEdit(false); setTrialDays('7'); setTrialPlan('pro')
  }, [selectedUser?.id])

  useEffect(() => {
    if (selectedContact) {
      setReplySubject(`Re: Your QRFeedback.ai Business Enquiry`)
      setReplyBody(`Hi ${selectedContact.name},\n\nThank you for your interest in QRFeedback.ai Business plan.\n\n`)
      setReplyMsg(''); setReplyError('')
    }
  }, [selectedContact?.id])

  async function loadData() {
    setLoading(true)
    const res = await fetch('/api/admin/data')
    if (!res.ok) { router.push('/dashboard'); return }
    const json = await res.json()
    setUsers(json.users || [])
    setStats(json.stats || null)
    setFailedAI(json.failedAI || [])
    setLoading(false)
  }

  async function loadContactRequests() {
    setContactLoading(true)
    const res = await fetch('/api/admin/contact-requests')
    if (res.ok) {
      const json = await res.json()
      setContactRequests(json.requests || [])
    }
    setContactLoading(false)
  }

  async function handleSendReply() {
    if (!selectedContact || !replyBody.trim()) return
    setReplyLoading(true); setReplyMsg(''); setReplyError('')
    const res = await fetch('/api/admin/reply-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: selectedContact.id,
        to: selectedContact.email,
        toName: selectedContact.name,
        subject: replySubject,
        body: replyBody,
      }),
    })
    const json = await res.json()
    setReplyLoading(false)
    if (json.success) {
      setReplyMsg('Reply sent successfully!')
      setContactRequests(prev => prev.map(r => r.id === selectedContact.id
        ? { ...r, status: 'replied', replied_at: new Date().toISOString() } : r))
      setSelectedContact(prev => prev ? { ...prev, status: 'replied', replied_at: new Date().toISOString() } : null)
      setTimeout(() => setReplyMsg(''), 4000)
    } else {
      setReplyError(json.error || 'Failed to send reply')
    }
  }

  async function handlePlanChange(userId: string, newPlan: string) {
    setActionLoading(true); setActionError('')
    const res = await fetch('/api/admin/update-plan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: newPlan }),
    })
    const json = await res.json()
    setActionLoading(false)
    if (json.success) {
      setActionMsg(`Plan updated to ${newPlan}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, plan: newPlan } : null)
      setTimeout(() => setActionMsg(''), 3000)
    } else { setActionError(json.error || 'Failed to update plan') }
  }

  async function handleSetTrial(userId: string, days: number, plan: 'pro' | 'business' = 'pro') {
    setActionLoading(true); setActionError('')
    const trialEndsAt = new Date(); trialEndsAt.setDate(trialEndsAt.getDate() + days)
    const res = await fetch('/api/admin/set-trial', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, trial_ends_at: trialEndsAt.toISOString(), plan }),
    })
    const json = await res.json()
    setActionLoading(false)
    if (json.success) {
      setActionMsg(`${plan.charAt(0).toUpperCase() + plan.slice(1)} trial set to ${days} days from now`)
      const newTrialEnd = trialEndsAt.toISOString()
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan, trial_ends_at: newTrialEnd } : u))
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, plan, trial_ends_at: newTrialEnd } : null)
      setShowTrialEdit(false)
      setTimeout(() => setActionMsg(''), 3000)
    } else { setActionError(json.error || 'Failed to set trial') }
  }

  async function handleConfirmEmail(userId: string) {
    setActionLoading(true); setActionError('')
    const res = await fetch('/api/admin/confirm-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const json = await res.json()
    setActionLoading(false)
    if (json.success) {
      setActionMsg('Email confirmed successfully')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, email_confirmed_at: new Date().toISOString() } : u))
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, email_confirmed_at: new Date().toISOString() } : null)
      setTimeout(() => setActionMsg(''), 3000)
    } else { setActionError(json.error || 'Failed to confirm email') }
  }

  async function handleChangeEmail() {
    if (!selectedUser || !newEmail.trim()) return
    setActionLoading(true); setActionError('')
    const res = await fetch('/api/admin/change-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser.id, newEmail: newEmail.trim() }),
    })
    const json = await res.json()
    setActionLoading(false)
    if (json.success) {
      setActionMsg(`Email updated to ${newEmail.trim()}`)
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, email: newEmail.trim(), email_confirmed_at: null } : u))
      setSelectedUser(prev => prev ? { ...prev, email: newEmail.trim(), email_confirmed_at: null } : null)
      setShowEmailChange(false); setNewEmail('')
      setTimeout(() => setActionMsg(''), 5000)
    } else { setActionError(json.error || 'Failed to update email') }
  }

  async function handleDeleteUser() {
    if (!selectedUser || deleteConfirm !== 'DELETE') return
    setActionLoading(true); setActionError('')
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser.id }),
    })
    const json = await res.json()
    setActionLoading(false)
    if (json.success) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setSelectedUser(null); setShowDelete(false); setDeleteConfirm('')
      if (stats) setStats(prev => prev ? { ...prev, total_users: prev.total_users - 1 } : null)
    } else { setActionError(json.error || 'Failed to delete account') }
  }

  async function handleReprocessAI(responseId: string, rating: number, answers: any) {
    setActionLoading(true)
    await fetch('/api/process-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response_id: responseId, rating, answers }),
    })
    setActionLoading(false)
    setActionMsg('AI reprocessing triggered')
    setFailedAI(prev => prev.filter(r => r.id !== responseId))
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function handleSendInactiveEmail(user: User) {
    setInactiveEmailLoading(user.id)
    const res = await fetch('/api/admin/send-inactive-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email, name: user.full_name }),
    })
    const json = await res.json()
    setInactiveEmailLoading(null)
    setInactiveEmailMsg(prev => ({ ...prev, [user.id]: json.success ? '✓ Email sent' : `✗ ${json.error}` }))
    setTimeout(() => setInactiveEmailMsg(prev => { const n = { ...prev }; delete n[user.id]; return n }), 4000)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.business_name || '').toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const inactiveUsers = users.filter(u => new Date(u.last_sign_in_at || u.created_at) < sixMonthsAgo)
  const trialExpiryUsers = users.filter(u => u.plan === 'pro' && u.trial_ends_at && new Date(u.trial_ends_at) > new Date())
    .sort((a, b) => new Date(a.trial_ends_at!).getTime() - new Date(b.trial_ends_at!).getTime())
  const signupData = getSignupChartData(users)
  const maxSignups = Math.max(...signupData.map(d => d.count), 1)
  const newContactCount = contactRequests.filter(r => r.status === 'new').length
  const filteredContacts = contactRequests.filter(r => contactFilter === 'all' || r.status === contactFilter)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f4', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading admin panel...</div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fdf6f4; }
        :root {
          --bg: #fdf6f4; --surface: #ffffff; --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --green: #4a7a5a; --green-soft: #edf4ef;
          --ink: #1a1210; --red: #c0392b; --red-soft: #fdecea;
          --amber: #fef9ec; --amber-border: #f0d98a; --amber-text: #7a6020;
        }
        .admin-wrap { display: flex; min-height: 100vh; }
        .admin-sidebar { width: 220px; background: var(--ink); position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.06); overflow-y: auto; }
        .sb-logo { padding: 22px 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sb-logo-text { font-family: 'DM Serif Display', serif; font-size: 1rem; color: #f5ede8; }
        .sb-logo-dot { color: var(--rose); }
        .sb-badge { font-size: 0.55rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 2px 7px; border-radius: 10px; background: rgba(176,92,82,0.3); color: #f0c4b8; margin-top: 4px; display: inline-block; }
        .sb-section { font-size: 0.55rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(245,237,232,0.3); padding: 12px 18px 5px; }
        .sb-nav { padding: 10px 10px; flex: 1; }
        .sb-link { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 7px; margin-bottom: 2px; font-size: 0.8rem; font-weight: 500; color: rgba(245,237,232,0.55); cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
        .sb-link:hover { background: rgba(255,255,255,0.06); color: #f5ede8; }
        .sb-link.active { background: rgba(176,92,82,0.2); color: #f0c4b8; }
        .sb-link-badge { margin-left: auto; background: rgba(176,92,82,0.4); color: #f0c4b8; font-size: 0.6rem; font-weight: 800; padding: 1px 6px; border-radius: 10px; }
        .sb-footer { padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.06); }
        .admin-main { margin-left: 220px; flex: 1; }
        .admin-topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .topbar-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); }
        .admin-content { padding: 24px 28px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .stat-val { font-family: 'DM Serif Display', serif; font-size: 2rem; color: var(--text); line-height: 1; margin-bottom: 4px; }
        .stat-val.rose { color: var(--rose); }
        .stat-val.green { color: var(--green); }
        .stat-val.terra { color: var(--terra); }
        .stat-label { font-size: 0.68rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .stat-sub { font-size: 0.7rem; color: var(--text-soft); margin-top: 3px; }
        .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .search-input { flex: 1; min-width: 200px; padding: 8px 14px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 0.82rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--surface); outline: none; transition: all 0.2s; }
        .search-input:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); }
        .search-input::placeholder { color: var(--text-soft); }
        .filter-pill { padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border); font-size: 0.74rem; font-weight: 600; cursor: pointer; background: var(--bg); color: var(--text-mid); transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .filter-pill:hover { border-color: var(--rose); color: var(--rose); }
        .filter-pill.active { background: var(--rose-soft); border-color: var(--rose); color: var(--rose); }
        .users-table { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px; padding: 10px 16px; background: var(--bg); border-bottom: 1px solid var(--border); }
        .th { font-size: 0.65rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; }
        .user-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px; padding: 13px 16px; border-bottom: 1px solid var(--border); align-items: center; cursor: pointer; transition: background 0.15s; }
        .user-row:last-child { border-bottom: none; }
        .user-row:hover { background: var(--bg); }
        .user-row.selected { background: var(--rose-soft); }
        .user-name { font-size: 0.82rem; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .user-email { font-size: 0.72rem; color: var(--text-soft); }
        .plan-badge { display: inline-flex; padding: 2px 9px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; }
        .td { font-size: 0.78rem; color: var(--text-mid); }
        .confirmed-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }
        .view-btn { padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); font-size: 0.72rem; font-weight: 600; color: var(--text-mid); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .view-btn:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .detail-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 390px; background: var(--surface); border-left: 1px solid var(--border); z-index: 200; overflow-y: auto; box-shadow: -8px 0 32px rgba(42,31,29,0.1); padding: 24px; }
        .detail-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-soft); padding: 4px; }
        .detail-close:hover { color: var(--text); }
        .detail-name { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: var(--text); margin-bottom: 3px; }
        .detail-email { font-size: 0.78rem; color: var(--text-soft); margin-bottom: 16px; word-break: break-all; }
        .detail-section { margin-bottom: 20px; }
        .detail-section-title { font-size: 0.65rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.78rem; }
        .detail-row-label { color: var(--text-soft); }
        .detail-row-val { font-weight: 600; color: var(--text); }
        .action-btn { width: 100%; padding: 9px; border-radius: 8px; border: none; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 8px; transition: all 0.15s; }
        .action-btn.rose { background: var(--rose); color: #fff; }
        .action-btn.rose:hover { background: var(--rose-dark); }
        .action-btn.outline { background: var(--surface); color: var(--text-mid); border: 1.5px solid var(--border); }
        .action-btn.outline:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .action-btn.green { background: var(--green); color: #fff; }
        .action-btn.green:hover { background: #3a6a4a; }
        .action-btn.amber { background: #c4896a; color: #fff; }
        .action-btn.amber:hover { background: #a06848; }
        .action-btn.red { background: var(--red); color: #fff; }
        .action-btn.red:hover { background: #a93226; }
        .action-btn.red-outline { background: var(--surface); color: var(--red); border: 1.5px solid #e8b4b0; }
        .action-btn.red-outline:hover { background: var(--red-soft); border-color: var(--red); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .plan-select { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 0.78rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--bg); outline: none; cursor: pointer; margin-bottom: 8px; }
        .plan-select:focus { border-color: var(--rose); }
        .inline-input { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 0.78rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--bg); outline: none; margin-bottom: 8px; }
        .inline-input:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); }
        .inline-input::placeholder { color: var(--text-soft); }
        .inline-textarea { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 0.78rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--bg); outline: none; margin-bottom: 8px; resize: vertical; min-height: 100px; line-height: 1.5; }
        .inline-textarea:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); }
        .info-box { background: var(--amber); border: 1px solid var(--amber-border); border-radius: 8px; padding: 10px 12px; font-size: 0.73rem; color: var(--amber-text); margin-bottom: 10px; line-height: 1.5; }
        .danger-box { background: var(--red-soft); border: 1px solid #e8b4b0; border-radius: 8px; padding: 10px 12px; font-size: 0.73rem; color: var(--red); margin-bottom: 10px; line-height: 1.5; }
        .danger-zone { border: 1.5px solid #e8b4b0; border-radius: 10px; padding: 14px; margin-bottom: 20px; }
        .danger-zone-title { font-size: 0.65rem; font-weight: 700; color: var(--red); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .action-msg { font-size: 0.74rem; color: var(--green); font-weight: 600; margin-bottom: 8px; background: var(--green-soft); padding: 8px 12px; border-radius: 7px; }
        .action-err { font-size: 0.74rem; color: var(--red); font-weight: 600; margin-bottom: 8px; background: var(--red-soft); padding: 8px 12px; border-radius: 7px; }
        .failed-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 10px; }
        .reprocess-btn { padding: 5px 14px; border-radius: 6px; border: none; background: var(--rose); color: #fff; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .reprocess-btn:hover { background: var(--rose-dark); }
        .reprocess-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 40px 24px; color: var(--text-soft); font-size: 0.82rem; }
        .section-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
        .section-card-header { padding: 14px 18px; border-bottom: 1px solid var(--border); background: var(--bg); font-family: 'DM Serif Display', serif; font-size: 0.9rem; color: var(--text); display: flex; align-items: center; justify-content: space-between; }
        .trial-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px 16px; border-bottom: 1px solid var(--border); align-items: center; font-size: 0.78rem; }
        .trial-row:last-child { border-bottom: none; }
        .inactive-row { display: grid; grid-template-columns: 2fr 1fr 1fr 120px; padding: 12px 16px; border-bottom: 1px solid var(--border); align-items: center; font-size: 0.78rem; }
        .inactive-row:last-child { border-bottom: none; }
        .send-btn { padding: 5px 12px; border-radius: 6px; border: none; background: var(--rose); color: #fff; font-size: 0.7rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
        .send-btn:hover { background: var(--rose-dark); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Contact requests */
        .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 10px; cursor: pointer; transition: all 0.15s; }
        .contact-card:hover { box-shadow: 0 4px 16px rgba(42,31,29,0.07); border-color: var(--border-md); }
        .contact-card.selected { border-color: var(--rose); background: var(--rose-soft); }
        .contact-card.replied { opacity: 0.7; }
        .contact-status { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: 20px; font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .contact-status.new { background: #fff3e8; color: #c4896a; border: 1px solid #f0d0b0; }
        .contact-status.replied { background: var(--green-soft); color: var(--green); border: 1px solid rgba(74,122,90,0.2); }

        /* Signup chart */
        .chart-wrap { padding: 20px; }
        .chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 120px; }
        .chart-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .chart-bar { width: 100%; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--rose), var(--terra)); min-height: 2px; transition: height 0.4s; }
        .chart-bar-label { font-size: 0.55rem; color: var(--text-soft); text-align: center; }
        .chart-bar-count { font-size: 0.6rem; font-weight: 700; color: var(--text); }

        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .table-header, .user-row { grid-template-columns: 2fr 1fr 1fr 80px; }
          .trial-row, .inactive-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="admin-wrap">
        <div className="admin-sidebar">
          <div className="sb-logo">
            <div className="sb-logo-text">QRFeedback<span className="sb-logo-dot">.ai</span></div>
            <div className="sb-badge">Admin Panel</div>
          </div>
          <nav className="sb-nav">
            <div className="sb-section">Management</div>
            <button className={`sb-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</button>
            <button className={`sb-link ${activeTab === 'failed-ai' ? 'active' : ''}`} onClick={() => setActiveTab('failed-ai')}>
              ⚠ Failed AI {failedAI.length > 0 && <span className="sb-link-badge">{failedAI.length}</span>}
            </button>
            <button className={`sb-link ${activeTab === 'contact-requests' ? 'active' : ''}`} onClick={() => { setActiveTab('contact-requests'); setSelectedUser(null) }}>
              ✉ Contact Requests {newContactCount > 0 && <span className="sb-link-badge">{newContactCount}</span>}
            </button>
            <div className="sb-section">Insights</div>
            <button className={`sb-link ${activeTab === 'signup-activity' ? 'active' : ''}`} onClick={() => setActiveTab('signup-activity')}>📈 Signup Activity</button>
            <button className={`sb-link ${activeTab === 'trial-expiry' ? 'active' : ''}`} onClick={() => setActiveTab('trial-expiry')}>
              ⏳ Trial Expiry {trialExpiryUsers.length > 0 && <span className="sb-link-badge">{trialExpiryUsers.length}</span>}
            </button>
            <button className={`sb-link ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
              💤 Inactive Users {inactiveUsers.length > 0 && <span className="sb-link-badge">{inactiveUsers.length}</span>}
            </button>
          </nav>
          <div className="sb-footer">
            <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/auth/admin-login' }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: 'rgba(245,237,232,0.35)', fontSize: '0.75rem' }}>
              ← Logout
            </button>
          </div>
        </div>

        <div className="admin-main">
          <div className="admin-topbar">
            <div className="topbar-title">
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'failed-ai' && 'Failed AI Responses'}
              {activeTab === 'signup-activity' && 'Signup Activity'}
              {activeTab === 'trial-expiry' && 'Trial Expiry'}
              {activeTab === 'inactive' && 'Inactive Users'}
              {activeTab === 'contact-requests' && 'Contact Requests'}
            </div>
            <button onClick={loadData} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif' }}>
              ↺ Refresh
            </button>
          </div>

          <div className="admin-content">
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-val">{stats.total_users}</div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-sub">+{stats.new_this_week} this week</div>
                </div>
                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 6 }}>
                    {[{ val: stats.free_users, label: 'Free', color: '#b05c52' }, { val: stats.pro_users, label: 'Pro', color: '#c4896a' }, { val: stats.business_users, label: 'Biz', color: '#4a7a5a' }].map((p, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.8rem', color: p.color, lineHeight: 1 }}>{p.val}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: p.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 3, opacity: 0.7 }}>{p.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="stat-label">Plan Breakdown</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val terra">{stats.total_responses.toLocaleString()}</div>
                  <div className="stat-label">Total Responses</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val rose">{stats.failed_ai}</div>
                  <div className="stat-label">Failed AI</div>
                  <div className="stat-sub">Unprocessed negatives</div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {activeTab === 'users' && (
              <>
                <div className="toolbar">
                  <input className="search-input" placeholder="Search by name, email or business..." value={search} onChange={e => setSearch(e.target.value)} />
                  {['all', 'free', 'pro', 'business'].map(p => (
                    <button key={p} className={`filter-pill ${planFilter === p ? 'active' : ''}`} onClick={() => setPlanFilter(p)}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{filtered.length} users</span>
                </div>
                <div className="users-table">
                  <div className="table-header">
                    <div className="th">User</div><div className="th">Plan</div>
                    <div className="th">Forms / Responses</div><div className="th">Confirmed</div>
                    <div className="th">Last Login</div><div className="th"></div>
                  </div>
                  {filtered.length === 0 ? <div className="empty-state">No users found</div> : filtered.map(u => {
                    const planStyle = PLAN_COLORS[u.plan] || PLAN_COLORS.free
                    const isTrialUser = u.plan === 'pro' && u.trial_ends_at && new Date(u.trial_ends_at) > new Date()
                    return (
                      <div key={u.id} className={`user-row ${selectedUser?.id === u.id ? 'selected' : ''}`} onClick={() => setSelectedUser(u)}>
                        <div>
                          <div className="user-name">{u.full_name || '—'}</div>
                          <div className="user-email">{u.email}</div>
                          {u.business_name && <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: 1 }}>🏢 {u.business_name}</div>}
                        </div>
                        <div>
                          <span className="plan-badge" style={{ background: planStyle.bg, color: planStyle.color }}>{u.plan}</span>
                          {isTrialUser && <div style={{ fontSize: '0.6rem', color: '#c4896a', marginTop: 3 }}>Trial · {getDaysLeft(u.trial_ends_at!)}d left</div>}
                        </div>
                        <div className="td">{u.form_count} / {u.response_count}</div>
                        <div className="td"><span className="confirmed-dot" style={{ background: u.email_confirmed_at ? '#4a7a5a' : '#b05c52' }}></span>{u.email_confirmed_at ? 'Yes' : 'No'}</div>
                        <div className="td">{timeAgo(u.last_sign_in_at)}</div>
                        <div><button className="view-btn" onClick={e => { e.stopPropagation(); setSelectedUser(u) }}>View</button></div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── FAILED AI ── */}
            {activeTab === 'failed-ai' && (
              failedAI.length === 0 ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>✦</div>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: 'var(--text)', marginBottom: 6 }}>No failed AI responses</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>All negative responses have been processed successfully</div>
                </div>
              ) : failedAI.map((r, i) => (
                <div key={r.id || i} className="failed-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} — {r.form_title || 'Unknown Form'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{r.id}</div>
                    </div>
                    <button className="reprocess-btn" disabled={actionLoading} onClick={() => handleReprocessAI(r.id, r.rating, r.answers)}>↺ Reprocess</button>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>Submitted: {timeAgo(r.submitted_at)} · {r.email}</div>
                </div>
              ))
            )}

            {/* ── CONTACT REQUESTS ── */}
            {activeTab === 'contact-requests' && (
              <div style={{ display: 'grid', gridTemplateColumns: selectedContact ? '1fr 380px' : '1fr', gap: 16 }}>
                <div>
                  <div className="toolbar">
                    {(['all', 'new', 'replied'] as const).map(f => (
                      <button key={f} className={`filter-pill ${contactFilter === f ? 'active' : ''}`} onClick={() => setContactFilter(f)}>
                        {f === 'all' ? 'All' : f === 'new' ? '● New' : '✓ Replied'}
                      </button>
                    ))}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginLeft: 'auto' }}>{filteredContacts.length} requests</span>
                    <button onClick={loadContactRequests} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif' }}>↺</button>
                  </div>

                  {contactLoading ? (
                    <div className="empty-state">Loading...</div>
                  ) : filteredContacts.length === 0 ? (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 12 }}>✉</div>
                      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: 'var(--text)', marginBottom: 6 }}>No contact requests yet</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>When businesses fill out the contact form, they'll appear here</div>
                    </div>
                  ) : filteredContacts.map(req => (
                    <div
                      key={req.id}
                      className={`contact-card ${selectedContact?.id === req.id ? 'selected' : ''} ${req.status === 'replied' ? 'replied' : ''}`}
                      onClick={() => setSelectedContact(selectedContact?.id === req.id ? null : req)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{req.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>🏢 {req.business_name} · {BIZ_TYPE_LABELS[req.business_type] || req.business_type}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <span className={`contact-status ${req.status}`}>{req.status === 'new' ? '● New' : '✓ Replied'}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{timeAgo(req.created_at)}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--rose)', marginBottom: req.message ? 6 : 0 }}>{req.email}</div>
                      {req.message && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-mid)', lineHeight: 1.5, marginTop: 6, padding: '8px 10px', background: 'rgba(176,92,82,0.04)', borderRadius: 7, borderLeft: '3px solid var(--border)' }}>
                          {req.message.length > 120 ? req.message.slice(0, 120) + '…' : req.message}
                        </div>
                      )}
                      {req.status === 'replied' && req.replied_at && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--green)', marginTop: 6 }}>✓ Replied {timeAgo(req.replied_at)}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply panel */}
                {selectedContact && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '0.95rem', color: 'var(--text)' }}>Reply to {selectedContact.name}</div>
                      <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '1rem' }}>✕</button>
                    </div>

                    {/* Contact details summary */}
                    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: '0.75rem', lineHeight: 1.8 }}>
                      <div><strong>Email:</strong> <span style={{ color: 'var(--rose)' }}>{selectedContact.email}</span></div>
                      <div><strong>Business:</strong> {selectedContact.business_name}</div>
                      <div><strong>Type:</strong> {BIZ_TYPE_LABELS[selectedContact.business_type] || selectedContact.business_type}</div>
                      {selectedContact.message && <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)', color: 'var(--text-mid)' }}><strong>Their message:</strong> {selectedContact.message}</div>}
                    </div>

                    {replyMsg && <div className="action-msg">✓ {replyMsg}</div>}
                    {replyError && <div className="action-err">✗ {replyError}</div>}

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Subject</label>
                      <input className="inline-input" style={{ marginBottom: 0 }} value={replySubject} onChange={e => setReplySubject(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                        Message <span style={{ fontWeight: 400, fontSize: '0.62rem', color: 'var(--text-soft)' }}>· from info@qrfeedback.ai</span>
                      </label>
                      <textarea className="inline-textarea" style={{ marginBottom: 0, minHeight: 160 }} value={replyBody} onChange={e => setReplyBody(e.target.value)} />
                    </div>

                    <button
                      className="action-btn rose"
                      style={{ marginBottom: 0 }}
                      disabled={replyLoading || !replyBody.trim()}
                      onClick={handleSendReply}
                    >
                      {replyLoading ? 'Sending...' : selectedContact.status === 'replied' ? '↩ Send Again' : '✉ Send Reply'}
                    </button>

                    {selectedContact.status === 'new' && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', textAlign: 'center', marginTop: 8 }}>
                        Sending will mark this request as replied
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── SIGNUP ACTIVITY ── */}
            {activeTab === 'signup-activity' && (
              <>
                <div className="section-card">
                  <div className="section-card-header">
                    <span>New Signups — Last 14 Days</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'DM Sans, sans-serif' }}>{signupData.reduce((s, d) => s + d.count, 0)} total</span>
                  </div>
                  <div className="chart-wrap">
                    <div className="chart-bars">
                      {signupData.map((d, i) => (
                        <div key={i} className="chart-bar-col">
                          <div className="chart-bar-count">{d.count > 0 ? d.count : ''}</div>
                          <div className="chart-bar" style={{ height: `${Math.max((d.count / maxSignups) * 100, 4)}px` }} />
                          <div className="chart-bar-label">{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).replace(' ', '\n')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="section-card">
                  <div className="section-card-header">Recent Signups</div>
                  <div>
                    {[...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 20).map((u, i) => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderBottom: i < 19 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{u.full_name || u.email}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{u.email}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="plan-badge" style={{ background: PLAN_COLORS[u.plan]?.bg, color: PLAN_COLORS[u.plan]?.color }}>{u.plan}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', minWidth: 80, textAlign: 'right' }}>{timeAgo(u.created_at)}</span>
                          <button className="view-btn" onClick={() => { setSelectedUser(u); setActiveTab('users') }}>View</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── TRIAL EXPIRY ── */}
            {activeTab === 'trial-expiry' && (
              <div className="section-card">
                <div className="section-card-header">
                  <span>Active Trials</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'DM Sans, sans-serif' }}>{trialExpiryUsers.length} users on trial</span>
                </div>
                {trialExpiryUsers.length === 0 ? <div className="empty-state">No users currently on trial</div> : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Days Left', 'Expires', ''].map((h, i) => <div key={i} className="th">{h}</div>)}
                    </div>
                    {trialExpiryUsers.map(u => {
                      const days = getDaysLeft(u.trial_ends_at!); const urgent = days <= 2
                      return (
                        <div key={u.id} className="trial-row">
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{u.full_name || '—'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{u.email}</div>
                          </div>
                          <div>
                            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', color: urgent ? 'var(--rose)' : 'var(--terra)' }}>{days}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginLeft: 4 }}>day{days !== 1 ? 's' : ''}</span>
                            {urgent && <div style={{ fontSize: '0.62rem', color: 'var(--rose)', fontWeight: 700 }}>Expiring soon!</div>}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>{formatDate(u.trial_ends_at)}</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="view-btn" onClick={() => { setSelectedUser(u); setActiveTab('users') }}>View</button>
                            <button className="send-btn" style={{ background: '#c4896a' }} disabled={actionLoading} onClick={() => handleSetTrial(u.id, 7, 'pro')}>+7 days</button>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}

            {/* ── INACTIVE USERS ── */}
            {activeTab === 'inactive' && (
              <>
                <div className="info-box" style={{ marginBottom: 16 }}>
                  These users have had no login activity for <strong>6+ months</strong>. You can send them a re-engagement email directly from here.
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <span>Inactive Users (6+ months)</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'DM Sans, sans-serif' }}>{inactiveUsers.length} users</span>
                  </div>
                  {inactiveUsers.length === 0 ? <div className="empty-state">No inactive users — everyone is active! 🎉</div> : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                        {['User', 'Plan', 'Last Seen', ''].map((h, i) => <div key={i} className="th">{h}</div>)}
                      </div>
                      {inactiveUsers.map(u => (
                        <div key={u.id} className="inactive-row">
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{u.full_name || '—'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{u.email}</div>
                            {u.business_name && <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>🏢 {u.business_name}</div>}
                          </div>
                          <div><span className="plan-badge" style={{ background: PLAN_COLORS[u.plan]?.bg, color: PLAN_COLORS[u.plan]?.color }}>{u.plan}</span></div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>{timeAgo(u.last_sign_in_at || u.created_at)}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {inactiveEmailMsg[u.id] ? (
                              <span style={{ fontSize: '0.7rem', color: inactiveEmailMsg[u.id].startsWith('✓') ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{inactiveEmailMsg[u.id]}</span>
                            ) : (
                              <button className="send-btn" disabled={inactiveEmailLoading === u.id} onClick={() => handleSendInactiveEmail(u)}>
                                {inactiveEmailLoading === u.id ? 'Sending...' : '✉ Re-engage'}
                              </button>
                            )}
                            <button className="view-btn" onClick={() => { setSelectedUser(u); setActiveTab('users') }}>View</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* User detail panel — only shown in users tab */}
        {selectedUser && activeTab === 'users' && (
          <div className="detail-panel">
            <button className="detail-close" onClick={() => setSelectedUser(null)}>✕</button>
            <div style={{ marginTop: 8, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--rose-soft)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', color: 'var(--rose)', marginBottom: 12 }}>
                {selectedUser.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="detail-name">{selectedUser.full_name || 'No name'}</div>
              <div className="detail-email">{selectedUser.email}</div>
            </div>

            {actionMsg && <div className="action-msg">✓ {actionMsg}</div>}
            {actionError && <div className="action-err">✗ {actionError}</div>}

            <div className="detail-section">
              <div className="detail-section-title">Account Info</div>
              <div className="detail-row"><span className="detail-row-label">Plan</span><span className="plan-badge" style={{ background: PLAN_COLORS[selectedUser.plan]?.bg, color: PLAN_COLORS[selectedUser.plan]?.color }}>{selectedUser.plan}</span></div>
              {selectedUser.trial_ends_at && new Date(selectedUser.trial_ends_at) > new Date() && (
                <div className="detail-row"><span className="detail-row-label">Trial</span><span className="detail-row-val" style={{ color: '#c4896a' }}>{getDaysLeft(selectedUser.trial_ends_at)} days left · expires {formatDate(selectedUser.trial_ends_at)}</span></div>
              )}
              <div className="detail-row"><span className="detail-row-label">Business</span><span className="detail-row-val">{selectedUser.business_name || '—'}</span></div>
              <div className="detail-row"><span className="detail-row-label">Forms</span><span className="detail-row-val">{selectedUser.form_count}</span></div>
              <div className="detail-row"><span className="detail-row-label">Responses</span><span className="detail-row-val">{selectedUser.response_count}</span></div>
              <div className="detail-row"><span className="detail-row-label">Failed AI</span><span className="detail-row-val" style={{ color: selectedUser.failed_ai_count > 0 ? 'var(--rose)' : 'var(--green)' }}>{selectedUser.failed_ai_count}</span></div>
              <div className="detail-row"><span className="detail-row-label">Confirmed</span><span className="detail-row-val" style={{ color: selectedUser.email_confirmed_at ? 'var(--green)' : 'var(--rose)' }}>{selectedUser.email_confirmed_at ? '✓ Yes' : '✗ No'}</span></div>
              <div className="detail-row"><span className="detail-row-label">Signed up</span><span className="detail-row-val">{timeAgo(selectedUser.created_at)}</span></div>
              <div className="detail-row"><span className="detail-row-label">Last login</span><span className="detail-row-val">{timeAgo(selectedUser.last_sign_in_at)}</span></div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Change Plan</div>
              <select className="plan-select" value={selectedUser.plan} onChange={e => handlePlanChange(selectedUser.id, e.target.value)} disabled={actionLoading}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Trial Management</div>
              {!showTrialEdit ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="action-btn amber" style={{ flex: 1 }} disabled={actionLoading} onClick={() => handleSetTrial(selectedUser.id, 7, 'pro')}>↺ Reset Pro Trial (7d)</button>
                  <button className="action-btn outline" style={{ flex: 1 }} onClick={() => setShowTrialEdit(true)}>Custom Trial</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: 6 }}>Set trial plan and duration from today:</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {(['pro', 'business'] as const).map(p => (
                      <button key={p} onClick={() => setTrialPlan(p)}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${trialPlan === p ? (p === 'business' ? '#4a7a5a' : '#c4896a') : 'var(--border)'}`, background: trialPlan === p ? (p === 'business' ? 'var(--green-soft)' : '#fff3e8') : 'var(--surface)', color: trialPlan === p ? (p === 'business' ? '#4a7a5a' : '#c4896a') : 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {p.charAt(0).toUpperCase() + p.slice(1)} Trial
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['7', '14', '30'].map(d => (
                      <button key={d} onClick={() => setTrialDays(d)}
                        style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1.5px solid ${trialDays === d ? (trialPlan === 'business' ? '#4a7a5a' : '#c4896a') : 'var(--border)'}`, background: trialDays === d ? (trialPlan === 'business' ? 'var(--green-soft)' : '#fff3e8') : 'var(--surface)', color: trialDays === d ? (trialPlan === 'business' ? '#4a7a5a' : '#c4896a') : 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {d}d
                      </button>
                    ))}
                    <input className="inline-input" style={{ marginBottom: 0, flex: 1 }} type="number" min="1" max="90" placeholder="Custom" value={['7','14','30'].includes(trialDays) ? '' : trialDays} onChange={e => setTrialDays(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="action-btn" style={{ flex: 2, marginBottom: 0, background: trialPlan === 'business' ? '#4a7a5a' : '#c4896a', color: '#fff' }}
                      disabled={actionLoading || !trialDays} onClick={() => handleSetTrial(selectedUser.id, parseInt(trialDays), trialPlan)}>
                      {actionLoading ? '...' : `Set ${trialPlan === 'business' ? 'Business' : 'Pro'} Trial (${trialDays}d)`}
                    </button>
                    <button className="action-btn outline" style={{ flex: 1, marginBottom: 0 }} onClick={() => { setShowTrialEdit(false); setTrialDays('7'); setTrialPlan('pro') }}>Cancel</button>
                  </div>
                </>
              )}
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Actions</div>
              {!selectedUser.email_confirmed_at && (
                <button className="action-btn green" disabled={actionLoading} onClick={() => handleConfirmEmail(selectedUser.id)}>✓ Confirm Email Manually</button>
              )}
              <button className="action-btn outline" disabled={actionLoading} onClick={() => { navigator.clipboard.writeText(selectedUser.id); setActionMsg('User ID copied'); setTimeout(() => setActionMsg(''), 2000) }}>
                📋 Copy User ID
              </button>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Change Email Address</div>
              {!showEmailChange ? (
                <button className="action-btn outline" onClick={() => { setShowEmailChange(true); setActionError('') }}>✉ Change Email Address</button>
              ) : (
                <>
                  <div className="info-box">A verification email will be sent to the new address. The user will be logged out.</div>
                  <input className="inline-input" type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChangeEmail()} autoFocus />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn rose" style={{ flex: 1, marginBottom: 0 }} disabled={actionLoading || !newEmail.trim()} onClick={handleChangeEmail}>{actionLoading ? 'Updating...' : 'Save'}</button>
                    <button className="action-btn outline" style={{ flex: 1, marginBottom: 0 }} onClick={() => { setShowEmailChange(false); setNewEmail('') }}>Cancel</button>
                  </div>
                </>
              )}
            </div>

            <div className="danger-zone">
              <div className="danger-zone-title">⚠ Danger Zone</div>
              {!showDelete ? (
                <button className="action-btn red-outline" onClick={() => { setShowDelete(true); setActionError('') }}>🗑 Delete Account</button>
              ) : (
                <>
                  <div className="danger-box">This will permanently delete <strong>{selectedUser.full_name || selectedUser.email}</strong>'s account and all data.</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-mid)', marginBottom: 6 }}>Type <strong>DELETE</strong> to confirm:</div>
                  <input className="inline-input" style={{ borderColor: deleteConfirm === 'DELETE' ? 'var(--red)' : undefined }} placeholder="Type DELETE" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} autoFocus />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn red" style={{ flex: 1, marginBottom: 0 }} disabled={actionLoading || deleteConfirm !== 'DELETE'} onClick={handleDeleteUser}>{actionLoading ? 'Deleting...' : 'Delete Permanently'}</button>
                    <button className="action-btn outline" style={{ flex: 1, marginBottom: 0 }} onClick={() => { setShowDelete(false); setDeleteConfirm('') }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}