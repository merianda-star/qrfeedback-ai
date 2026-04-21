'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 'welcome' | 'business-name' | 'business-type' | 'logo' | 'done'

const BUSINESS_TYPES = [
  { value: 'restaurant', icon: '🍽', label: 'Restaurant' },
  { value: 'retail', icon: '🛍', label: 'Retail' },
  { value: 'healthcare', icon: '🏥', label: 'Healthcare' },
  { value: 'services', icon: '💼', label: 'Services' },
  { value: 'other', icon: '⬡', label: 'Other' },
]

const STEPS: Step[] = ['welcome', 'business-name', 'business-type', 'logo', 'done']

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('welcome')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setUserName(user.user_metadata.full_name.split(' ')[0])
      else if (user?.email) setUserName(user.email.split('@')[0])
    })
  }, [])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function nextStep() {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  function prevStep() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  async function completeOnboarding() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let logoUrl = null

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      // ← FIX 1: timestamp in filename to bust browser/CDN cache
      const path = `${user.id}/logo_${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, logoFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        logoUrl = data.publicUrl
      }
    }

    const updates: Record<string, unknown> = {
      onboarding_completed: true,
      business_name: businessName || null,
      business_type: businessType || 'other',
    }
    if (logoUrl) updates.avatar_url = logoUrl

    await supabase.from('profiles').update(updates).eq('id', user.id)

    // ← FIX 2: tell sidebar to re-fetch profile so avatar appears immediately
    window.dispatchEvent(new Event('profileUpdated'))

    setSaving(false)
    onComplete()
  }

  const stepIndex = STEPS.indexOf(step)
  const totalSteps = STEPS.length - 1
  const progressPct = step === 'done' ? 100 : Math.round((stepIndex / totalSteps) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .ob-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(42, 31, 29, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: ob-fade-in 0.3s ease;
        }
        @keyframes ob-fade-in { from { opacity: 0 } to { opacity: 1 } }

        .ob-card {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 520px;
          box-shadow: 0 24px 64px rgba(42,31,29,0.18);
          overflow: hidden;
          animation: ob-slide-up 0.35s ease;
        }
        @keyframes ob-slide-up {
          from { opacity: 0; transform: translateY(24px) }
          to { opacity: 1; transform: translateY(0) }
        }

        .ob-progress { height: 4px; background: #f0e4e0; }
        .ob-progress-fill {
          height: 100%; background: linear-gradient(90deg, #b05c52, #c4896a);
          border-radius: 0 2px 2px 0; transition: width 0.4s ease;
        }

        .ob-header {
          padding: 28px 32px 0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ob-step-indicator {
          font-size: 0.68rem; font-weight: 700; color: #b09490;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .ob-logo { font-family: 'DM Serif Display', serif; font-size: 0.9rem; color: #2a1f1d; }
        .ob-logo span { color: #b05c52; }

        .ob-body { padding: 28px 32px 24px; min-height: 280px; }

        .ob-welcome-icon { font-size: 3rem; margin-bottom: 16px; }
        .ob-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem; color: #2a1f1d; line-height: 1.2; margin-bottom: 10px;
        }
        .ob-sub { font-size: 0.85rem; color: #7a5a56; line-height: 1.6; margin-bottom: 0; }

        .ob-features { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .ob-feature {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 10px;
          background: #fdf6f4; border: 1px solid #e8d5cf;
        }
        .ob-feature-icon { font-size: 1.1rem; flex-shrink: 0; }
        .ob-feature-text { font-size: 0.78rem; color: #2a1f1d; font-weight: 500; }
        .ob-feature-sub { font-size: 0.68rem; color: #b09490; margin-top: 1px; }

        .ob-label {
          display: block; font-size: 0.7rem; font-weight: 700;
          color: #2a1f1d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .ob-input {
          width: 100%; padding: 12px 16px; border: 2px solid #e8d5cf;
          border-radius: 10px; font-size: 0.95rem; color: #2a1f1d;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s; background: #fdf6f4;
        }
        .ob-input:focus {
          outline: none; border-color: #b05c52;
          box-shadow: 0 0 0 4px rgba(176,92,82,0.08); background: #fff;
        }
        .ob-input-sub { font-size: 0.72rem; color: #b09490; margin-top: 6px; }

        .ob-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .ob-type-option {
          padding: 14px 10px; border-radius: 12px;
          border: 2px solid #e8d5cf; background: #fdf6f4;
          text-align: center; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .ob-type-option:hover { border-color: #d9c2bb; background: #fff; }
        .ob-type-option.selected { border-color: #b05c52; background: #f7ece9; }
        .ob-type-icon { font-size: 1.5rem; margin-bottom: 6px; }
        .ob-type-label { font-size: 0.78rem; font-weight: 600; color: #2a1f1d; }

        .ob-upload-zone {
          border: 2px dashed #e8d5cf; border-radius: 14px;
          padding: 32px; text-align: center; cursor: pointer;
          background: #fdf6f4; transition: all 0.2s;
        }
        .ob-upload-zone:hover { border-color: #b05c52; background: #f7ece9; }
        .ob-upload-icon { font-size: 2rem; margin-bottom: 10px; }
        .ob-upload-title { font-size: 0.85rem; font-weight: 600; color: #2a1f1d; margin-bottom: 4px; }
        .ob-upload-sub { font-size: 0.72rem; color: #b09490; }
        .ob-logo-preview {
          width: 100px; height: 100px; border-radius: 50%;
          object-fit: cover; border: 3px solid #e8d5cf;
          margin: 0 auto 12px; display: block;
        }
        .ob-change-logo { font-size: 0.72rem; color: #b05c52; cursor: pointer; font-weight: 600; }
        .ob-change-logo:hover { text-decoration: underline; }

        .ob-done-icon { font-size: 3.5rem; margin-bottom: 16px; }
        .ob-done-checks { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; }
        .ob-done-check {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.8rem; color: #2a1f1d; font-weight: 500;
        }
        .ob-check-dot {
          width: 20px; height: 20px; border-radius: 50%;
          background: #edf4ef; border: 1.5px solid rgba(74,122,90,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; color: #4a7a5a; flex-shrink: 0;
        }

        .ob-footer {
          padding: 0 32px 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .ob-back-btn {
          padding: 10px 20px; border-radius: 10px;
          border: 1.5px solid #e8d5cf; background: transparent;
          font-size: 0.82rem; color: #7a5a56; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 600; transition: all 0.15s;
        }
        .ob-back-btn:hover { border-color: #d9c2bb; color: #2a1f1d; }
        .ob-next-btn {
          flex: 1; padding: 12px 24px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #b05c52, #c4896a);
          color: #fff; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(176,92,82,0.25);
        }
        .ob-next-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(176,92,82,0.3); }
        .ob-next-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="ob-overlay">
        <div className="ob-card">

          <div className="ob-progress">
            <div className="ob-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="ob-header">
            <div className="ob-logo">QRFeedback<span>.ai</span></div>
            {step !== 'welcome' && step !== 'done' && (
              <div className="ob-step-indicator">Step {stepIndex} of {totalSteps - 1}</div>
            )}
          </div>

          <div className="ob-body">

            {step === 'welcome' && (
              <div>
                <div className="ob-welcome-icon">👋</div>
                <div className="ob-title">{userName ? `Welcome, ${userName}!` : 'Welcome aboard!'}</div>
                <div className="ob-sub">Let's get your account set up in under a minute. Here's what QRFeedback.ai does for your business:</div>
                <div className="ob-features">
                  <div className="ob-feature">
                    <div className="ob-feature-icon">📱</div>
                    <div>
                      <div className="ob-feature-text">QR Code Feedback Collection</div>
                      <div className="ob-feature-sub">Customers scan, rate, and review in seconds</div>
                    </div>
                  </div>
                  <div className="ob-feature">
                    <div className="ob-feature-icon">🛡</div>
                    <div>
                      <div className="ob-feature-text">Review Shield</div>
                      <div className="ob-feature-sub">Happy customers go to Google, complaints stay private</div>
                    </div>
                  </div>
                  <div className="ob-feature">
                    <div className="ob-feature-icon">📊</div>
                    <div>
                      <div className="ob-feature-text">Analytics & AI Insights</div>
                      <div className="ob-feature-sub">Understand trends and improve your business</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'business-name' && (
              <div>
                <div className="ob-title">What's your business called?</div>
                <div className="ob-sub" style={{ marginBottom: 20 }}>This will appear on your dashboard and QR codes.</div>
                <label className="ob-label">Business Name</label>
                <input
                  className="ob-input" type="text" placeholder="e.g. Alok's Cafe"
                  value={businessName} onChange={e => setBusinessName(e.target.value)} autoFocus
                />
                <div className="ob-input-sub">You can change this later in your profile settings.</div>
              </div>
            )}

            {step === 'business-type' && (
              <div>
                <div className="ob-title">What type of business?</div>
                <div className="ob-sub" style={{ marginBottom: 20 }}>We'll load the right feedback questions for your industry.</div>
                <div className="ob-type-grid">
                  {BUSINESS_TYPES.map(bt => (
                    <div
                      key={bt.value}
                      className={`ob-type-option ${businessType === bt.value ? 'selected' : ''}`}
                      onClick={() => setBusinessType(bt.value)}
                    >
                      <div className="ob-type-icon">{bt.icon}</div>
                      <div className="ob-type-label">{bt.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'logo' && (
              <div>
                <div className="ob-title">Add your logo</div>
                <div className="ob-sub" style={{ marginBottom: 20 }}>Upload your business logo or profile photo. This is optional.</div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                {logoPreview ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={logoPreview} className="ob-logo-preview" alt="Logo preview" />
                    <div className="ob-change-logo" onClick={() => fileInputRef.current?.click()}>Change photo</div>
                  </div>
                ) : (
                  <div className="ob-upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <div className="ob-upload-icon">🖼</div>
                    <div className="ob-upload-title">Click to upload</div>
                    <div className="ob-upload-sub">PNG, JPG up to 5MB</div>
                  </div>
                )}
              </div>
            )}

            {step === 'done' && (
              <div>
                <div className="ob-done-icon">🎉</div>
                <div className="ob-title">You're all set!</div>
                <div className="ob-sub">Your account is ready. Here's a quick tour of your dashboard to get you started.</div>
                <div className="ob-done-checks">
                  {[
                    'Create forms and generate QR codes',
                    'Collect customer feedback instantly',
                    'Route happy customers to Google Reviews',
                    'Track responses and analytics',
                    'Manage your survey questions',
                  ].map((item, i) => (
                    <div key={i} className="ob-done-check">
                      <div className="ob-check-dot">✓</div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="ob-footer">
            {step !== 'welcome' && step !== 'done' && (
              <button className="ob-back-btn" onClick={prevStep}>← Back</button>
            )}

            {step === 'welcome' && (
              <button className="ob-next-btn" onClick={nextStep}>Get Started →</button>
            )}
            {step === 'business-name' && (
              <button className="ob-next-btn" onClick={nextStep} disabled={!businessName.trim()}>Continue →</button>
            )}
            {step === 'business-type' && (
              <button className="ob-next-btn" onClick={nextStep} disabled={!businessType}>Continue →</button>
            )}
            {step === 'logo' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="ob-next-btn" onClick={nextStep}>
                  {logoFile ? 'Continue →' : 'Skip for now →'}
                </button>
              </div>
            )}
            {step === 'done' && (
              <button className="ob-next-btn" onClick={completeOnboarding} disabled={saving}>
                {saving ? 'Saving...' : 'Start Dashboard Tour →'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}