'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

type Question = {
  id: string
  question_text: string
  question_type: 'star' | 'yesno' | 'text' | 'choice'
  is_required: boolean
  is_preloaded: boolean
  position: number
  options: string[] | null
}

type FormData = {
  id: string
  title: string
  description: string
  review_mode: boolean
  redirect_on_positive: boolean
  google_review_url: string | null
  location_name: string | null
  user_id: string
  is_active: boolean
}

type Screen = 'rating' | 'survey' | 'consent' | 'clipboard' | 'email-capture' | 'thankyou-positive' | 'thankyou-negative' | 'not-found' | 'closed'

const STAR_LABELS = ['', 'Terrible 😞', 'Poor 😕', 'Average 😐', 'Great 😊', 'Amazing 🤩']

export default function FeedbackPage() {
  const params = useParams()
  const formId = params.id as string
  const supabase = createClient()

  const [formData, setFormData] = useState<FormData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>('rating')

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const [answers, setAnswers] = useState<Record<number, string | number | string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const [consent, setConsent] = useState<'yes' | 'no' | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const [customerEmail, setCustomerEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  const [ownerPlan, setOwnerPlan] = useState<string>('free')
  const [ownerBrand, setOwnerBrand] = useState<string>('')

  const isNeg = rating > 0 && rating < 4
  const negQuestion = questions.find(q => q.question_type === 'choice') || null
  const totalQs = isNeg && negQuestion ? questions.length + 1 : questions.length
  const answeredCount = Object.keys(answers).length
  const progressPct = questions.length > 0 ? Math.round((answeredCount / totalQs) * 100) : 0

  const requiredPositions = questions
    .map((q, i) => q.is_required ? i + 1 : null)
    .filter(Boolean) as number[]
  const negPos = isNeg && negQuestion ? questions.length + 1 : null
  const allRequiredPositions = negPos ? [...requiredPositions, negPos] : requiredPositions
  const allRequiredDone = allRequiredPositions.every(pos => {
    const val = answers[pos]
    if (Array.isArray(val)) return val.length > 0
    return val !== undefined && val !== ''
  })

  const textQuestion = questions.find(q => q.question_type === 'text')
  const textQPos = textQuestion ? questions.indexOf(textQuestion) + 1 : null
  const reviewText = textQPos ? (answers[textQPos] as string) || '' : ''

  useEffect(() => { loadForm() }, [formId])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function loadForm() {
    const { data, error } = await supabase
      .from('forms').select('*').eq('id', formId).single()

    if (error || !data) {
      setScreen('not-found')
      setLoading(false)
      return
    }

    setFormData(data)

    if (data.is_active === false) {
      setScreen('closed')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, business_name')
      .eq('id', data.user_id)
      .single()
    setOwnerPlan(profile?.plan || 'free')
    setOwnerBrand(profile?.business_name || '')

    const { data: qs } = await supabase
      .from('questions').select('*').eq('user_id', data.user_id).order('position')

    if (qs && qs.length > 0) setQuestions(qs)
    setLoading(false)
  }

  async function submitSurvey() {
    if (!formData || !allRequiredDone) return
    if (isNeg) { setScreen('email-capture'); return }

    setSubmitting(true)
    const { error } = await supabase.from('responses').insert({
      form_id: formId, user_id: formData.user_id, rating, answers,
      ai_processed: false, submitted_at: new Date().toISOString(),
    })
    setSubmitting(false)
    if (error) { console.error('Insert error:', error); return }
    if (formData.google_review_url) { setScreen('consent') }
    else { setScreen('thankyou-positive'); startCountdown() }
  }

  async function handleEmailSubmit() {
    if (!formData) return
    const emailToSave = customerEmail.trim()
    setSavingEmail(true)

    const { error } = await supabase.from('responses').insert({
      form_id: formId, user_id: formData.user_id, rating, answers,
      ai_processed: false, submitted_at: new Date().toISOString(),
      customer_email: emailToSave || null,
    })
    setSavingEmail(false)
    if (error) { console.error('Insert error:', error); return }

    fetch('/api/process-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form_id: formId, rating, answers }) }).catch(() => {})
    fetch('/api/alerts/negative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form_id: formId }) }).catch(() => {})

    setScreen('thankyou-negative')
    startCountdown()
  }

  function handleConsent(val: 'yes' | 'no') { setConsent(val) }
  function proceedToGoogle() {
    if (formData?.google_review_url) {
      setScreen('clipboard')
      if (reviewText) navigator.clipboard.writeText(reviewText).catch(() => {})
    }
  }
  function submitPrivate() { setScreen('thankyou-positive'); startCountdown() }
  function openGoogleReview() {
    if (formData?.google_review_url) window.location.href = formData.google_review_url
    else { setScreen('thankyou-positive'); startCountdown() }
  }
  function startCountdown() { setCountdown(5) }
  function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#07091a,#0d1b35,#0f1f3d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Loading...</div>
    </div>
  )

  if (screen === 'not-found') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#07091a,#0d1b35,#0f1f3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <div style={{ fontSize: '2.5rem' }}>🔍</div>
      <div style={{ color: '#fff', fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem' }}>Form not found</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textAlign: 'center' }}>This feedback link may have expired or been removed.</div>
    </div>
  )

  if (screen === 'closed') return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 80% 10%, rgba(196,137,106,0.1) 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, rgba(176,92,82,0.07) 0%, transparent 50%), #fdf6f4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', maxWidth: 400, width: '100%', border: '1px solid #e8d5cf', boxShadow: '0 8px 40px rgba(42,31,29,0.1)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f5f0ee', border: '2px solid #e8d5cf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px' }}>🔒</div>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', color: '#2a1f1d', marginBottom: 10 }}>This form is currently closed</div>
        <div style={{ fontSize: '0.8rem', color: '#b09490', lineHeight: 1.7 }}>
          {formData?.title ? <><strong style={{ color: '#7a5a56' }}>{formData.title}</strong> is not accepting feedback at this time.<br /></> : null}
          Please check back later or contact the business directly.
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: '0.65rem', color: '#b09490', letterSpacing: '0.3px' }}>
        Powered by QRFeedback<span style={{ color: '#b05c52' }}>.ai</span>
      </div>
    </div>
  )

  const starStr = rating > 0 ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #fdf6f4; --surface: #ffffff; --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --green: #4a7a5a; --green-soft: #edf4ef;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); min-height: 100vh; }
        .page-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 32px 20px 60px; background: radial-gradient(ellipse at 80% 10%, rgba(196,137,106,0.1) 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, rgba(176,92,82,0.07) 0%, transparent 50%), var(--bg); }
        .header { text-align: center; margin-bottom: 24px; }
        .header-logo { font-family: 'DM Serif Display', serif; font-size: 0.88rem; color: var(--text-soft); letter-spacing: 0.5px; margin-bottom: 14px; }
        .header-logo span { color: var(--rose); }
        .header-biz-brand { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); letter-spacing: 0.3px; margin-bottom: 14px; }
        .biz-name { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: var(--text); margin-bottom: 4px; line-height: 1.2; }
        .biz-sub { font-size: 0.72rem; color: var(--text-soft); }
        .card { width: 100%; max-width: 440px; background: var(--surface); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 8px 40px rgba(42,31,29,0.1), 0 2px 8px rgba(42,31,29,0.06); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease both; }
        .rating-inner { padding: 28px 24px 24px; }
        .rating-biz-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--rose-soft); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 10px; }
        .rating-biz-name { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); text-align: center; margin-bottom: 3px; }
        .rating-biz-loc { font-size: 0.65rem; color: var(--text-soft); text-align: center; margin-bottom: 18px; }
        .rating-divider { height: 1px; background: var(--border); margin: 0 0 18px; }
        .rating-q { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); text-align: center; margin-bottom: 22px; line-height: 1.4; }
        .stars-wrap { display: flex; justify-content: center; gap: 8px; margin-bottom: 8px; }
        .star-btn { width: 52px; height: 52px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--bg); font-size: 1.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #d9c2bb; user-select: none; }
        .star-btn:hover { transform: scale(1.1); border-color: var(--terra); color: var(--terra); }
        .star-btn.lit { border-color: var(--terra); background: rgba(196,137,106,0.1); color: var(--terra); }
        .star-hint { text-align: center; font-size: 0.75rem; color: var(--text-soft); min-height: 22px; margin-bottom: 18px; font-weight: 600; transition: color 0.2s; }
        .star-hint.pos { color: var(--green); }
        .star-hint.neg { color: var(--rose); }
        .start-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; font-size: 0.88rem; font-weight: 700; cursor: pointer; background: var(--rose); color: #fff; font-family: inherit; box-shadow: 0 4px 14px rgba(176,92,82,0.28); transition: all 0.2s; }
        .start-btn:hover { background: var(--rose-dark); transform: translateY(-1px); }
        .survey-header { background: var(--surface); padding: 14px 18px 12px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
        .survey-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .survey-title { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); }
        .survey-badge { font-size: 0.6rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; border: 1px solid; }
        .survey-badge.pos { background: var(--green-soft); color: var(--green); border-color: rgba(74,122,90,0.25); }
        .survey-badge.neg { background: var(--rose-soft); color: var(--rose); border-color: rgba(176,92,82,0.2); }
        .survey-sub { font-size: 0.65rem; color: var(--text-soft); margin-bottom: 10px; }
        .progress-bar { height: 4px; background: var(--rose-soft); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--rose), var(--terra)); border-radius: 4px; transition: width 0.4s ease; }
        .progress-txt { font-size: 0.6rem; color: var(--text-soft); margin-top: 3px; }
        .survey-body { padding: 12px 14px 8px; max-height: 480px; overflow-y: auto; background: var(--bg); }
        .survey-body::-webkit-scrollbar { width: 3px; }
        .survey-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .q-card { background: var(--surface); border-radius: 10px; padding: 13px; border: 1.5px solid var(--border); margin-bottom: 10px; transition: border-color 0.2s; }
        .q-card.answered { border-color: rgba(74,122,90,0.35); background: #fafffe; }
        .q-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
        .q-num { font-size: 0.6rem; font-weight: 700; color: var(--rose); text-transform: uppercase; letter-spacing: 0.5px; }
        .q-tag { font-weight: 700; padding: 2px 7px; border-radius: 10px; font-size: 0.57rem; }
        .q-tag.required { background: var(--rose-soft); color: var(--rose); }
        .q-text { font-size: 0.78rem; font-weight: 600; color: var(--text); line-height: 1.45; margin-bottom: 10px; }
        .req-dot { color: var(--rose); margin-left: 2px; }
        .q-stars { display: flex; gap: 6px; margin-bottom: 4px; }
        .q-star { font-size: 1.4rem; cursor: pointer; color: var(--border-md); transition: all 0.14s; user-select: none; }
        .q-star.lit { color: var(--terra); }
        .q-star:hover { transform: scale(1.1); }
        .q-star-lbl { font-size: 0.62rem; color: var(--text-soft); min-height: 14px; font-weight: 500; }
        .mc-opts { display: flex; flex-direction: column; gap: 5px; }
        .mc-opt { padding: 8px 11px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 0.74rem; color: var(--text); cursor: pointer; transition: all 0.14s; background: var(--bg); display: flex; align-items: center; gap: 8px; }
        .mc-opt:hover { border-color: var(--rose); background: var(--rose-soft); }
        .mc-opt.selected { border-color: var(--rose); background: var(--rose-soft); color: var(--rose); font-weight: 600; }
        .mc-radio { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border-md); flex-shrink: 0; transition: all 0.14s; }
        .mc-opt.selected .mc-radio { border-color: var(--rose); background: var(--rose); }
        .mc-checkbox { width: 14px; height: 14px; border-radius: 3px; border: 2px solid var(--border-md); flex-shrink: 0; transition: all 0.14s; display: flex; align-items: center; justify-content: center; }
        .mc-opt.selected .mc-checkbox { border-color: var(--rose); background: var(--rose); }
        .mc-checkbox-tick { color: #fff; font-size: 0.55rem; font-weight: 900; display: none; }
        .mc-opt.selected .mc-checkbox-tick { display: block; }
        .mc-multi-hint { font-size: 0.6rem; color: var(--text-soft); margin-bottom: 6px; font-weight: 600; }
        .open-ta { width: 100%; background: var(--bg); border: 1.5px solid var(--border); border-radius: 9px; padding: 9px 10px; font-size: 0.74rem; color: var(--text); min-height: 64px; resize: none; font-family: inherit; line-height: 1.5; transition: border-color 0.2s; }
        .open-ta:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); }
        .open-ta::placeholder { color: var(--text-soft); }
        .survey-footer { padding: 10px 14px 14px; border-top: 1px solid var(--border); background: var(--surface); }
        .submit-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .submit-btn.ready { background: var(--rose); color: #fff; box-shadow: 0 4px 14px rgba(176,92,82,0.28); }
        .submit-btn.ready:hover { background: var(--rose-dark); transform: translateY(-1px); }
        .submit-btn.locked { background: var(--rose-soft); color: var(--text-soft); cursor: not-allowed; }
        .consent-inner { padding: 28px 22px 24px; }
        .consent-emoji { font-size: 3rem; text-align: center; margin-bottom: 12px; }
        .consent-title { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); text-align: center; margin-bottom: 6px; }
        .consent-sub { font-size: 0.75rem; color: var(--text-mid); text-align: center; line-height: 1.6; margin-bottom: 20px; }
        .consent-box { background: var(--rose-soft); border: 1.5px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .consent-q { font-size: 0.78rem; font-weight: 600; color: var(--text); line-height: 1.5; margin-bottom: 12px; }
        .copt { display: flex; align-items: center; gap: 10px; padding: 11px 13px; border-radius: 10px; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); font-size: 0.78rem; font-weight: 600; color: var(--text); transition: all 0.18s; margin-bottom: 8px; }
        .copt:last-child { margin-bottom: 0; }
        .copt:hover { border-color: var(--rose); background: var(--rose-soft); }
        .copt.sel-yes { border-color: var(--green); background: var(--green-soft); color: #2a5a3a; }
        .copt.sel-no { border-color: var(--border-md); background: var(--bg); color: var(--text-soft); }
        .cradio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
        .copt.sel-yes .cradio { border-color: var(--green); background: var(--green); }
        .copt.sel-no .cradio { border-color: var(--border-md); background: var(--border-md); }
        .cradio-dot { width: 7px; height: 7px; background: #fff; border-radius: 50%; display: none; }
        .copt.sel-yes .cradio-dot, .copt.sel-no .cradio-dot { display: block; }
        .action-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; margin-bottom: 8px; }
        .action-btn:last-child { margin-bottom: 0; }
        .btn-rose { background: var(--rose); color: #fff; box-shadow: 0 4px 14px rgba(176,92,82,0.28); }
        .btn-rose:hover { background: var(--rose-dark); transform: translateY(-1px); }
        .btn-outline { background: var(--surface); color: var(--text-mid); border: 1.5px solid var(--border); }
        .btn-outline:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .clipboard-inner { padding: 28px 22px 24px; }
        .clip-emoji { font-size: 3rem; text-align: center; margin-bottom: 10px; }
        .clip-badge { display: block; text-align: center; margin: 0 auto 12px; width: fit-content; background: var(--green-soft); border: 1px solid rgba(74,122,90,0.25); color: var(--green); padding: 4px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
        .clip-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); text-align: center; margin-bottom: 6px; }
        .clip-sub { font-size: 0.73rem; color: var(--text-mid); text-align: center; line-height: 1.55; margin-bottom: 16px; }
        .clip-box { background: var(--green-soft); border: 1px solid rgba(74,122,90,0.2); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; position: relative; }
        .clip-lbl { font-size: 0.6rem; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
        .clip-stars { font-size: 0.9rem; color: var(--terra); margin-bottom: 3px; }
        .clip-text { font-size: 0.74rem; color: var(--text); line-height: 1.5; font-style: italic; }
        .clip-check { position: absolute; top: 10px; right: 12px; font-size: 0.85rem; color: var(--green); }
        .google-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; background: #4285f4; color: #fff; font-size: 0.86rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(66,133,244,0.35); transition: all 0.2s; font-family: inherit; }
        .google-btn:hover { background: #3574e2; transform: translateY(-1px); }
        .g-icon { width: 22px; height: 22px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.74rem; font-weight: 900; color: #4285f4; flex-shrink: 0; }
        .paste-hint { margin-top: 10px; background: #fdf6e8; border: 1px solid #e8d5a0; border-radius: 10px; padding: 9px 12px; font-size: 0.7rem; color: #7a5a20; line-height: 1.5; display: flex; gap: 8px; }
        .email-capture-inner { padding: 28px 22px 28px; }
        .ec-icon { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--rose-soft), #fde8e8); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 16px; }
        .ec-title { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: var(--text); text-align: center; margin-bottom: 6px; line-height: 1.35; }
        .ec-sub { font-size: 0.76rem; color: var(--text-mid); text-align: center; line-height: 1.65; margin-bottom: 22px; }
        .ec-input-wrap { margin-bottom: 10px; }
        .ec-input-label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
        .ec-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 0.86rem; color: var(--text); font-family: inherit; background: var(--bg); outline: none; transition: all 0.2s; }
        .ec-input:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.08); background: #fff; }
        .ec-input::placeholder { color: var(--text-soft); }
        .ec-assurance { background: #f0f8f4; border: 1px solid rgba(74,122,90,0.2); border-radius: 10px; padding: 10px 13px; margin-bottom: 18px; display: flex; gap: 10px; align-items: flex-start; }
        .ec-assurance-icon { font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }
        .ec-assurance-text { font-size: 0.71rem; color: #3a6a4a; line-height: 1.55; }
        .ec-submit { width: 100%; padding: 13px; border-radius: 10px; border: none; font-size: 0.88rem; font-weight: 700; cursor: pointer; background: var(--rose); color: #fff; font-family: inherit; box-shadow: 0 4px 14px rgba(176,92,82,0.25); transition: all 0.2s; margin-bottom: 10px; }
        .ec-submit:hover:not(:disabled) { background: var(--rose-dark); transform: translateY(-1px); }
        .ec-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .ec-skip { width: 100%; padding: 10px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; font-size: 0.82rem; font-weight: 600; color: var(--text-soft); cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .ec-skip:hover { border-color: var(--border-md); color: var(--text-mid); }
        .ty-inner { padding: 44px 24px; text-align: center; }
        .ty-ring { width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 20px; }
        .ty-ring.green { background: linear-gradient(135deg, var(--green), #5a9a6a); box-shadow: 0 8px 24px rgba(74,122,90,0.3); }
        .ty-ring.amber { background: linear-gradient(135deg, var(--terra), var(--rose)); box-shadow: 0 8px 24px rgba(196,137,106,0.3); }
        .ty-title { font-family: 'DM Serif Display', serif; font-size: 1.15rem; color: var(--text); margin-bottom: 10px; line-height: 1.35; }
        .ty-sub { font-size: 0.75rem; color: var(--text-mid); line-height: 1.65; margin-bottom: 18px; }
        .ty-countdown { font-size: 0.72rem; color: var(--text-soft); }
        .powered-by { margin-top: 24px; font-size: 0.65rem; color: var(--text-soft); text-align: center; letter-spacing: 0.3px; }
        .powered-by span { color: var(--rose); }
      `}</style>

      <div className="page-wrap">
        <div className="header">
          {ownerPlan === 'free' && <div className="header-logo">QRFeedback<span>.ai</span></div>}
          {ownerPlan === 'pro' && <div style={{ marginBottom: 14 }} />}
          {ownerPlan === 'business' && <div className="header-biz-brand">{ownerBrand || formData?.title || ''}</div>}
          {formData && (
            <>
              <div className="biz-name">{formData.title}</div>
              {formData.location_name && <div className="biz-sub">{formData.location_name}</div>}
            </>
          )}
        </div>

        <div className="card">
          {screen === 'rating' && (
            <div className="rating-inner fade-up">
              <div className="rating-biz-icon">🏢</div>
              <div className="rating-biz-name">{formData?.title}</div>
              {formData?.location_name && <div className="rating-biz-loc">{formData.location_name}</div>}
              <div className="rating-divider"></div>
              <div className="rating-q">How would you rate your overall experience?</div>
              <div className="stars-wrap">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} className={`star-btn ${(hoverRating || rating) >= n ? 'lit' : ''}`} onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}>★</button>
                ))}
              </div>
              <div className={`star-hint ${rating >= 4 ? 'pos' : rating > 0 ? 'neg' : ''}`}>
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''} — ${STAR_LABELS[rating]}` : 'Tap a star to rate your experience'}
              </div>
              {rating > 0 && (
                <button className="start-btn" onClick={() => setScreen('survey')}>
                  {rating >= 4 ? 'Start Survey →' : 'Continue to Survey →'}
                </button>
              )}
            </div>
          )}

          {screen === 'survey' && (
            <div className="fade-up">
              <div className="survey-header">
                <div className="survey-top">
                  <div className="survey-title">Quick Survey</div>
                  <span className={`survey-badge ${isNeg ? 'neg' : 'pos'}`}>{isNeg ? '🔒 Private Survey' : '⭐ Share Your Experience'}</span>
                </div>
                <div className="survey-sub">{isNeg ? 'Your answers are kept private and help us improve.' : 'Your answers help us keep delivering great experiences.'}</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%` }}></div></div>
                <div className="progress-txt">{answeredCount} of {totalQs} answered</div>
              </div>
              <div className="survey-body">
                {questions.map((q, idx) => {
                  const pos = idx + 1
                  const answered = answers[pos] !== undefined && answers[pos] !== ''
                  return (
                    <div key={q.id} className={`q-card ${answered ? 'answered' : ''}`}>
                      <div className="q-meta">
                        <div className="q-num">Q{pos}</div>
                        <div>{q.is_required && <span className="q-tag required">Required</span>}</div>
                      </div>
                      <div className="q-text">{q.question_text}{q.is_required && <span className="req-dot">*</span>}</div>
                      {q.question_type === 'star' && (
                        <>
                          <div className="q-stars">{[1,2,3,4,5].map(n => (<span key={n} className={`q-star ${(answers[pos] as number) >= n ? 'lit' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, [pos]: n }))}>★</span>))}</div>
                          <div className="q-star-lbl">{answers[pos] ? ['','Terrible','Poor','Average','Good','Excellent'][answers[pos] as number] : ''}</div>
                        </>
                      )}
                      {q.question_type === 'text' && (<textarea className="open-ta" placeholder="Share your thoughts..." value={(answers[pos] as string) || ''} onChange={e => setAnswers(prev => ({ ...prev, [pos]: e.target.value }))} />)}
                      {q.question_type === 'yesno' && (
                        <div className="mc-opts">
                          {['Yes', 'No'].map(opt => (<div key={opt} className={`mc-opt ${answers[pos] === opt ? 'selected' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, [pos]: opt }))}><div className="mc-radio"></div>{opt}</div>))}
                        </div>
                      )}
                      {q.question_type === 'choice' && q.options && (
                        <div className="mc-opts">
                          <div className="mc-multi-hint">Select all that apply</div>
                          {q.options.map((opt, i) => {
                            const curVal = answers[pos]
                            const selected = Array.isArray(curVal) ? curVal.includes(opt) : curVal === opt
                            return (
                              <div key={i} className={`mc-opt ${selected ? 'selected' : ''}`} onClick={() => {
                                setAnswers(prev => {
                                  const cur = Array.isArray(prev[pos]) ? (prev[pos] as string[]) : prev[pos] ? [prev[pos] as string] : []
                                  const next = cur.includes(opt) ? cur.filter(v => v !== opt) : [...cur, opt]
                                  return { ...prev, [pos]: next }
                                })
                              }}>
                                <div className="mc-checkbox"><span className="mc-checkbox-tick">✓</span></div>{opt}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Hardcoded neg question — multi-select */}
                {isNeg && negQuestion && (
                  <div className={`q-card ${Array.isArray(answers[questions.length + 1]) && (answers[questions.length + 1] as string[]).length > 0 ? 'answered' : ''}`}>
                    <div className="q-meta">
                      <div className="q-num">Q{questions.length + 1}</div>
                      <div><span className="q-tag required">Required</span></div>
                    </div>
                    <div className="q-text">What was the main issue with your visit?<span className="req-dot">*</span></div>
                    <div className="mc-multi-hint">Select all that apply</div>
                    <div className="mc-opts">
                      {['Food quality', 'Wait time', 'Staff service', 'Cleanliness', 'Pricing / Value'].map((opt, i) => {
                        const curVal = answers[questions.length + 1]
                        const selected = Array.isArray(curVal) ? curVal.includes(opt) : curVal === opt
                        return (
                          <div key={i} className={`mc-opt ${selected ? 'selected' : ''}`} onClick={() => {
                            setAnswers(prev => {
                              const cur = Array.isArray(prev[questions.length + 1]) ? (prev[questions.length + 1] as string[]) : prev[questions.length + 1] ? [prev[questions.length + 1] as string] : []
                              const next = cur.includes(opt) ? cur.filter(v => v !== opt) : [...cur, opt]
                              return { ...prev, [questions.length + 1]: next }
                            })
                          }}>
                            <div className="mc-checkbox"><span className="mc-checkbox-tick">✓</span></div>{opt}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="survey-footer">
                <button className={`submit-btn ${allRequiredDone ? 'ready' : 'locked'}`} onClick={submitSurvey} disabled={!allRequiredDone || submitting}>
                  {submitting ? 'Submitting...' : 'Submit Survey →'}
                </button>
              </div>
            </div>
          )}

          {screen === 'email-capture' && (
            <div className="email-capture-inner fade-up">
              <div className="ec-icon">✉️</div>
              <div className="ec-title">Would you like us<br />to follow up with you?</div>
              <div className="ec-sub">Leave your email and we'll personally reach out to make things right. Completely optional.</div>
              <div className="ec-input-wrap">
                <label className="ec-input-label">Your Email Address</label>
                <input className="ec-input" type="email" placeholder="your@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && isValidEmail(customerEmail) && handleEmailSubmit()} autoFocus />
              </div>
              <div className="ec-assurance">
                <span className="ec-assurance-icon">🔒</span>
                <span className="ec-assurance-text">Your email is used <strong>only</strong> to follow up on your experience. We will never share it, sell it, or use it for marketing.</span>
              </div>
              <button className="ec-submit" onClick={handleEmailSubmit} disabled={savingEmail || (customerEmail.trim().length > 0 && !isValidEmail(customerEmail))}>
                {savingEmail ? 'Saving...' : customerEmail.trim() ? 'Submit & Let Us Follow Up →' : 'Submit Feedback →'}
              </button>
              <button className="ec-skip" onClick={() => { setCustomerEmail(''); handleEmailSubmit() }}>No thanks, skip this step</button>
            </div>
          )}

          {screen === 'consent' && (
            <div className="consent-inner fade-up">
              <div className="consent-emoji">🎉</div>
              <div className="consent-title">Thank you so much!</div>
              <div className="consent-sub">We're so glad you had a great experience. Would you like to share it on Google and help other customers find us?</div>
              <div className="consent-box">
                <div className="consent-q">Your reviews help us grow — would you like to leave the same review on Google?</div>
                <div className={`copt ${consent === 'yes' ? 'sel-yes' : ''}`} onClick={() => handleConsent('yes')}><div className="cradio"><div className="cradio-dot"></div></div><span>Yes, I'd love to leave a Google review</span></div>
                <div className={`copt ${consent === 'no' ? 'sel-no' : ''}`} onClick={() => handleConsent('no')}><div className="cradio"><div className="cradio-dot"></div></div><span>No, thank you</span></div>
              </div>
              {consent === 'yes' && <button className="action-btn btn-rose" onClick={proceedToGoogle}>Continue to Google Review →</button>}
              {consent === 'no' && <button className="action-btn btn-outline" onClick={submitPrivate}>Submit Privately</button>}
            </div>
          )}

          {screen === 'clipboard' && (
            <div className="clipboard-inner fade-up">
              <div className="clip-emoji">🎉</div>
              <span className="clip-badge">{rating} Stars — {STAR_LABELS[rating]}</span>
              <div className="clip-title">You're all set!</div>
              <div className="clip-sub">{reviewText ? 'Your review text has been copied. Open Google and paste in one tap.' : 'Tap the button below to open Google Reviews and leave your rating.'}</div>
              {reviewText && (
                <div className="clip-box">
                  <div className="clip-lbl">📋 Copied to clipboard</div>
                  <div className="clip-stars">{starStr}</div>
                  <div className="clip-text">"{reviewText}"</div>
                  <div className="clip-check">✓</div>
                </div>
              )}
              <button className="google-btn" onClick={openGoogleReview}><div className="g-icon">G</div>Open Google & Leave Review</button>
              {reviewText && (
                <div className="paste-hint">
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
                  <span>Stars are <b>pre-filled</b>. Your review is <b>already copied</b> — just tap the box and paste!</span>
                </div>
              )}
            </div>
          )}

          {screen === 'thankyou-positive' && (
            <div className="ty-inner fade-up">
              <div className="ty-ring green">😊</div>
              <div className="ty-title">Thank you for your review<br />and valuable time!</div>
              <div className="ty-sub">Please visit us again soon! We hope to see you back very soon. 😊</div>
              <div className="ty-countdown">{countdown !== null && countdown > 0 ? `Closing in ${countdown} second${countdown !== 1 ? 's' : ''}...` : countdown === 0 ? 'You can now close this tab ✓' : ''}</div>
            </div>
          )}

          {screen === 'thankyou-negative' && (
            <div className="ty-inner fade-up">
              <div className="ty-ring amber">🙏</div>
              <div className="ty-title">Thank you for your<br />valuable feedback!</div>
              <div className="ty-sub">{customerEmail ? `We've noted your feedback and will follow up at ${customerEmail}. We hope to do better next time. 🙏` : 'We will note down your suggestion and work on it. We hope to do better next time. 🙏'}</div>
              <div className="ty-countdown">{countdown !== null && countdown > 0 ? `Closing in ${countdown} second${countdown !== 1 ? 's' : ''}...` : countdown === 0 ? 'You can now close this tab ✓' : ''}</div>
            </div>
          )}
        </div>

        {ownerPlan === 'free' && (
          <div className="powered-by">Powered by QRFeedback<span>.ai</span></div>
        )}
      </div>
    </>
  )
}