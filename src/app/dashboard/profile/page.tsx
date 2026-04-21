'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PLAN_FEATURES: Record<string, { label: string; price: string; features: string[]; locked: string[] }> = {
  free: {
    label: 'Free', price: '$0/mo',
    features: ['3 forms', '50 responses/month', 'Smart review routing', 'Basic QR codes', 'Email support'],
    locked: ['AI complaint analysis', 'Custom QR designs', 'Weekly AI digest', 'Advanced analytics', 'CSV export', 'White-label forms', 'Remove branding'],
  },
  pro: {
    label: 'Pro', price: '$19/mo',
    features: ['Unlimited forms', '1,000 responses/month', 'Smart review routing', 'AI complaint analysis', 'Custom QR designs', 'Weekly AI email digest', 'Advanced analytics', 'CSV export'],
    locked: ['White-label forms (Business)', 'Remove branding (Business)'],
  },
  business: {
    label: 'Business', price: '$49/mo',
    features: ['Everything in Pro', 'Unlimited responses', 'White-label forms', 'Remove branding', 'Priority support'],
    locked: [],
  },
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [businessName, setBusinessName] = useState('')
  const [locationName, setLocationName] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [businessType, setBusinessType] = useState('other')
  const [savingBiz, setSavingBiz] = useState(false)
  const [savedBiz, setSavedBiz] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)
  const [savedAccount, setSavedAccount] = useState(false)
  const [accountError, setAccountError] = useState('')

  const [plan, setPlan] = useState('free')

  // Avatar (profile photo)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Brand logo (for QR codes) — Business plan only
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [savedLogo, setSavedLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setBusinessName(data.business_name || '')
      setLocationName(data.location_name || '')
      setGoogleUrl(data.google_review_url || '')
      setBusinessType(data.business_type || 'other')
      setFullName(data.full_name || '')
      setEmail(data.email || user.email || '')
      setPlan(data.plan || 'free')
      setAvatarUrl(data.avatar_url || null)
      setLogoUrl(data.logo_url || null)
    }
    setLoading(false)
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingAvatar(false); return }
    const ext = file.name.split('.').pop()
    const path = `${user.id}/logo_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { console.error('Upload error:', error.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = data.publicUrl
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setAvatarUrl(url); setAvatarPreview(null); setAvatarFile(null)
    window.dispatchEvent(new Event('profileUpdated'))
    setUploadingAvatar(false)
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingLogo(false); return }
    const ext = file.name.split('.').pop()
    const path = `${user.id}/brand_logo_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (error) { console.error('Logo upload error:', error.message); setUploadingLogo(false); return }
    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    const url = data.publicUrl
    await supabase.from('profiles').update({ logo_url: url }).eq('id', user.id)
    setLogoUrl(url); setLogoPreview(null); setLogoFile(null)
    setSavedLogo(true); setTimeout(() => setSavedLogo(false), 3000)
    setUploadingLogo(false)
  }

  async function removeLogo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ logo_url: null }).eq('id', user.id)
    setLogoUrl(null); setLogoFile(null); setLogoPreview(null)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function saveBusinessProfile() {
    setSavingBiz(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      business_name: businessName, location_name: locationName,
      google_review_url: googleUrl, business_type: businessType,
    }).eq('id', user.id)
    window.dispatchEvent(new Event('profileUpdated'))
    setSavingBiz(false); setSavedBiz(true)
    setTimeout(() => setSavedBiz(false), 3000)
  }

  async function saveAccount() {
    setSavingAccount(true); setAccountError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    if (newPassword) {
      if (!currentPassword) { setAccountError('Please enter your current password.'); setSavingAccount(false); return }
      if (newPassword !== confirmPassword) { setAccountError('New passwords do not match.'); setSavingAccount(false); return }
      if (newPassword.length < 6) { setAccountError('New password must be at least 6 characters.'); setSavingAccount(false); return }
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
      if (authError) { setAccountError('Current password is incorrect.'); setSavingAccount(false); return }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) { setAccountError(updateError.message); setSavingAccount(false); return }
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    window.dispatchEvent(new Event('profileUpdated'))
    setSavingAccount(false); setSavedAccount(true)
    setTimeout(() => setSavedAccount(false), 3000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading profile...</div>
    </div>
  )

  const planInfo = PLAN_FEATURES[plan] || PLAN_FEATURES.free
  const nextPlanLabel = plan === 'free' ? 'Pro / Business' : plan === 'pro' ? 'Business' : null
  const currentLogo = logoPreview || logoUrl
  const isBusiness = plan === 'business'

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
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 1000px; }
        .s-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 22px 24px; }
        .s-card.full { grid-column: 1 / -1; }
        .s-card-title { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text); margin-bottom: 5px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input, .form-select { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.85rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--bg); transition: all 0.2s; }
        .form-input:focus, .form-select:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff; }
        .form-input::placeholder { color: #c9aba6; }
        .form-input:disabled { opacity: 0.55; cursor: not-allowed; background: #f5f0ee; }
        .url-wrap { position: relative; }
        .url-check { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--green); }
        .save-btn { width: 100%; padding: 10px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.83rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 6px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(176,92,82,0.2); }
        .save-btn:hover:not(:disabled) { background: var(--rose-dark); }
        .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .save-btn.saved { background: #4a7a5a; box-shadow: 0 2px 8px rgba(74,122,90,0.2); }
        .save-btn.inline { width: auto; padding: 9px 28px; }
        .plan-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .plan-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: var(--rose-soft); color: var(--rose); border: 1px solid var(--border-md); }
        .plan-badge.pro { background: #fef3e8; color: var(--terra); border-color: #f0d8c0; }
        .plan-badge.business { background: var(--green-soft); color: var(--green); border-color: #c0d8c8; }
        .upgrade-btn { padding: 7px 16px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; box-shadow: 0 2px 8px rgba(176,92,82,0.2); transition: all 0.15s; }
        .upgrade-btn:hover { background: var(--rose-dark); transform: translateY(-1px); }
        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-item { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; padding: 4px 0; color: var(--text-mid); }
        .feature-item.locked { color: var(--text-soft); }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
        .feature-dot.locked { background: #ddd0cc; }
        .avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; padding: 16px; background: var(--bg); border-radius: 10px; border: 1px solid var(--border); }
        .avatar-circle { width: 72px; height: 72px; border-radius: 50%; background: var(--rose-soft); border: 2px solid var(--border-md); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-initial { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--rose); }
        .avatar-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .avatar-btn { padding: 5px 14px; border-radius: 7px; font-size: 0.74rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .avatar-btn.primary { border: none; background: var(--rose); color: #fff; }
        .avatar-btn.primary:hover:not(:disabled) { background: var(--rose-dark); }
        .avatar-btn.primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .avatar-btn.secondary { border: 1px solid var(--border); background: var(--surface); color: var(--text-mid); }
        .avatar-btn.secondary:hover { background: var(--rose-soft); border-color: var(--border-md); }
        .avatar-btn.danger { border: 1px solid #f0c4be; background: #fef5f4; color: #8c3d34; }
        .avatar-btn.danger:hover { background: #fde8e5; }
        .logo-section { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .logo-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .logo-section-title { font-size: 0.78rem; font-weight: 700; color: var(--text); }
        .logo-section-sub { font-size: 0.68rem; color: var(--text-soft); margin-top: 2px; }
        .logo-preview-wrap { display: flex; align-items: center; gap: 14px; }
        .logo-circle { width: 56px; height: 56px; border-radius: 50%; background: #fff; border: 2px solid var(--border-md); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .logo-circle img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .logo-circle-empty { font-size: 1.4rem; opacity: 0.4; }
        .logo-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: var(--green-soft); color: var(--green); border: 1px solid rgba(74,122,90,0.2); }
        .logo-locked { background: var(--rose-soft); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .logo-locked-text { font-size: 0.78rem; color: var(--text-mid); flex: 1; line-height: 1.5; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
        .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px 20px; }
        .pw-section-label { font-size: 0.7rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.6px; margin: 16px 0 12px; display: flex; align-items: center; gap: 8px; }
        .pw-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .error-box { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 9px 13px; font-size: 0.78rem; color: #8c3d34; margin-bottom: 12px; }
        .account-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
        @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } .two-col, .three-col { grid-template-columns: 1fr; } }
      `}</style>

      <div className="profile-grid">

        <div className="s-card">
          <div className="s-card-title">🏢 Business Profile</div>

          {/* Brand Logo — Business plan only */}
          {isBusiness ? (
            <div className="logo-section">
              <div className="logo-section-header">
                <div>
                  <div className="logo-section-title">Brand Logo</div>
                  <div className="logo-section-sub">Shown in the center of your QR codes · PNG, JPG or SVG</div>
                </div>
                <span className="logo-badge">✦ Business</span>
              </div>
              <div className="logo-preview-wrap">
                <div className="logo-circle">
                  {currentLogo
                    ? <img src={currentLogo} alt="Brand logo" />
                    : <span className="logo-circle-empty">🏷</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-mid)', marginBottom: 8, lineHeight: 1.5 }}>
                    {currentLogo
                      ? logoFile ? 'New logo ready to save' : 'Logo is active on your QR codes'
                      : 'No logo uploaded yet. Add one to personalise your QR codes.'
                    }
                  </div>
                  <div className="avatar-actions" style={{ marginTop: 0 }}>
                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                    {logoFile ? (
                      <>
                        <button className="avatar-btn primary" onClick={() => uploadLogo(logoFile)} disabled={uploadingLogo}>
                          {uploadingLogo ? 'Uploading...' : savedLogo ? '✓ Saved!' : 'Save Logo'}
                        </button>
                        <button className="avatar-btn secondary" onClick={() => { setLogoFile(null); setLogoPreview(null) }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="avatar-btn secondary" onClick={() => logoInputRef.current?.click()}>
                          {logoUrl ? '↑ Change Logo' : '↑ Upload Logo'}
                        </button>
                        {logoUrl && (
                          <button className="avatar-btn danger" onClick={removeLogo}>Remove</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="logo-locked">
              <span style={{ fontSize: '1.4rem' }}>🏷</span>
              <div className="logo-locked-text">
                <strong>Brand Logo on QR</strong> is a Business plan feature. Upgrade to add your logo to the center of your QR codes.
              </div>
              <button className="upgrade-btn" onClick={() => {}}>Upgrade</button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input type="text" className="form-input" placeholder="e.g. The Golden Fork" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Business Type</label>
            <select className="form-select" value={businessType} onChange={e => setBusinessType(e.target.value)}>
              <option value="restaurant">🍽 Restaurant</option>
              <option value="retail">🛍 Retail</option>
              <option value="healthcare">🏥 Healthcare</option>
              <option value="services">💼 Services</option>
              <option value="other">⬡ Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location / Address</label>
            <input type="text" className="form-input" placeholder="e.g. 123 MG Road, Mysuru" value={locationName} onChange={e => setLocationName(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Google Review URL</label>
            <div className="url-wrap">
              <input type="url" className="form-input" placeholder="https://g.page/r/yourbusiness/review"
                value={googleUrl} onChange={e => setGoogleUrl(e.target.value)}
                style={{ paddingRight: googleUrl ? '34px' : '12px' }} />
              {googleUrl && <span className="url-check">✓</span>}
            </div>
          </div>
          <button className={`save-btn${savedBiz ? ' saved' : ''}`} onClick={saveBusinessProfile} disabled={savingBiz}>
            {savingBiz ? 'Saving...' : savedBiz ? '✓ Saved' : 'Save Business Profile'}
          </button>
        </div>

        <div className="s-card">
          <div className="s-card-title">💳 Plan & Billing</div>
          <div className="plan-header">
            <span className={`plan-badge ${plan}`}>{planInfo.label} — {planInfo.price}</span>
            {nextPlanLabel && (
              <button className="upgrade-btn">Upgrade to {nextPlanLabel}</button>
            )}
          </div>
          <ul className="feature-list">
            {planInfo.features.map(f => (
              <li key={f} className="feature-item"><span className="feature-dot"></span>{f}</li>
            ))}
            {planInfo.locked.map(f => (
              <li key={f} className="feature-item locked"><span className="feature-dot locked"></span>{f}</li>
            ))}
          </ul>
        </div>

        <div className="s-card full">
          <div className="s-card-title">👤 Account</div>
          <div className="avatar-section">
            <div className="avatar-circle">
              {(avatarPreview || avatarUrl)
                ? <img src={avatarPreview || avatarUrl!} alt="avatar" />
                : <span className="avatar-initial">{fullName?.[0]?.toUpperCase() || '?'}</span>
              }
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Profile Photo</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: 0 }}>JPG or PNG, up to 5MB</div>
              <div className="avatar-actions">
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                {avatarFile ? (
                  <>
                    <button className="avatar-btn primary" onClick={() => uploadAvatar(avatarFile)} disabled={uploadingAvatar}>
                      {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
                    </button>
                    <button className="avatar-btn secondary" onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}>Cancel</button>
                  </>
                ) : (
                  <button className="avatar-btn secondary" onClick={() => fileInputRef.current?.click()}>
                    {avatarUrl ? '↑ Change Photo' : '↑ Upload Photo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} disabled />
            </div>
          </div>

          <div className="pw-section-label">Change Password</div>
          {accountError && <div className="error-box">⚠ {accountError}</div>}

          <div className="three-col">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div className="account-footer">
            <button className={`save-btn inline${savedAccount ? ' saved' : ''}`} onClick={saveAccount} disabled={savingAccount}>
              {savingAccount ? 'Saving...' : savedAccount ? '✓ Account Updated' : 'Update Account'}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}