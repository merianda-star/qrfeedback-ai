'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TRUST_KEY_PREFIX = 'qrf_trusted_'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  const [reviewCentreActive, setReviewCentreActive] = useState(true)
  const [smartRouting, setSmartRouting] = useState(true)
  const [aiEmailAlerts, setAiEmailAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [savingReview, setSavingReview] = useState(false)
  const [savedReview, setSavedReview] = useState(false)

  const [alertEmail, setAlertEmail] = useState('')
  const [notifyNegative, setNotifyNegative] = useState(true)
  const [notifyPositive, setNotifyPositive] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)
  const [savedNotif, setSavedNotif] = useState(false)

  const [otpEnabled, setOtpEnabled] = useState(false)
  const [otpSaving, setOtpSaving] = useState(false)
  const [otpSuccess, setOtpSuccess] = useState('')
  const [otpError, setOtpError] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [trustedDeviceActive, setTrustedDeviceActive] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUserId(user.id)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setAlertEmail(data.alert_email || data.email || user.email || '')
      setReviewCentreActive(data.review_centre_active ?? true)
      setSmartRouting(data.smart_routing ?? true)
      setAiEmailAlerts(data.ai_email_alerts ?? true)
      setWeeklyDigest(data.weekly_digest ?? true)
      setNotifyNegative(data.notify_on_negative ?? true)
      setNotifyPositive(data.notify_on_positive ?? false)
      setOtpEnabled(data.email_otp_enabled ?? false)
    }
    const trustKey = `${TRUST_KEY_PREFIX}${user.id}`
    const trustData = localStorage.getItem(trustKey)
    if (trustData) {
      try {
        const { expires } = JSON.parse(trustData)
        if (Date.now() < expires) setTrustedDeviceActive(true)
      } catch { }
    }
    setLoading(false)
  }

  async function saveReviewCentre() {
    setSavingReview(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      review_centre_active: reviewCentreActive,
      smart_routing: smartRouting,
      ai_email_alerts: aiEmailAlerts,
      weekly_digest: weeklyDigest,
    }).eq('id', user.id)
    // Sync all forms with the review centre status
    await supabase.from('forms')
      .update({ is_active: reviewCentreActive })
      .eq('user_id', user.id)
    setSavingReview(false); setSavedReview(true)
    setTimeout(() => setSavedReview(false), 3000)
  }

  async function saveNotifications() {
    setSavingNotif(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      alert_email: alertEmail,
      notify_on_negative: notifyNegative,
      notify_on_positive: notifyPositive,
    }).eq('id', user.id)
    setSavingNotif(false); setSavedNotif(true)
    setTimeout(() => setSavedNotif(false), 3000)
  }

  async function enableOtp() {
    setOtpSaving(true); setOtpError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ email_otp_enabled: true }).eq('id', user.id)
    setOtpSaving(false)
    if (error) { setOtpError('Failed to enable. Please try again.'); return }
    setOtpEnabled(true)
    setOtpSuccess("Email verification is now enabled. You'll receive a code on your email at each login.")
    setTimeout(() => setOtpSuccess(''), 5000)
  }

  async function disableOtp() {
    setOtpSaving(true); setOtpError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ email_otp_enabled: false }).eq('id', user.id)
    setOtpSaving(false)
    if (error) { setOtpError('Failed to disable. Please try again.'); return }
    setOtpEnabled(false); setShowDisableConfirm(false)
    setOtpSuccess('Email verification has been disabled.')
    setTimeout(() => setOtpSuccess(''), 4000)
  }

  function revokeTrust() {
    localStorage.removeItem(`${TRUST_KEY_PREFIX}${userId}`)
    setTrustedDeviceActive(false)
    setOtpSuccess("This device is no longer trusted. You'll need to verify your email on next login.")
    setTimeout(() => setOtpSuccess(''), 4000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading settings...</div>
    </div>
  )

  return (
    <>
      <style>{`
        :root {
          --bg: #fdf6f4; --surface: #ffffff;
          --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --green: #4a7a5a; --green-soft: #edf4ef;
        }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 900px; }
        .s-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 22px 24px; }
        .s-card-full { grid-column: 1 / -1; }
        .s-card-title { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .toggle-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f5ede9; }
        .toggle-row:last-of-type { border-bottom: none; }
        .toggle-label { font-size: 0.83rem; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .toggle-desc { font-size: 0.71rem; color: var(--text-soft); line-height: 1.4; }
        .vic-toggle { position: relative; width: 44px; height: 23px; flex-shrink: 0; margin-left: 14px; margin-top: 2px; }
        .vic-toggle input { opacity: 0; width: 0; height: 0; }
        .vic-toggle-track { position: absolute; inset: 0; cursor: pointer; background: #ddd0cc; border-radius: 23px; transition: all 0.25s; }
        .vic-toggle input:checked + .vic-toggle-track { background: var(--rose); }
        .vic-toggle-track::after { content: ''; position: absolute; left: 3px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; background: #fff; border-radius: 50%; transition: all 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .vic-toggle input:checked + .vic-toggle-track::after { left: calc(100% - 20px); }
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text); margin-bottom: 5px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-label-sub { font-size: 0.7rem; color: var(--text-soft); font-weight: 400; text-transform: none; letter-spacing: 0; }
        .form-input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.85rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--bg); transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff; }
        .form-input::placeholder { color: #c9aba6; }
        .divider { height: 1px; background: var(--border); margin: 14px 0; }
        .save-btn { width: 100%; padding: 10px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.83rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 14px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(176,92,82,0.2); }
        .save-btn:hover:not(:disabled) { background: var(--rose-dark); }
        .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .save-btn.saved { background: #4a7a5a; }
        .otp-status-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5ede9; gap: 16px; }
        .otp-badge-enabled { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; background: var(--green-soft); color: var(--green); border: 1px solid rgba(74,122,90,0.25); font-size: 0.68rem; font-weight: 700; white-space: nowrap; }
        .otp-badge-disabled { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; background: #f5f0ee; color: var(--text-soft); border: 1px solid var(--border); font-size: 0.68rem; font-weight: 700; white-space: nowrap; }
        .otp-action-btn { padding: 7px 16px; border-radius: 8px; border: 1.5px solid; font-size: 0.76rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
        .otp-action-btn.enable { border-color: var(--rose); background: var(--rose-soft); color: var(--rose); }
        .otp-action-btn.enable:hover { background: var(--rose); color: #fff; }
        .otp-action-btn.disable { border-color: #e8b4b0; background: #fff; color: #c0392b; }
        .otp-action-btn.disable:hover { background: #fdecea; }
        .otp-action-btn.revoke { border-color: var(--border); background: #fff; color: var(--text-soft); }
        .otp-action-btn.revoke:hover { border-color: var(--border-md); color: var(--text-mid); }
        .otp-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-info-box { background: #fef9ec; border: 1px solid #f0d98a; border-radius: 8px; padding: 10px 12px; font-size: 0.71rem; color: #7a6020; line-height: 1.55; display: flex; gap: 8px; margin-top: 14px; }
        .otp-disable-box { margin-top: 14px; background: #fdecea; border: 1px solid #e8b4b0; border-radius: 10px; padding: 16px 18px; }
        .otp-disable-title { font-size: 0.82rem; font-weight: 700; color: #c0392b; margin-bottom: 6px; }
        .otp-disable-sub { font-size: 0.72rem; color: #a03020; line-height: 1.5; margin-bottom: 14px; }
        .otp-btn-row { display: flex; gap: 8px; }
        .otp-confirm-btn { flex: 2; padding: 9px; border-radius: 8px; border: none; background: #c0392b; color: #fff; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .otp-confirm-btn:hover:not(:disabled) { background: #a93226; }
        .otp-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-cancel-btn { flex: 1; padding: 9px; border-radius: 8px; border: 1.5px solid var(--border); background: #fff; font-size: 0.8rem; font-weight: 600; color: var(--text-soft); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .otp-cancel-btn:hover { border-color: var(--border-md); color: var(--text-mid); }
        .otp-trusted-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 0; gap: 16px; }
        .otp-success { background: var(--green-soft); border: 1px solid rgba(74,122,90,0.25); border-radius: 8px; padding: 9px 12px; font-size: 0.75rem; color: var(--green); font-weight: 600; margin-bottom: 12px; }
        .otp-error { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 9px 12px; font-size: 0.75rem; color: #8c3d34; margin-bottom: 10px; }
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .s-card-full { grid-column: 1; } }
      `}</style>

      <div className="settings-grid">

        {/* Review Centre */}
        <div className="s-card">
          <div className="s-card-title">⚙ Review Centre</div>
          {[
            { label: 'Review Centre Status', desc: 'Opens or closes all feedback forms at once', val: reviewCentreActive, set: setReviewCentreActive },
            { label: 'Smart Routing (Review Mode)', desc: '4–5 stars redirects to Google Review', val: smartRouting, set: setSmartRouting },
            { label: 'AI Email Alerts', desc: 'Master switch for all email notifications', val: aiEmailAlerts, set: setAiEmailAlerts },
            { label: 'Weekly AI Digest', desc: 'AI summary email every Monday at 8 AM', val: weeklyDigest, set: setWeeklyDigest },
          ].map(t => (
            <div key={t.label} className="toggle-row">
              <div>
                <div className="toggle-label">{t.label}</div>
                <div className="toggle-desc">{t.desc}</div>
              </div>
              <label className="vic-toggle">
                <input type="checkbox" checked={t.val} onChange={e => t.set(e.target.checked)} />
                <span className="vic-toggle-track"></span>
              </label>
            </div>
          ))}
          <button className={`save-btn${savedReview ? ' saved' : ''}`} onClick={saveReviewCentre} disabled={savingReview}>
            {savingReview ? 'Saving...' : savedReview ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Notifications */}
        <div className="s-card">
          <div className="s-card-title">🔔 Notifications</div>
          <div className="form-group">
            <label className="form-label">
              Alert Email Address
              <span className="form-label-sub"> — Where AI alerts are sent</span>
            </label>
            <input type="email" className="form-input" placeholder="you@yourbusiness.com"
              value={alertEmail} onChange={e => setAlertEmail(e.target.value)} />
          </div>
          <div className="divider"></div>
          {[
            { label: 'Notify on Negative Reviews', desc: "Email alert after every 10 '1–3 star' reviews in a day", val: notifyNegative, set: setNotifyNegative },
            { label: 'Notify on Positive', desc: 'Email when 4–5 star review is redirected to Google', val: notifyPositive, set: setNotifyPositive },
          ].map(t => (
            <div key={t.label} className="toggle-row">
              <div>
                <div className="toggle-label">{t.label}</div>
                <div className="toggle-desc">{t.desc}</div>
              </div>
              <label className="vic-toggle">
                <input type="checkbox" checked={t.val} onChange={e => t.set(e.target.checked)} />
                <span className="vic-toggle-track"></span>
              </label>
            </div>
          ))}
          <button className={`save-btn${savedNotif ? ' saved' : ''}`} onClick={saveNotifications} disabled={savingNotif}>
            {savingNotif ? 'Saving...' : savedNotif ? '✓ Saved' : 'Save'}
          </button>
        </div>

        {/* Email OTP 2FA */}
        <div className="s-card s-card-full">
          <div className="s-card-title">🔐 Two-Step Verification</div>

          {otpSuccess && <div className="otp-success">✓ {otpSuccess}</div>}
          {otpError && <div className="otp-error">⚠ {otpError}</div>}

          <div className="otp-status-row">
            <div>
              <div className="toggle-label">Email Verification Code</div>
              <div className="toggle-desc">
                After signing in with your password, we'll send a 6-digit code to your email. Enter it to complete login.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {otpEnabled
                ? <span className="otp-badge-enabled">✓ Enabled</span>
                : <span className="otp-badge-disabled">Not enabled</span>
              }
              {!showDisableConfirm && (
                otpEnabled ? (
                  <button className="otp-action-btn disable" onClick={() => setShowDisableConfirm(true)} disabled={otpSaving}>Disable</button>
                ) : (
                  <button className="otp-action-btn enable" onClick={enableOtp} disabled={otpSaving}>
                    {otpSaving ? 'Enabling...' : 'Enable'}
                  </button>
                )
              )}
            </div>
          </div>

          {otpEnabled && (
            <div className="otp-trusted-row">
              <div>
                <div className="toggle-label">This Device</div>
                <div className="toggle-desc">
                  {trustedDeviceActive
                    ? "This device is trusted for 30 days — you won't be asked for a code on this device."
                    : "This device is not trusted. You'll be asked for a code every time you sign in."}
                </div>
              </div>
              {trustedDeviceActive && (
                <button className="otp-action-btn revoke" onClick={revokeTrust} style={{ flexShrink: 0 }}>Revoke Trust</button>
              )}
            </div>
          )}

          {showDisableConfirm && (
            <div className="otp-disable-box">
              <div className="otp-disable-title">⚠ Disable Two-Step Verification?</div>
              <div className="otp-disable-sub">This will remove the extra security layer from your account. Anyone with your password will be able to sign in directly.</div>
              <div className="otp-btn-row">
                <button className="otp-confirm-btn" onClick={disableOtp} disabled={otpSaving}>
                  {otpSaving ? 'Disabling...' : 'Yes, disable'}
                </button>
                <button className="otp-cancel-btn" onClick={() => setShowDisableConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {!otpEnabled && !showDisableConfirm && (
            <div className="otp-info-box">
              <span style={{ flexShrink: 0 }}>🛡</span>
              <span>Two-step verification adds an extra layer of security. After entering your password, a 6-digit code will be sent to your registered email. You can trust your device for 30 days so you won't be asked every time.</span>
            </div>
          )}
        </div>

      </div>
    </>
  )
}