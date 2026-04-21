'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type QuestionType = 'star' | 'yesno' | 'text' | 'choice'

type Question = {
  id: string
  user_id: string
  question_text: string
  question_type: QuestionType
  is_required: boolean
  is_preloaded: boolean
  position: number
  options: string[] | null
}

const PRELOADED_SETS: Record<string, { text: string; type: QuestionType; required: boolean }[]> = {
  restaurant: [
    { text: 'How would you rate the overall food quality?', type: 'star', required: true },
    { text: 'How satisfied were you with the speed of service?', type: 'star', required: true },
    { text: 'How would you rate the friendliness of our staff?', type: 'star', required: false },
    { text: 'How clean was the restaurant during your visit?', type: 'star', required: false },
    { text: 'How likely are you to visit us again?', type: 'star', required: false },
    { text: 'What did you like the most about our restaurant?', type: 'choice', required: false },
    { text: 'What did you enjoy most about your visit today?', type: 'text', required: false },
    { text: 'Is there anything specific we could have done better?', type: 'text', required: false },
  ],
  retail: [
    { text: 'How would you rate the overall shopping experience?', type: 'star', required: true },
    { text: 'How satisfied were you with our product range?', type: 'star', required: true },
    { text: 'How helpful were our staff members?', type: 'star', required: false },
    { text: 'How would you rate the store layout and organisation?', type: 'star', required: false },
    { text: 'How smooth was your checkout experience?', type: 'star', required: false },
    { text: 'What did you like the most about our store?', type: 'choice', required: false },
    { text: 'What did you enjoy most about your visit?', type: 'text', required: false },
    { text: 'Is there anything we could improve in our store?', type: 'text', required: false },
  ],
  healthcare: [
    { text: 'How would you rate your overall experience with us?', type: 'star', required: true },
    { text: 'How satisfied were you with the wait time?', type: 'star', required: true },
    { text: 'How would you rate the friendliness of our staff?', type: 'star', required: false },
    { text: 'How clean and comfortable was our facility?', type: 'star', required: false },
    { text: 'How clearly did we explain your treatment or service?', type: 'star', required: false },
    { text: 'What did you like the most about your visit?', type: 'choice', required: false },
    { text: 'What did we do well during your visit?', type: 'text', required: false },
    { text: 'Is there anything we could do to improve your experience?', type: 'text', required: false },
  ],
  services: [
    { text: 'How would you rate our overall service quality?', type: 'star', required: true },
    { text: 'How satisfied were you with our professionalism?', type: 'star', required: true },
    { text: 'How would you rate our communication throughout?', type: 'star', required: false },
    { text: 'How would you rate the value for money?', type: 'star', required: false },
    { text: 'Did we complete the work on time?', type: 'yesno', required: false },
    { text: 'What did you like the most about our service?', type: 'choice', required: false },
    { text: 'What did we do particularly well?', type: 'text', required: false },
    { text: 'Is there anything we could have done differently?', type: 'text', required: false },
  ],
  other: [
    { text: 'How would you rate your overall experience?', type: 'star', required: true },
    { text: 'How satisfied were you with the quality of our service?', type: 'star', required: true },
    { text: 'How friendly and helpful was our team?', type: 'star', required: false },
    { text: 'How would you rate the value for money?', type: 'star', required: false },
    { text: 'How likely are you to return?', type: 'star', required: false },
    { text: 'What did you like the most about your experience?', type: 'choice', required: false },
    { text: 'What did you enjoy most about your experience?', type: 'text', required: false },
    { text: 'What could we do better next time?', type: 'text', required: false },
  ],
}

const TYPE_LABELS: Record<QuestionType, string> = {
  star: '⭐ Star Rating',
  yesno: '✓✗ Yes / No',
  text: '✎ Open Text',
  choice: '☰ Multiple Choice',
}

const TYPE_COLORS: Record<QuestionType, string> = {
  star: '#c4896a',
  yesno: '#4a7a5a',
  text: '#7a5a9a',
  choice: '#5a7aaa',
}

export default function QuestionsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [businessType, setBusinessType] = useState('other')
  const [userId, setUserId] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editRequired, setEditRequired] = useState(false)
  const [editOptions, setEditOptions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Add question
  const [showAddForm, setShowAddForm] = useState(false)
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState<QuestionType>('star')
  const [newRequired, setNewRequired] = useState(false)
  const [newOptions, setNewOptions] = useState(['', ''])
  const [adding, setAdding] = useState(false)

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_type')
      .eq('id', user.id)
      .single()

    const bType = profile?.business_type || 'other'
    setBusinessType(bType)

    const { data: existing } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', user.id)
      .order('position')

    if (!existing || existing.length === 0) {
      // Seed preloaded questions for this business type
      await seedPreloaded(user.id, bType)
    } else {
      setQuestions(existing)
    }
    setLoading(false)
  }

  async function seedPreloaded(uid: string, bType: string) {
    const set = PRELOADED_SETS[bType] || PRELOADED_SETS.other
    const defaultOptions: Record<string, string[]> = {
      restaurant: ['Food quality', 'Ambiance', 'Staff service', 'Value for money', 'Speed of service'],
      retail: ['Product range', 'Staff helpfulness', 'Store layout', 'Pricing', 'Checkout experience'],
      healthcare: ['Staff friendliness', 'Cleanliness', 'Wait time', 'Treatment quality', 'Communication'],
      services: ['Professionalism', 'Communication', 'Value for money', 'Timeliness', 'Quality of work'],
      other: ['Quality of service', 'Staff friendliness', 'Value for money', 'Cleanliness', 'Overall experience'],
    }
    const rows = set.map((q, i) => ({
      user_id: uid,
      question_text: q.text,
      question_type: q.type,
      is_required: q.required,
      is_preloaded: true,
      position: i + 1,
      options: q.type === 'choice' ? (defaultOptions[bType] || defaultOptions.other) : null,
    }))
    const { data } = await supabase.from('questions').insert(rows).select()
    if (data) setQuestions(data)
  }

  async function saveEdit(q: Question) {
    setSaving(true)
    const updates: Partial<Question> = {
      question_text: editText,
      is_required: editRequired,
    }
    if (q.question_type === 'choice') {
      updates.options = editOptions.filter(o => o.trim() !== '')
    }
    await supabase.from('questions').update(updates).eq('id', q.id)
    setQuestions(prev => prev.map(item =>
      item.id === q.id ? { ...item, ...updates } : item
    ))
    setSaving(false)
    setEditingId(null)
  }

  function startEdit(q: Question) {
    setEditingId(q.id)
    setEditText(q.question_text)
    setEditRequired(q.is_required)
    setEditOptions(q.options || ['', ''])
  }

  async function addQuestion() {
    if (!newText.trim()) return
    setAdding(true)
    const position = questions.length + 1
    const opts = newType === 'choice' ? newOptions.filter(o => o.trim() !== '') : null
    const { data } = await supabase.from('questions').insert({
      user_id: userId,
      question_text: newText,
      question_type: newType,
      is_required: newRequired,
      is_preloaded: false,
      position,
      options: opts,
    }).select().single()
    if (data) setQuestions(prev => [...prev, data])
    setAdding(false)
    setShowAddForm(false)
    setNewText(''); setNewType('star'); setNewRequired(false); setNewOptions(['', ''])
  }

  async function deleteQuestion(id: string) {
    await supabase.from('questions').delete().eq('id', id)
    setQuestions(prev => prev.filter(q => q.id !== id))
    setDeletingId(null)
  }

  async function changeBusinessType(bType: string) {
    setBusinessType(bType)
    // Update profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ business_type: bType }).eq('id', user.id)
    // Delete existing preloaded and re-seed
    await supabase.from('questions').delete().eq('user_id', user.id).eq('is_preloaded', true)
    const set = PRELOADED_SETS[bType] || PRELOADED_SETS.other
    const defaultOptions: Record<string, string[]> = {
      restaurant: ['Food quality', 'Ambiance', 'Staff service', 'Value for money', 'Speed of service'],
      retail: ['Product range', 'Staff helpfulness', 'Store layout', 'Pricing', 'Checkout experience'],
      healthcare: ['Staff friendliness', 'Cleanliness', 'Wait time', 'Treatment quality', 'Communication'],
      services: ['Professionalism', 'Communication', 'Value for money', 'Timeliness', 'Quality of work'],
      other: ['Quality of service', 'Staff friendliness', 'Value for money', 'Cleanliness', 'Overall experience'],
    }
    const rows = set.map((q, i) => ({
      user_id: user.id,
      question_text: q.text,
      question_type: q.type,
      is_required: q.required,
      is_preloaded: true,
      position: i + 1,
      options: q.type === 'choice' ? (defaultOptions[bType] || defaultOptions.other) : null,
    }))
    const { data } = await supabase.from('questions').insert(rows).select()
    const custom = questions.filter(q => !q.is_preloaded)
    if (data) setQuestions([...data, ...custom])
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading questions...</div>
    </div>
  )

  const preloaded = questions.filter(q => q.is_preloaded)
  const custom = questions.filter(q => !q.is_preloaded)

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
        .q-page { max-width: 820px; }

        /* Top bar */
        .q-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .q-topbar-left h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem; color: var(--text); margin-bottom: 3px;
        }
        .q-topbar-left p { font-size: 0.75rem; color: var(--text-soft); }
        .add-btn {
          padding: 9px 20px; border-radius: 8px; border: none;
          background: var(--rose); color: #fff;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 2px 8px rgba(176,92,82,0.2); transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .add-btn:hover { background: var(--rose-dark); transform: translateY(-1px); }

        /* Business type switcher */
        .btype-bar {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }
        .btype-label { font-size: 0.72rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
        .btype-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .btype-pill {
          padding: 5px 14px; border-radius: 20px; border: 1.5px solid var(--border);
          font-size: 0.75rem; font-weight: 600; cursor: pointer;
          background: var(--bg); color: var(--text-mid);
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .btype-pill:hover { border-color: var(--rose); color: var(--rose); }
        .btype-pill.active { background: var(--rose-soft); border-color: var(--rose); color: var(--rose); }
        .btype-note { font-size: 0.68rem; color: var(--text-soft); margin-left: auto; font-style: italic; }

        /* Section header */
        .section-hdr {
          display: flex; align-items: center; gap: 10px;
          margin: 20px 0 10px;
        }
        .section-hdr-title {
          font-size: 0.7rem; font-weight: 700; color: var(--text-soft);
          text-transform: uppercase; letter-spacing: 1.5px;
        }
        .section-hdr-line { flex: 1; height: 1px; background: var(--border); }
        .section-hdr-count {
          font-size: 0.62rem; font-weight: 700; padding: 2px 8px;
          border-radius: 20px; background: var(--rose-soft); color: var(--rose);
        }

        /* Question card */
        .q-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; margin-bottom: 8px; overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .q-card:hover { box-shadow: 0 2px 12px rgba(42,31,29,0.07); }
        .q-card-top {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px;
        }
        .q-position {
          width: 24px; height: 24px; border-radius: 6px;
          background: var(--rose-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: var(--rose);
          flex-shrink: 0; margin-top: 1px;
        }
        .q-body { flex: 1; min-width: 0; }
        .q-text {
          font-size: 0.85rem; font-weight: 600; color: var(--text);
          margin-bottom: 7px; line-height: 1.4;
        }
        .q-meta-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .q-type-badge {
          font-size: 0.62rem; font-weight: 700; padding: 2px 9px;
          border-radius: 20px; border: 1px solid;
        }
        .q-preloaded-badge {
          font-size: 0.62rem; font-weight: 700; padding: 2px 9px;
          border-radius: 20px; background: var(--rose-soft);
          color: var(--text-soft); border: 1px solid var(--border);
        }
        .q-custom-badge {
          font-size: 0.62rem; font-weight: 700; padding: 2px 9px;
          border-radius: 20px; background: #f0eeff;
          color: #7a5a9a; border: 1px solid #d8ccf0;
        }
        .q-required-badge {
          font-size: 0.62rem; font-weight: 700; padding: 2px 9px;
          border-radius: 20px; background: var(--rose-soft);
          color: var(--rose); border: 1px solid var(--border);
        }
        .q-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .q-action-btn {
          padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border);
          background: var(--bg); font-size: 0.72rem; font-weight: 600;
          cursor: pointer; color: var(--text-mid); font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .q-action-btn:hover { border-color: var(--border-md); color: var(--text); background: var(--rose-soft); }
        .q-action-btn.delete:hover { border-color: var(--rose); color: var(--rose); }

        /* Edit panel */
        .q-edit-panel {
          border-top: 1px solid var(--border); padding: 14px 16px;
          background: var(--bg);
        }
        .edit-label {
          font-size: 0.68rem; font-weight: 700; color: var(--text);
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;
        }
        .edit-input, .edit-textarea {
          width: 100%; padding: 8px 11px; border: 1.5px solid var(--border);
          border-radius: 8px; font-size: 0.83rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; background: var(--surface);
          transition: all 0.2s; margin-bottom: 12px;
        }
        .edit-input:focus, .edit-textarea:focus {
          outline: none; border-color: var(--rose);
          box-shadow: 0 0 0 3px rgba(176,92,82,0.07);
        }
        .edit-textarea { resize: vertical; min-height: 60px; line-height: 1.5; }
        .edit-footer { display: flex; align-items: center; gap: 10px; }
        .edit-toggle-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .edit-toggle-label { font-size: 0.78rem; color: var(--text-mid); font-weight: 500; }
        .vic-toggle { position: relative; width: 36px; height: 19px; flex-shrink: 0; }
        .vic-toggle input { opacity: 0; width: 0; height: 0; }
        .vic-toggle-track {
          position: absolute; inset: 0; cursor: pointer;
          background: #ddd0cc; border-radius: 19px; transition: all 0.25s;
        }
        .vic-toggle input:checked + .vic-toggle-track { background: var(--rose); }
        .vic-toggle-track::after {
          content: ''; position: absolute; left: 2px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; background: #fff; border-radius: 50%;
          transition: all 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .vic-toggle input:checked + .vic-toggle-track::after { left: calc(100% - 17px); }
        .save-edit-btn {
          padding: 7px 18px; border-radius: 7px; border: none;
          background: var(--rose); color: #fff;
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .save-edit-btn:hover { background: var(--rose-dark); }
        .cancel-edit-btn {
          padding: 7px 14px; border-radius: 7px;
          border: 1px solid var(--border); background: transparent;
          font-size: 0.78rem; color: var(--text-mid); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .cancel-edit-btn:hover { border-color: var(--border-md); color: var(--text); }

        /* Options editor */
        .options-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .option-row { display: flex; gap: 6px; align-items: center; }
        .option-input {
          flex: 1; padding: 7px 10px; border: 1.5px solid var(--border);
          border-radius: 7px; font-size: 0.78rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; background: var(--surface); transition: all 0.2s;
        }
        .option-input:focus { outline: none; border-color: var(--rose); }
        .option-remove {
          width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--border);
          background: var(--bg); color: var(--text-soft); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; transition: all 0.15s; flex-shrink: 0;
        }
        .option-remove:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .add-option-btn {
          font-size: 0.72rem; color: var(--rose); cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif;
          font-weight: 600; padding: 0; margin-bottom: 12px;
        }
        .add-option-btn:hover { text-decoration: underline; }

        /* Add form card */
        .add-form-card {
          background: var(--surface); border: 1.5px dashed var(--border-md);
          border-radius: 10px; padding: 20px; margin-top: 10px;
        }
        .add-form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 0.9rem; color: var(--text); margin-bottom: 14px;
        }
        .type-select-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 14px; }
        .type-option {
          padding: 8px 6px; border-radius: 8px; border: 1.5px solid var(--border);
          text-align: center; cursor: pointer; background: var(--bg);
          font-size: 0.7rem; font-weight: 600; color: var(--text-mid);
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .type-option:hover { border-color: var(--border-md); }
        .type-option.selected { background: var(--rose-soft); border-color: var(--rose); color: var(--rose); }
        .type-option-icon { font-size: 1rem; margin-bottom: 3px; }
        .form-label {
          display: block; font-size: 0.68rem; font-weight: 700; color: var(--text);
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
        }
        .form-input, .form-textarea {
          width: 100%; padding: 9px 12px; border: 1.5px solid var(--border);
          border-radius: 8px; font-size: 0.84rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; background: var(--bg);
          transition: all 0.2s; margin-bottom: 12px;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none; border-color: var(--rose);
          box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff;
        }
        .form-textarea { resize: vertical; min-height: 60px; line-height: 1.5; }
        .add-form-footer { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
        .primary-btn {
          padding: 9px 22px; border-radius: 8px; border: none;
          background: var(--rose); color: #fff;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .primary-btn:hover:not(:disabled) { background: var(--rose-dark); }
        .primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .ghost-btn {
          padding: 9px 16px; border-radius: 8px;
          border: 1px solid var(--border); background: transparent;
          font-size: 0.82rem; color: var(--text-mid); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .ghost-btn:hover { border-color: var(--border-md); color: var(--text); }

        /* Delete confirm */
        .delete-confirm {
          border-top: 1px solid var(--border); padding: 11px 16px;
          background: #fff5f4; display: flex; align-items: center;
          justify-content: space-between; gap: 10px;
        }
        .delete-confirm-text { font-size: 0.78rem; color: var(--rose); font-weight: 600; }
        .delete-confirm-actions { display: flex; gap: 7px; }
        .confirm-delete-btn {
          padding: 5px 14px; border-radius: 6px; border: none;
          background: var(--rose); color: #fff;
          font-size: 0.74rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .cancel-delete-btn {
          padding: 5px 12px; border-radius: 6px;
          border: 1px solid var(--border); background: transparent;
          font-size: 0.74rem; color: var(--text-mid); cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        /* Empty state */
        .empty-custom {
          border: 1.5px dashed var(--border); border-radius: 10px;
          padding: 28px; text-align: center;
        }
        .empty-custom-icon { font-size: 1.8rem; margin-bottom: 8px; }
        .empty-custom-title { font-size: 0.85rem; font-weight: 600; color: var(--text-mid); margin-bottom: 4px; }
        .empty-custom-sub { font-size: 0.74rem; color: var(--text-soft); }
      `}</style>

      <div className="q-page">

        {/* Top bar */}
        <div className="q-topbar">
          <div className="q-topbar-left">
            <h2>Survey Questions</h2>
            <p>Manage the questions customers see when they scan your QR code</p>
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            + Add Custom Question
          </button>
        </div>

        {/* Business type switcher */}
        <div className="btype-bar">
          <span className="btype-label">Business Type</span>
          <div className="btype-pills">
            {[
              { value: 'restaurant', label: '🍽 Restaurant' },
              { value: 'retail', label: '🛍 Retail' },
              { value: 'healthcare', label: '🏥 Healthcare' },
              { value: 'services', label: '💼 Services' },
              { value: 'other', label: '⬡ Other' },
            ].map(bt => (
              <button
                key={bt.value}
                className={`btype-pill ${businessType === bt.value ? 'active' : ''}`}
                onClick={() => changeBusinessType(bt.value)}
              >
                {bt.label}
              </button>
            ))}
          </div>
          <span className="btype-note">Changing type resets preloaded questions</span>
        </div>

        {/* Preloaded questions */}
        <div className="section-hdr">
          <div className="section-hdr-title">Preloaded Questions</div>
          <div className="section-hdr-line"></div>
          <div className="section-hdr-count">{preloaded.length}</div>
        </div>

        {preloaded.map((q, idx) => (
          <div key={q.id} className="q-card">
            <div className="q-card-top">
              <div className="q-position">{idx + 1}</div>
              <div className="q-body">
                {editingId === q.id ? (
                  <>
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={2}
                    />
                  </>
                ) : (
                  <div className="q-text">{q.question_text}</div>
                )}
                <div className="q-meta-row">
                  <span className="q-type-badge" style={{
                    background: `${TYPE_COLORS[q.question_type]}15`,
                    color: TYPE_COLORS[q.question_type],
                    borderColor: `${TYPE_COLORS[q.question_type]}30`,
                  }}>{TYPE_LABELS[q.question_type]}</span>
                  <span className="q-preloaded-badge">Preloaded</span>
                  {q.is_required && <span className="q-required-badge">Required</span>}
                </div>
              </div>
              <div className="q-actions">
                {editingId === q.id ? null : (
                  <button className="q-action-btn" onClick={() => startEdit(q)}>Edit</button>
                )}
              </div>
            </div>

            {editingId === q.id && (
              <div className="q-edit-panel">
                <div className="edit-toggle-row">
                  <label className="vic-toggle">
                    <input type="checkbox" checked={editRequired} onChange={e => setEditRequired(e.target.checked)} />
                    <span className="vic-toggle-track"></span>
                  </label>
                  <span className="edit-toggle-label">Mark as required</span>
                </div>
                <div className="edit-footer">
                  <button className="save-edit-btn" onClick={() => saveEdit(q)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="cancel-edit-btn" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Custom questions */}
        <div className="section-hdr">
          <div className="section-hdr-title">Custom Questions</div>
          <div className="section-hdr-line"></div>
          <div className="section-hdr-count">{custom.length}</div>
        </div>

        {custom.length === 0 && !showAddForm && (
          <div className="empty-custom">
            <div className="empty-custom-icon">◎</div>
            <div className="empty-custom-title">No custom questions yet</div>
            <div className="empty-custom-sub">Add questions specific to your business on top of the 8 preloaded ones</div>
          </div>
        )}

        {custom.map((q, idx) => (
          <div key={q.id} className="q-card">
            <div className="q-card-top">
              <div className="q-position" style={{ background: '#f0eeff', color: '#7a5a9a', borderColor: '#d8ccf0' }}>
                {preloaded.length + idx + 1}
              </div>
              <div className="q-body">
                {editingId === q.id ? (
                  <textarea
                    className="edit-textarea"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={2}
                  />
                ) : (
                  <div className="q-text">{q.question_text}</div>
                )}
                <div className="q-meta-row">
                  <span className="q-type-badge" style={{
                    background: `${TYPE_COLORS[q.question_type]}15`,
                    color: TYPE_COLORS[q.question_type],
                    borderColor: `${TYPE_COLORS[q.question_type]}30`,
                  }}>{TYPE_LABELS[q.question_type]}</span>
                  <span className="q-custom-badge">Custom</span>
                  {q.is_required && <span className="q-required-badge">Required</span>}
                  {q.options && q.options.length > 0 && (
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-soft)' }}>
                      {q.options.length} options
                    </span>
                  )}
                </div>
              </div>
              <div className="q-actions">
                {editingId !== q.id && (
                  <>
                    <button className="q-action-btn" onClick={() => startEdit(q)}>Edit</button>
                    <button className="q-action-btn delete" onClick={() => setDeletingId(q.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>

            {editingId === q.id && (
              <div className="q-edit-panel">
                {q.question_type === 'choice' && (
                  <>
                    <label className="edit-label">Options</label>
                    <div className="options-list">
                      {editOptions.map((opt, i) => (
                        <div key={i} className="option-row">
                          <input
                            type="text"
                            className="option-input"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={e => {
                              const updated = [...editOptions]
                              updated[i] = e.target.value
                              setEditOptions(updated)
                            }}
                          />
                          {editOptions.length > 2 && (
                            <button className="option-remove" onClick={() =>
                              setEditOptions(editOptions.filter((_, idx) => idx !== i))
                            }>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className="add-option-btn" onClick={() => setEditOptions([...editOptions, ''])}>
                      + Add option
                    </button>
                  </>
                )}
                <div className="edit-toggle-row">
                  <label className="vic-toggle">
                    <input type="checkbox" checked={editRequired} onChange={e => setEditRequired(e.target.checked)} />
                    <span className="vic-toggle-track"></span>
                  </label>
                  <span className="edit-toggle-label">Mark as required</span>
                </div>
                <div className="edit-footer">
                  <button className="save-edit-btn" onClick={() => saveEdit(q)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="cancel-edit-btn" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            )}

            {deletingId === q.id && (
              <div className="delete-confirm">
                <span className="delete-confirm-text">Delete this question?</span>
                <div className="delete-confirm-actions">
                  <button className="confirm-delete-btn" onClick={() => deleteQuestion(q.id)}>Delete</button>
                  <button className="cancel-delete-btn" onClick={() => setDeletingId(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add question form */}
        {showAddForm && (
          <div className="add-form-card">
            <div className="add-form-title">New Custom Question</div>

            <label className="form-label">Question Type</label>
            <div className="type-select-grid">
              {([
                { value: 'star', icon: '⭐', label: 'Star Rating' },
                { value: 'yesno', icon: '✓✗', label: 'Yes / No' },
                { value: 'text', icon: '✎', label: 'Open Text' },
                { value: 'choice', icon: '☰', label: 'Multiple Choice' },
              ] as { value: QuestionType; icon: string; label: string }[]).map(t => (
                <button
                  key={t.value}
                  className={`type-option ${newType === t.value ? 'selected' : ''}`}
                  onClick={() => setNewType(t.value)}
                >
                  <div className="type-option-icon">{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>

            <label className="form-label">Question Text</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. How would you rate our packaging?"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              rows={2}
            />

            {newType === 'choice' && (
              <>
                <label className="form-label">Options</label>
                <div className="options-list">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="option-row">
                      <input
                        type="text"
                        className="option-input"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e => {
                          const updated = [...newOptions]
                          updated[i] = e.target.value
                          setNewOptions(updated)
                        }}
                      />
                      {newOptions.length > 2 && (
                        <button className="option-remove" onClick={() =>
                          setNewOptions(newOptions.filter((_, idx) => idx !== i))
                        }>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="add-option-btn" onClick={() => setNewOptions([...newOptions, ''])}>
                  + Add option
                </button>
              </>
            )}

            <div className="edit-toggle-row">
              <label className="vic-toggle">
                <input type="checkbox" checked={newRequired} onChange={e => setNewRequired(e.target.checked)} />
                <span className="vic-toggle-track"></span>
              </label>
              <span className="edit-toggle-label">Mark as required</span>
            </div>

            <div className="add-form-footer">
              <button className="primary-btn" onClick={addQuestion} disabled={adding || !newText.trim()}>
                {adding ? 'Adding...' : 'Add Question'}
              </button>
              <button className="ghost-btn" onClick={() => {
                setShowAddForm(false)
                setNewText(''); setNewType('star'); setNewRequired(false); setNewOptions(['', ''])
              }}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
