'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import OnboardingWizard from '@/components/OnboardingWizard'
import DashboardTour from '@/components/DashboardTour'

type Profile = {
  full_name: string | null
  email: string | null
  plan: string | null
  location_name: string | null
  business_name: string | null
  onboarding_completed: boolean | null
  avatar_url: string | null
  trial_ends_at: string | null
  is_admin: boolean | null
}

const navGroups = [
  { section: 'MAIN', items: [
    { label: 'Overview',      href: '/dashboard',          icon: '⊞', exact: true },
    { label: 'Responses',     href: '/dashboard/responses', icon: '◈', badge: true },
    { label: 'Analytics',     href: '/dashboard/analytics', icon: '◉' },
    { label: 'AI Insights',   href: '/dashboard/insights',  icon: '✦' },
    { label: 'Weekly Digest', href: '/dashboard/digest',    icon: '📊', proAndAbove: true },
  ]},
  { section: 'FORMS', items: [
    { label: 'My Forms',    href: '/dashboard/forms',     icon: '▤' },
    { label: 'Questions',   href: '/dashboard/questions', icon: '◎' },
    { label: 'QR Codes',    href: '/dashboard/qr',        icon: '⬛' },
  ]},
  { section: 'ACCOUNT', items: [
    { label: 'Profile',  href: '/dashboard/profile',  icon: '👤' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
  ]},
  { section: 'ADMIN', items: [
    { label: 'Admin Panel', href: '/qrf-admin', icon: '⚡', adminOnly: true },
  ]},
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/responses': 'Responses',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/insights': 'AI Insights',
  '/dashboard/digest': 'Weekly Digest',
  '/dashboard/forms': 'My Forms',
  '/dashboard/questions': 'Questions',
  '/dashboard/qr': 'QR Codes',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
}

const navIds: Record<string, string> = {
  '/dashboard': 'nav-overview',
  '/dashboard/responses': 'nav-responses',
  '/dashboard/analytics': 'nav-analytics',
  '/dashboard/insights': 'nav-ai-insights',
  '/dashboard/digest': 'nav-digest',
  '/dashboard/forms': 'nav-forms',
  '/dashboard/questions': 'nav-questions',
  '/dashboard/qr': 'nav-qr',
  '/dashboard/profile': 'nav-profile',
  '/dashboard/settings': 'nav-settings',
}

function getDaysLeft(trialEndsAt: string): number {
  const now = new Date()
  const end = new Date(trialEndsAt)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showWizard, setShowWizard] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [formCount, setFormCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false)

  useEffect(() => {
    loadProfile()
    window.addEventListener('profileUpdated', loadProfile)
    return () => window.removeEventListener('profileUpdated', loadProfile)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
    if (pathname.startsWith('/dashboard/responses')) setUnreadCount(0)
  }, [pathname])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, plan, location_name, business_name, onboarding_completed, avatar_url, trial_ends_at, is_admin')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      if (!data.onboarding_completed) setShowWizard(true)
    }
    setProfileLoaded(true)

    // Check and expire trial on every dashboard load
    try {
      const res = await fetch('/api/auth/check-trial', { method: 'POST' })
      const json = await res.json()
      if (json.trial_expired) {
        setProfile(prev => prev ? { ...prev, plan: 'free' } : prev)
        setShowTrialExpiredModal(true)
      }
    } catch {}

    const { count } = await supabase
      .from('forms')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setFormCount(count || 0)

    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard/responses')) {
      setUnreadCount(0); return
    }
    const { count: unread } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('ai_processed', false)
      .lte('rating', 3)
    setUnreadCount(unread || 0)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() || '?'

  const isFree = !profile?.plan || profile.plan === 'free'
  const isBusiness = profile?.plan === 'business'
  const isOnTrial = (profile?.plan === 'pro' || profile?.plan === 'business') && !!profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
  const daysLeft = isOnTrial && profile?.trial_ends_at ? getDaysLeft(profile.trial_ends_at) : 0
  const isAdmin = !!profile?.is_admin

  const planLabel = isOnTrial
    ? `${profile?.plan === 'business' ? 'Business' : 'Pro'} · Trial`
    : profile?.plan
      ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
      : 'Free'

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    path === pathname || (path !== '/dashboard' && pathname.startsWith(path))
  )?.[1] || 'Dashboard'

  const sidebarContent = (
    <>
      <div className="sb-logo-area">
        <div className="sb-logo-text">QRFeedback<span className="sb-logo-dot">.ai</span></div>
        <div className="sb-tagline">Owner Dashboard</div>
      </div>

      <div className="sb-biz-card">
        <div className="sb-biz-name">{!profileLoaded ? '' : (profile?.business_name || profile?.location_name || '')}</div>
        {profileLoaded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
            <div className={`sb-plan-pill ${isOnTrial ? (profile?.plan === 'business' ? 'business-trial' : 'trial') : ''}`}>{planLabel}</div>
            {isOnTrial && (
              <div className="sb-trial-days">{daysLeft}d left</div>
            )}
          </div>
        )}
      </div>

      <nav className="sb-nav">
        {navGroups.map(group => (
          <div key={group.section}>
            <div className="sb-section-label">{group.section}</div>
            {group.items.map(item => {
              if ((item as any).businessOnly && !isBusiness) return null
              if ((item as any).proAndAbove && isFree) return null
              if ((item as any).adminOnly && !isAdmin) return null
              const isActive = (item as any).exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
              const isBusinessItem = (item as any).businessOnly
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={navIds[item.href]}
                  className={`nav-link${isBusinessItem ? ' business-link' : ''}${isActive ? ' active' : ''}`}
                  onClick={() => {
                    if ((item as any).badge) setUnreadCount(0)
                    setSidebarOpen(false)
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {(item as any).badge && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                  {isBusinessItem && !isActive && (
                    <span className="nav-biz-tag">Business</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {profileLoaded && isFree && (
        <div className="sb-upgrade-card">
          <div className="sb-upgrade-title">
            <span>🚀 Upgrade Plan</span>
            <span className="sb-upgrade-plan">Free Plan</span>
          </div>
          <div className="sb-usage-track">
            <div className="sb-usage-fill" style={{ width: `${Math.min((formCount / 3) * 100, 100)}%` }} />
          </div>
          <div className="sb-usage-label">{formCount} / 3 forms used</div>
          <button className="sb-upgrade-btn" onClick={() => { router.push('/dashboard/profile'); setSidebarOpen(false) }}>
            Upgrade to Pro or Business →
          </button>
        </div>
      )}

      {profileLoaded && isOnTrial && (
        <div className="sb-trial-card">
          <div className="sb-trial-card-title">{profile?.plan === 'business' ? '🏢 Business Trial' : '⏳ Pro Trial'}</div>
          <div className="sb-trial-card-days">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</div>
          <div className="sb-trial-card-sub">Trial ends — you'll move to the Free plan automatically.</div>
          <button className="sb-upgrade-btn" onClick={() => { router.push('/dashboard/profile'); setSidebarOpen(false) }}>
            Upgrade to keep Pro →
          </button>
        </div>
      )}

      <div className="sb-footer">
        <div className="sb-user-row">
          <div className="sb-avatar">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" /> : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user-name">{!profileLoaded ? '' : (profile?.full_name || '')}</div>
            <div className="sb-user-email">{profile?.email || ''}</div>
          </div>
          <button className="sb-logout-btn" onClick={handleLogout}>Exit</button>
        </div>
      </div>
    </>
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
          --terra: #c4896a; --green: #4a7a5a;
          --sb-width: 232px;
        }

        .dash-wrap { display: flex; min-height: 100vh; }

        .dash-sb {
          width: var(--sb-width); background: var(--surface);
          position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
          display: flex; flex-direction: column; border-right: 1px solid var(--border);
        }

        .sb-overlay { display: none; position: fixed; inset: 0; z-index: 200; }
        .sb-overlay.open { display: flex; }
        .sb-overlay-backdrop { position: absolute; inset: 0; background: rgba(42,31,29,0.45); backdrop-filter: blur(2px); }
        .sb-overlay-panel {
          position: relative; width: 272px; max-width: 85vw;
          background: var(--surface); height: 100vh;
          display: flex; flex-direction: column;
          border-right: 1px solid var(--border);
          overflow-y: auto; z-index: 1;
          animation: slideInLeft 0.22s ease both;
        }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        .sb-logo-area { padding: 24px 20px 18px; border-bottom: 1px solid var(--border); }
        .sb-logo-text { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); }
        .sb-logo-dot { color: var(--rose); }
        .sb-tagline { font-size: 0.62rem; color: var(--text-soft); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }

        .sb-biz-card { margin: 12px 14px 0; padding: 10px 13px; background: var(--rose-soft); border-radius: 8px; border: 1px solid var(--border); min-height: 52px; }
        .sb-biz-name { font-size: 0.78rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 18px; }
        .sb-plan-pill { display: inline-block; margin-top: 4px; padding: 2px 9px; border-radius: 20px; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; background: var(--rose); color: #fff; }
        .sb-plan-pill.trial { background: #c4896a; }
        .sb-plan-pill.business-trial { background: #4a7a5a; }
        .sb-trial-days { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 20px; font-size: 0.58rem; font-weight: 700; background: #fef3e8; color: #7a5a20; border: 1px solid #f0d8a0; }

        .sb-nav { flex: 1; padding: 14px 10px; overflow-y: auto; }
        .sb-section-label { font-size: 0.55rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-soft); padding: 0 10px; margin: 14px 0 5px; }

        .nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 11px; border-radius: 7px; margin-bottom: 1px; font-size: 0.82rem; font-weight: 500; color: var(--text-mid); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { background: var(--rose-soft); color: var(--text); }
        .nav-link.active { background: var(--rose-soft); color: var(--rose); font-weight: 600; border-left: 2px solid var(--rose); padding-left: 9px; }
        .nav-link.business-link:hover { background: #edf4ef; color: var(--green); }
        .nav-link.business-link.active { background: #edf4ef; color: var(--green); border-left-color: var(--green); }

        .nav-icon { width: 20px; text-align: center; font-size: 0.85rem; flex-shrink: 0; }
        .nav-badge { margin-left: auto; background: var(--rose); color: #fff; font-size: 0.56rem; font-weight: 800; padding: 2px 6px; border-radius: 20px; }
        .nav-biz-tag { margin-left: auto; font-size: 0.52rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 1px 6px; border-radius: 10px; background: #edf4ef; color: var(--green); border: 1px solid rgba(74,122,90,0.2); }

        .sb-trial-card { margin: 0 14px 10px; padding: 12px 13px; background: linear-gradient(135deg, #fef3e8, #fff8f0); border: 1px solid #f0d8a0; border-radius: 10px; }
        .sb-trial-card-title { font-size: 0.72rem; font-weight: 700; color: #7a5a20; margin-bottom: 2px; }
        .sb-trial-card-days { font-size: 1rem; font-weight: 700; color: #5a3a10; font-family: 'DM Serif Display', serif; margin-bottom: 4px; }
        .sb-trial-card-sub { font-size: 0.62rem; color: #a07840; margin-bottom: 8px; line-height: 1.5; }

        .sb-upgrade-card { margin: 0 14px 10px; padding: 12px 13px; background: linear-gradient(135deg, #fdf0ee, #fff8f6); border: 1px solid var(--border-md); border-radius: 10px; }
        .sb-upgrade-title { font-size: 0.72rem; font-weight: 700; color: var(--text); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
        .sb-upgrade-plan { font-size: 0.58rem; color: var(--text-soft); font-weight: 600; }
        .sb-usage-track { height: 5px; background: #ead5d0; border-radius: 3px; margin-bottom: 5px; overflow: hidden; }
        .sb-usage-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--rose), var(--terra)); transition: width 0.4s; }
        .sb-usage-label { font-size: 0.62rem; color: var(--text-soft); margin-bottom: 8px; }
        .sb-upgrade-btn { width: 100%; padding: 7px; border-radius: 7px; border: none; background: var(--rose); color: #fff; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; text-align: center; }
        .sb-upgrade-btn:hover { background: var(--rose-dark); }

        .sb-footer { padding: 12px 14px 18px; border-top: 1px solid var(--border); }
        .sb-user-row { display: flex; align-items: center; gap: 9px; }
        .sb-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--rose-soft); border: 1.5px solid var(--border-md); display: flex; align-items: center; justify-content: center; font-family: 'DM Serif Display', serif; font-size: 0.8rem; color: var(--rose); flex-shrink: 0; overflow: hidden; }
        .sb-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .sb-user-name { font-size: 0.76rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-height: 16px; }
        .sb-user-email { font-size: 0.62rem; color: var(--text-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sb-logout-btn { background: transparent; border: 1px solid var(--border); cursor: pointer; color: var(--text-soft); font-size: 0.7rem; padding: 4px 9px; border-radius: 6px; transition: all 0.15s; margin-left: auto; flex-shrink: 0; font-family: 'DM Sans', sans-serif; }
        .sb-logout-btn:hover { background: var(--rose-soft); color: var(--rose); border-color: var(--border-md); }

        .trial-banner { background: linear-gradient(135deg, #fef3e8, #fff8f0); border-bottom: 1px solid #f0d8a0; padding: 9px 28px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .trial-banner-text { font-size: 0.78rem; color: #5a3a10; flex: 1; }
        .trial-banner-text strong { font-weight: 700; }
        .trial-banner-upgrade { padding: 5px 14px; border-radius: 7px; border: none; background: #c4896a; color: #fff; font-size: 0.74rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: all 0.15s; }
        .trial-banner-upgrade:hover { background: #a06848; }
        .trial-banner-dismiss { background: none; border: none; cursor: pointer; color: #a07840; font-size: 1rem; padding: 2px; line-height: 1; flex-shrink: 0; }

        .dash-main { margin-left: var(--sb-width); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        .dash-topbar {
          background: var(--surface); border-bottom: 1px solid var(--border);
          padding: 0 28px; height: 58px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50; gap: 12px;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .topbar-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .hamburger { display: none; flex-direction: column; justify-content: center; align-items: center; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; gap: 5px; flex-shrink: 0; transition: all 0.15s; }
        .hamburger:hover { background: var(--rose-soft); border-color: var(--border-md); }
        .hamburger span { display: block; width: 18px; height: 2px; background: var(--text-mid); border-radius: 2px; }

        .tb-btn { padding: 6px 14px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); font-size: 0.77rem; font-weight: 500; cursor: pointer; color: var(--text-mid); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .tb-btn:hover { border-color: var(--border-md); color: var(--text); background: var(--rose-soft); }
        .tb-btn-primary { padding: 6px 16px; border-radius: 7px; background: var(--rose); border: none; font-size: 0.77rem; font-weight: 600; cursor: pointer; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; box-shadow: 0 1px 3px rgba(176,92,82,0.25); white-space: nowrap; }
        .tb-btn-primary:hover { background: var(--rose-dark); transform: translateY(-1px); }

        .dash-content { padding: 24px 28px; flex: 1; background: var(--bg); }

        .sb-nav::-webkit-scrollbar { width: 3px; }
        .sb-nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

        @media (max-width: 768px) {
          .dash-sb { display: none; }
          .dash-main { margin-left: 0; }
          .hamburger { display: flex; }
          .dash-topbar { padding: 0 16px; }
          .dash-content { padding: 16px; }
          .tb-btn { display: none; }
          .trial-banner { padding: 9px 16px; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          :root { --sb-width: 200px; }
          .dash-topbar { padding: 0 20px; }
          .dash-content { padding: 20px; }
        }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-sb">{sidebarContent}</div>

        <div className={`sb-overlay ${sidebarOpen ? 'open' : ''}`}>
          <div className="sb-overlay-backdrop" onClick={() => setSidebarOpen(false)} />
          <div className="sb-overlay-panel">{sidebarContent}</div>
        </div>

        <div className="dash-main">
          {isOnTrial && !trialBannerDismissed && profileLoaded && (
            <div className="trial-banner">
              <span style={{ fontSize: '1rem' }}>⏳</span>
              <div className="trial-banner-text">
                <strong>{profile?.plan === 'business' ? 'Business' : 'Pro'} Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left.</strong>{' '}
                You're on a free {profile?.plan === 'business' ? 'Business' : 'Pro'} trial. After it ends your account moves to the Free plan.
              </div>
              <button className="trial-banner-upgrade" onClick={() => router.push('/dashboard/profile')}>
                Upgrade to keep Pro →
              </button>
              <button className="trial-banner-dismiss" onClick={() => setTrialBannerDismissed(true)}>✕</button>
            </div>
          )}

          <div className="dash-topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <span /><span /><span />
              </button>
              <div className="topbar-title">{pageTitle}</div>
            </div>
            <div className="topbar-actions">
              <Link href="/dashboard/analytics" className="tb-btn">Analytics</Link>
              <Link href="/dashboard/forms" className="tb-btn-primary">+ New Form</Link>
            </div>
          </div>
          <div className="dash-content">{children}</div>
        </div>
      </div>

      {showWizard && (
        <OnboardingWizard onComplete={() => { setShowWizard(false); setShowTour(true) }} />
      )}
      {showTour && (
        <DashboardTour onComplete={() => setShowTour(false)} />
      )}

      {/* Trial Expired Modal */}
      {showTrialExpiredModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,31,29,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, border: '1px solid #e8d5cf', boxShadow: '0 24px 64px rgba(42,31,29,0.18)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #2a1f1d, #3d2520)', padding: '28px 28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⏳</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.3rem', color: '#f5ede8', marginBottom: 6 }}>Your trial has ended</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(245,237,232,0.55)', lineHeight: 1.6 }}>Your free trial has expired and your account has moved to the Free plan. Upgrade to keep Pro features.</div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {['Unlimited forms & QR codes', 'AI complaint analysis', 'Custom QR designs', 'Weekly AI email digest', 'Advanced analytics & CSV export'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#7a5a56' }}>
                    <span style={{ color: '#4a7a5a', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontFamily: 'DM Serif Display, serif', fontSize: '1.6rem', color: '#2a1f1d', marginBottom: 4 }}>
                $19<span style={{ fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>/mo</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#b09490', marginBottom: 16 }}>Cancel anytime · No commitment</div>
              <button
                onClick={() => { setShowTrialExpiredModal(false); router.push('/dashboard/profile') }}
                style={{ width: '100%', padding: 12, borderRadius: 9, border: 'none', background: '#b05c52', color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 3px 12px rgba(176,92,82,0.3)', marginBottom: 8 }}>
                Upgrade to Pro →
              </button>
              <button
                onClick={() => setShowTrialExpiredModal(false)}
                style={{ width: '100%', padding: 10, borderRadius: 9, border: '1.5px solid #e8d5cf', background: 'transparent', color: '#7a5a56', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Continue on Free plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}