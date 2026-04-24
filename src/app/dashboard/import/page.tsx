'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

type ImportRow = {
  rating: number
  comment: string
  responded_at: string
  raw_data: Record<string, any>
}

type ImportHistory = {
  import_id: string
  import_filename: string
  imported_at: string
  count: number
}

type ColumnMap = {
  rating: string
  comment: string
  date: string
}

function downloadSampleExcel() {
  const sampleData = [
    { 'Date': '2026-01-01', 'Customer Name': 'Priya Sharma', 'Overall Rating (1-5)': 5, 'Food Quality (1-5)': 5, 'Service Quality (1-5)': 4, 'Cleanliness (1-5)': 5, 'Value for Money (1-5)': 4, 'What did you enjoy most?': 'Loved the outdoor seating area, very cozy.', 'What could we improve?': '', 'Would you recommend us?': 'Yes', 'Main Issue (if any)': '' },
    { 'Date': '2026-01-06', 'Customer Name': 'Manoj Malhotra', 'Overall Rating (1-5)': 4, 'Food Quality (1-5)': 4, 'Service Quality (1-5)': 3, 'Cleanliness (1-5)': 5, 'Value for Money (1-5)': 5, 'What did you enjoy most?': 'The desserts! Especially the gulab jamun.', 'What could we improve?': 'Slightly longer waiting times.', 'Would you recommend us?': 'Yes', 'Main Issue (if any)': '' },
    { 'Date': '2026-01-12', 'Customer Name': 'Sanjay Bhatt', 'Overall Rating (1-5)': 3, 'Food Quality (1-5)': 3, 'Service Quality (1-5)': 3, 'Cleanliness (1-5)': 4, 'Value for Money (1-5)': 3, 'What did you enjoy most?': 'The masala dosa was crispy.', 'What could we improve?': 'Parking is tricky during peak hours.', 'Would you recommend us?': 'Maybe', 'Main Issue (if any)': 'Wait time' },
    { 'Date': '2026-01-18', 'Customer Name': 'Anita Patel', 'Overall Rating (1-5)': 5, 'Food Quality (1-5)': 5, 'Service Quality (1-5)': 5, 'Cleanliness (1-5)': 5, 'Value for Money (1-5)': 5, 'What did you enjoy most?': 'Best restaurant in town!', 'What could we improve?': '', 'Would you recommend us?': 'Yes', 'Main Issue (if any)': '' },
    { 'Date': '2026-01-24', 'Customer Name': 'Rohit Verma', 'Overall Rating (1-5)': 2, 'Food Quality (1-5)': 2, 'Service Quality (1-5)': 2, 'Cleanliness (1-5)': 3, 'Value for Money (1-5)': 2, 'What did you enjoy most?': '', 'What could we improve?': 'Food arrived cold and service was slow.', 'Would you recommend us?': 'No', 'Main Issue (if any)': 'Food quality' },
    { 'Date': '2026-02-03', 'Customer Name': 'Kavya Reddy', 'Overall Rating (1-5)': 4, 'Food Quality (1-5)': 4, 'Service Quality (1-5)': 4, 'Cleanliness (1-5)': 4, 'Value for Money (1-5)': 4, 'What did you enjoy most?': 'Lovely evening, staff were very friendly.', 'What could we improve?': '', 'Would you recommend us?': 'Yes', 'Main Issue (if any)': '' },
    { 'Date': '2026-02-10', 'Customer Name': 'Deepak Nair', 'Overall Rating (1-5)': 1, 'Food Quality (1-5)': 1, 'Service Quality (1-5)': 2, 'Cleanliness (1-5)': 2, 'Value for Money (1-5)': 1, 'What did you enjoy most?': '', 'What could we improve?': 'Hygiene standards need improvement.', 'Would you recommend us?': 'No', 'Main Issue (if any)': 'Cleanliness' },
    { 'Date': '2026-02-17', 'Customer Name': 'Sneha Iyer', 'Overall Rating (1-5)': 5, 'Food Quality (1-5)': 5, 'Service Quality (1-5)': 5, 'Cleanliness (1-5)': 5, 'Value for Money (1-5)': 5, 'What did you enjoy most?': 'Perfect in every way, exceptional experience!', 'What could we improve?': '', 'Would you recommend us?': 'Yes', 'Main Issue (if any)': '' },
    { 'Date': '2026-02-24', 'Customer Name': 'Vikram Singh', 'Overall Rating (1-5)': 3, 'Food Quality (1-5)': 4, 'Service Quality (1-5)': 2, 'Cleanliness (1-5)': 4, 'Value for Money (1-5)': 3, 'What did you enjoy most?': 'Food was good.', 'What could we improve?': 'Staff seemed inattentive.', 'Would you recommend us?': 'Maybe', 'Main Issue (if any)': 'Service' },
    { 'Date': '2026-03-05', 'Customer Name': 'Meera Krishnan', 'Overall Rating (1-5)': 5, 'Food Quality (1-5)': 5, 'Service Quality (1-5)': 4, 'Cleanliness (1-5)': 5, 'Value for Money (1-5)': 4, 'What did you enjoy most?': 'Fantastic biryani and very clean premises.', 'What could we improve?': '', 'Would you recommend us?': 'Yes', 'Main Issue (if any)': '' },
  ]

  const ws = XLSX.utils.json_to_sheet(sampleData)
  ws['!cols'] = [
    { wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 22 },
    { wch: 18 }, { wch: 22 }, { wch: 40 }, { wch: 38 }, { wch: 24 }, { wch: 20 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Customer Reviews')
  XLSX.writeFile(wb, 'QRFeedback-Sample-Import.xlsx')
}

export default function ImportPage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [columnMap, setColumnMap] = useState<ColumnMap>({ rating: '', comment: '', date: '' })
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload')

  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importedCount, setImportedCount] = useState(0)

  const [history, setHistory] = useState<ImportHistory[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUserId(user.id)
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    setPlan(profile?.plan || 'free')
    await loadHistory(user.id)
    setLoading(false)
  }

  async function loadHistory(uid: string) {
    const { data } = await supabase
      .from('imported_responses')
      .select('import_id, import_filename, imported_at')
      .eq('user_id', uid)
      .order('imported_at', { ascending: false })
    if (!data) return
    const grouped: Record<string, ImportHistory> = {}
    data.forEach((r: any) => {
      if (!grouped[r.import_id]) {
        grouped[r.import_id] = { import_id: r.import_id, import_filename: r.import_filename, imported_at: r.imported_at, count: 0 }
      }
      grouped[r.import_id].count++
    })
    setHistory(Object.values(grouped).sort((a, b) => new Date(b.imported_at).getTime() - new Date(a.imported_at).getTime()))
  }

  function processFile(f: File) {
    setFile(f); setImportError('')
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[]
        if (json.length === 0) { setImportError('The file appears to be empty.'); return }
        const cols = Object.keys(json[0])
        setColumns(cols); setRows(json)
        const autoMap: ColumnMap = { rating: '', comment: '', date: '' }
        // Score each column — pick highest scoring for each field
        const ratingScore = (c: string) => {
          const cl = c.toLowerCase()
          if (cl === 'rating' || cl === 'score' || cl === 'stars') return 10
          if (cl.startsWith('overall') && cl.includes('rating')) return 9
          if (cl.includes('overall') && (cl.includes('rating') || cl.includes('score'))) return 8
          if (cl.includes('rating') || cl.includes('star')) return 5
          return 0
        }
        const commentScore = (c: string) => {
          const cl = c.toLowerCase()
          if (cl === 'comment' || cl === 'feedback' || cl === 'review') return 10
          if (cl.includes('comment') || cl.includes('feedback')) return 8
          if (cl.includes('enjoy') || cl.includes('note') || cl.includes('remark')) return 5
          if (cl.includes('improve') || cl.includes('suggestion')) return 3
          return 0
        }
        const dateScore = (c: string) => {
          const cl = c.toLowerCase()
          if (cl === 'date' || cl === 'time') return 10
          if (cl.startsWith('date') || cl.endsWith('date')) return 8
          if (cl.includes('date') || cl.includes('time')) return 5
          return 0
        }
        let bestRating = { col: '', score: 0 }
        let bestComment = { col: '', score: 0 }
        let bestDate = { col: '', score: 0 }
        cols.forEach(c => {
          const rs = ratingScore(c); if (rs > bestRating.score) bestRating = { col: c, score: rs }
          const cs = commentScore(c); if (cs > bestComment.score) bestComment = { col: c, score: cs }
          const ds = dateScore(c); if (ds > bestDate.score) bestDate = { col: c, score: ds }
        })
        if (bestRating.score > 0) autoMap.rating = bestRating.col
        if (bestComment.score > 0) autoMap.comment = bestComment.col
        if (bestDate.score > 0) autoMap.date = bestDate.col
        setColumnMap(autoMap)
        setStep('map')
      } catch {
        setImportError('Could not read the file. Please make sure it is a valid Excel (.xlsx) file.')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) processFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]; if (f) processFile(f)
  }

  function buildPreview(): ImportRow[] {
    return rows.slice(0, 5).map(row => {
      const ratingRaw = columnMap.rating ? row[columnMap.rating] : null
      const rating = Math.min(5, Math.max(1, Math.round(parseFloat(String(ratingRaw)) || 3)))
      const comment = columnMap.comment ? String(row[columnMap.comment] || '') : ''
      const dateRaw = columnMap.date ? row[columnMap.date] : null
      let responded_at = new Date().toISOString()
      if (dateRaw) {
        if (typeof dateRaw === 'number') {
          const d = XLSX.SSF.parse_date_code(dateRaw)
          if (d) responded_at = new Date(d.y, d.m - 1, d.d).toISOString()
        } else {
          const parsed = new Date(String(dateRaw))
          if (!isNaN(parsed.getTime())) responded_at = parsed.toISOString()
        }
      }
      return { rating, comment, responded_at, raw_data: row }
    })
  }

  function handlePreview() {
    if (!columnMap.rating) { setImportError('Please select the Rating column.'); return }
    setImportError(''); setPreview(buildPreview()); setStep('preview')
  }

  async function handleImport() {
    if (!userId || !file) return
    setImporting(true); setImportError('')
    const importId = crypto.randomUUID()
    const allRows: ImportRow[] = rows.map(row => {
      const ratingRaw = columnMap.rating ? row[columnMap.rating] : null
      const rating = Math.min(5, Math.max(1, Math.round(parseFloat(String(ratingRaw)) || 3)))
      const comment = columnMap.comment ? String(row[columnMap.comment] || '') : ''
      const dateRaw = columnMap.date ? row[columnMap.date] : null
      let responded_at = new Date().toISOString()
      if (dateRaw) {
        if (typeof dateRaw === 'number') {
          const d = XLSX.SSF.parse_date_code(dateRaw)
          if (d) responded_at = new Date(d.y, d.m - 1, d.d).toISOString()
        } else {
          const parsed = new Date(String(dateRaw))
          if (!isNaN(parsed.getTime())) responded_at = parsed.toISOString()
        }
      }
      return { rating, comment, responded_at, raw_data: row }
    })
    const CHUNK = 500
    for (let i = 0; i < allRows.length; i += CHUNK) {
      const chunk = allRows.slice(i, i + CHUNK).map(r => ({
        user_id: userId, import_id: importId, import_filename: file.name,
        rating: r.rating, comment: r.comment || null,
        responded_at: r.responded_at, raw_data: r.raw_data,
      }))
      const { error } = await supabase.from('imported_responses').insert(chunk)
      if (error) { setImportError(`Import failed: ${error.message}`); setImporting(false); return }
    }
    setImportedCount(allRows.length)
    await loadHistory(userId)
    setImporting(false); setStep('done')
  }

  async function handleDelete(importId: string) {
    if (!userId) return
    setDeletingId(importId)
    await supabase.from('imported_responses').delete().eq('import_id', importId).eq('user_id', userId)
    await loadHistory(userId)
    setDeletingId(null)
  }

  function reset() {
    setFile(null); setColumns([]); setRows([]); setColumnMap({ rating: '', comment: '', date: '' })
    setPreview([]); setStep('upload'); setImportError(''); setImportedCount(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#b09490', fontSize: '0.85rem' }}>Loading...</div>
    </div>
  )

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
        .import-page { max-width: 860px; }
        .import-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 20px; }
        .import-card-title { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }

        /* Guide */
        .guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .guide-col { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; }
        .guide-col-title { font-size: 0.72rem; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 7px; }
        .guide-rule { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .guide-rule:last-child { margin-bottom: 0; }
        .guide-rule-icon { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; margin-top: 1px; }
        .guide-rule-icon.green { background: var(--green-soft); color: var(--green); }
        .guide-rule-icon.rose { background: var(--rose-soft); color: var(--rose); }
        .guide-rule-icon.amber { background: #fef3e8; color: #c4896a; }
        .guide-rule-text { font-size: 0.78rem; color: var(--text-mid); line-height: 1.5; }
        .guide-rule-text strong { color: var(--text); }

        /* Sample table */
        .sample-table-wrap { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-top: 14px; }
        .sample-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .sample-table th { background: var(--rose-soft); color: var(--rose); font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 14px; text-align: left; border-bottom: 1px solid var(--border); }
        .sample-table td { padding: 8px 14px; border-bottom: 1px solid var(--border); color: var(--text-mid); }
        .sample-table tr:last-child td { border-bottom: none; }
        .sample-table tr:nth-child(even) td { background: var(--bg); }

        .download-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 18px; border-radius: 8px; border: 1.5px solid var(--green); background: var(--green-soft); color: var(--green); font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; text-decoration: none; }
        .download-btn:hover { background: #d8ede2; }

        .drop-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; background: var(--bg); transition: all 0.2s; margin-top: 18px; }
        .drop-zone:hover, .drop-zone.dragging { border-color: var(--rose); background: var(--rose-soft); }
        .drop-zone-icon { font-size: 2rem; margin-bottom: 12px; }
        .drop-zone-title { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 5px; }
        .drop-zone-sub { font-size: 0.76rem; color: var(--text-soft); }
        .drop-zone-btn { margin-top: 16px; padding: 8px 20px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--surface); font-size: 0.8rem; font-weight: 600; color: var(--text-mid); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .drop-zone-btn:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }

        .map-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 18px; }
        .map-group label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .map-group select { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text); font-family: 'DM Sans', sans-serif; background: var(--bg); outline: none; transition: all 0.2s; cursor: pointer; }
        .map-group select:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(176,92,82,0.07); background: #fff; }
        .map-hint { font-size: 0.68rem; color: var(--text-soft); margin-top: 4px; }
        .map-required { color: var(--rose); }

        .preview-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.8rem; }
        .preview-table th { text-align: left; padding: 8px 12px; background: var(--bg); border-bottom: 2px solid var(--border); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-soft); font-weight: 700; }
        .preview-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text-mid); }
        .preview-table tr:last-child td { border-bottom: none; }
        .rating-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
        .rating-badge.pos { background: var(--green-soft); color: var(--green); }
        .rating-badge.neg { background: var(--rose-soft); color: var(--rose); }

        .action-row { display: flex; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .btn-primary { padding: 10px 22px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 2px 8px rgba(176,92,82,0.2); }
        .btn-primary:hover:not(:disabled) { background: var(--rose-dark); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-secondary { padding: 10px 20px; border-radius: 8px; border: 1.5px solid var(--border); background: transparent; font-size: 0.84rem; font-weight: 600; color: var(--text-mid); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .btn-secondary:hover { border-color: var(--border-md); color: var(--text); }
        .error-box { background: #fef5f4; border: 1px solid #f0c4be; border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; color: #8c3d34; margin-top: 14px; }

        .done-box { background: var(--green-soft); border: 1px solid rgba(74,122,90,0.25); border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 20px; }
        .done-icon { font-size: 2.4rem; margin-bottom: 12px; }
        .done-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 6px; }
        .done-sub { font-size: 0.82rem; color: var(--text-mid); margin-bottom: 18px; }

        .history-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .history-table th { text-align: left; padding: 8px 12px; background: var(--bg); border-bottom: 2px solid var(--border); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-soft); font-weight: 700; }
        .history-table td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 0.82rem; color: var(--text-mid); vertical-align: middle; }
        .history-table tr:last-child td { border-bottom: none; }
        .delete-btn { padding: 4px 12px; border-radius: 6px; border: 1px solid #f0c4be; background: #fef5f4; color: #8c3d34; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .delete-btn:hover { background: #f7e0dc; }
        .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .lock-card { background: var(--rose-soft); border: 1px solid var(--border); border-radius: 12px; padding: 40px; text-align: center; }
        .lock-icon { font-size: 2rem; margin-bottom: 14px; }
        .lock-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 8px; }
        .lock-sub { font-size: 0.82rem; color: var(--text-mid); margin-bottom: 20px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto; }
        .lock-btn { padding: 10px 24px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .lock-btn:hover { background: var(--rose-dark); }

        .step-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
        .step-dot.active { background: var(--rose); }
        .step-dot.done { background: var(--green); }
        .step-label { font-size: 0.72rem; color: var(--text-soft); }
        .step-sep { flex: 1; height: 1px; background: var(--border); }

        @media (max-width: 640px) {
          .guide-grid { grid-template-columns: 1fr; }
          .map-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="import-page">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 4 }}>📥 Import Historical Data</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Upload past feedback data from Excel files to include in your analytics.</div>
        </div>

        {!isBusiness ? (
          <div className="lock-card">
            <div className="lock-icon">🔒</div>
            <div className="lock-title">Business Plan Feature</div>
            <div className="lock-sub">Historical data import is available on the Business plan. Upgrade to merge your past feedback data into your analytics charts.</div>
            <button className="lock-btn" onClick={() => router.push('/dashboard/profile')}>Upgrade to Business →</button>
          </div>
        ) : (
          <>
            {/* ── FORMAT GUIDE ── */}
            <div className="import-card">
              <div className="import-card-title">
                <span>📋 File Format Guide</span>
                <button className="download-btn" onClick={downloadSampleExcel}>
                  ↓ Download Sample Excel
                </button>
              </div>

              <div className="guide-grid">
                <div className="guide-col">
                  <div className="guide-col-title"><span>✓</span> Required Structure</div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon green">★</div>
                    <div className="guide-rule-text"><strong>Overall Rating column</strong> — must contain whole numbers 1 to 5. Can be named "Rating", "Overall Rating (1-5)", "Score", etc. This is the only required column.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon amber">📅</div>
                    <div className="guide-rule-text"><strong>Date column</strong> (optional) — when the feedback was given. Accepts YYYY-MM-DD or DD/MM/YYYY. If missing, today's date is used.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon amber">💬</div>
                    <div className="guide-rule-text"><strong>Comment/Feedback column</strong> (optional) — customer's written feedback. Can be "What did you enjoy?", "Comment", "Feedback", etc. Blank rows are fine.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon green">📊</div>
                    <div className="guide-rule-text"><strong>Extra columns are ignored</strong> — Customer Name, Food Quality, Service Quality, Would you recommend us, etc. are all fine to include. Only the columns you map will be imported.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon green">🗂</div>
                    <div className="guide-rule-text"><strong>First row must be headers</strong> — column names in row 1, data from row 2 onwards.</div>
                  </div>
                </div>

                <div className="guide-col">
                  <div className="guide-col-title"><span>✕</span> Common Mistakes to Avoid</div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon rose">✕</div>
                    <div className="guide-rule-text"><strong>Don't use text ratings</strong> — values like "Good", "Excellent", "3/5", or "★★★" won't import. The rating column must contain plain numbers: 1, 2, 3, 4, or 5.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon rose">✕</div>
                    <div className="guide-rule-text"><strong>Don't use merged cells</strong> — each row must be one feedback entry. Merged header cells break the import.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon rose">✕</div>
                    <div className="guide-rule-text"><strong>Remove totals and summary rows</strong> — delete any average, total, or chart rows at the bottom of the sheet before importing.</div>
                  </div>
                  <div className="guide-rule">
                    <div className="guide-rule-icon rose">✕</div>
                    <div className="guide-rule-text"><strong>.xlsx files only</strong> — save as Excel Workbook (.xlsx). CSV and older .xls formats are not supported.</div>
                  </div>
                </div>
              </div>

              {/* Sample table */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Example — this is exactly how the sample file looks:
              </div>
              <div className="sample-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="sample-table" style={{ minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer Name</th>
                      <th>Overall Rating (1-5)</th>
                      <th>Food Quality (1-5)</th>
                      <th>Service Quality (1-5)</th>
                      <th>What did you enjoy most?</th>
                      <th>Would you recommend us?</th>
                      <th>Main Issue (if any)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2026-01-01', name: 'Priya Sharma', overall: 5, food: 5, service: 4, enjoy: 'Loved the outdoor seating area.', recommend: 'Yes', issue: '' },
                      { date: '2026-01-06', name: 'Manoj Malhotra', overall: 4, food: 4, service: 3, enjoy: 'The desserts! Especially the gulab jamun.', recommend: 'Yes', issue: '' },
                      { date: '2026-01-24', name: 'Rohit Verma', overall: 2, food: 2, service: 2, enjoy: '', recommend: 'No', issue: 'Food quality' },
                      { date: '2026-02-10', name: 'Deepak Nair', overall: 1, food: 1, service: 2, enjoy: '', recommend: 'No', issue: 'Cleanliness' },
                      { date: '2026-03-05', name: 'Meera Krishnan', overall: 5, food: 5, service: 4, enjoy: 'Fantastic biryani and clean premises.', recommend: 'Yes', issue: '' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td>{row.date}</td>
                        <td>{row.name}</td>
                        <td><strong style={{ color: row.overall >= 4 ? 'var(--green)' : row.overall <= 2 ? 'var(--rose)' : 'var(--terra)' }}>{row.overall}</strong></td>
                        <td style={{ color: 'var(--text-soft)' }}>{row.food}</td>
                        <td style={{ color: 'var(--text-soft)' }}>{row.service}</td>
                        <td style={{ color: row.enjoy ? 'var(--text-mid)' : 'var(--text-soft)', fontStyle: row.enjoy ? 'normal' : 'italic', maxWidth: 200 }}>{row.enjoy || '(blank)'}</td>
                        <td>{row.recommend}</td>
                        <td style={{ color: row.issue ? 'var(--rose)' : 'var(--text-soft)', fontStyle: row.issue ? 'normal' : 'italic' }}>{row.issue || '(blank)'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef9ec', border: '1px solid #f0d98a', borderRadius: 8, fontSize: '0.76rem', color: '#7a6020', lineHeight: 1.6 }}>
                💡 <strong>Column names don't need to match exactly.</strong> After uploading you'll pick which column is the rating, which is the date, and which is the comment. All other columns (Customer Name, Food Quality, Service Quality, etc.) are stored but not used in analytics — only the three you map matter.
              </div>
            </div>

            {/* Step indicator */}
            <div className="step-indicator">
              {['Upload file', 'Map columns', 'Preview & import'].map((label, i) => {
                const currentIdx = ['upload','map','preview','done'].indexOf(step)
                const isDone = currentIdx > i
                const isActive = currentIdx === i
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < 2 ? 1 : 'none' }}>
                    <div className={`step-dot ${isDone ? 'done' : isActive ? 'active' : ''}`} />
                    <span className="step-label" style={{ color: isActive ? 'var(--rose)' : isDone ? 'var(--green)' : undefined, fontWeight: isActive ? 700 : 400 }}>{label}</span>
                    {i < 2 && <div className="step-sep" />}
                  </div>
                )
              })}
            </div>

            {/* STEP 1: Upload */}
            {step === 'upload' && (
              <div className="import-card">
                <div className="import-card-title">Step 1 — Upload your Excel file</div>
                <div
                  className={`drop-zone ${dragging ? 'dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-zone-icon">📊</div>
                  <div className="drop-zone-title">Drag & drop your Excel file here</div>
                  <div className="drop-zone-sub">Supports .xlsx files · Any number of rows</div>
                  <button className="drop-zone-btn" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>Browse files</button>
                  <input ref={fileInputRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
                {importError && <div className="error-box">⚠ {importError}</div>}
              </div>
            )}

            {/* STEP 2: Map columns */}
            {step === 'map' && (
              <div className="import-card">
                <div className="import-card-title">
                  <span>Step 2 — Map your columns</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-soft)', fontFamily: 'DM Sans, sans-serif' }}>
                    {file?.name} · {rows.length} rows detected
                  </span>
                </div>
                <div className="map-grid">
                  <div className="map-group">
                    <label>Rating column <span className="map-required">*</span></label>
                    <select value={columnMap.rating} onChange={e => setColumnMap(p => ({ ...p, rating: e.target.value }))}>
                      <option value="">Select column...</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="map-hint">Must contain numbers 1–5</div>
                  </div>
                  <div className="map-group">
                    <label>Date column <span style={{ color: 'var(--text-soft)' }}>(optional)</span></label>
                    <select value={columnMap.date} onChange={e => setColumnMap(p => ({ ...p, date: e.target.value }))}>
                      <option value="">Not available</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="map-hint">When the feedback was given</div>
                  </div>
                  <div className="map-group">
                    <label>Comment column <span style={{ color: 'var(--text-soft)' }}>(optional)</span></label>
                    <select value={columnMap.comment} onChange={e => setColumnMap(p => ({ ...p, comment: e.target.value }))}>
                      <option value="">Not available</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="map-hint">Customer's written feedback</div>
                  </div>
                </div>
                {importError && <div className="error-box">⚠ {importError}</div>}
                <div className="action-row">
                  <button className="btn-primary" onClick={handlePreview}>Preview →</button>
                  <button className="btn-secondary" onClick={reset}>← Back</button>
                </div>
              </div>
            )}

            {/* STEP 3: Preview */}
            {step === 'preview' && (
              <div className="import-card">
                <div className="import-card-title">
                  <span>Step 3 — Preview & import</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-soft)', fontFamily: 'DM Sans, sans-serif' }}>
                    Showing first 5 of {rows.length} rows
                  </span>
                </div>
                <table className="preview-table">
                  <thead>
                    <tr><th>Rating</th><th>Sentiment</th><th>Date</th><th>Comment</th></tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i}>
                        <td><strong>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</strong> {r.rating}/5</td>
                        <td><span className={`rating-badge ${r.rating >= 4 ? 'pos' : 'neg'}`}>{r.rating >= 4 ? '😊 Positive' : '⚠ Negative'}</span></td>
                        <td>{new Date(r.responded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || <span style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>No comment</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.76rem', color: 'var(--text-soft)' }}>
                  ✦ All <strong style={{ color: 'var(--text)' }}>{rows.length} rows</strong> will be imported and merged into your analytics. You can remove this import at any time from Import History below.
                </div>
                {importError && <div className="error-box">⚠ {importError}</div>}
                <div className="action-row">
                  <button className="btn-primary" onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing...' : `Import ${rows.length} rows →`}
                  </button>
                  <button className="btn-secondary" onClick={() => setStep('map')}>← Back</button>
                </div>
              </div>
            )}

            {/* STEP 4: Done */}
            {step === 'done' && (
              <div className="done-box">
                <div className="done-icon">✅</div>
                <div className="done-title">Import complete!</div>
                <div className="done-sub">{importedCount} rows imported successfully. Your analytics charts now include this historical data.</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => router.push('/dashboard/analytics')}>View Analytics →</button>
                  <button className="btn-secondary" onClick={reset}>Import another file</button>
                </div>
              </div>
            )}

            {/* Import history */}
            <div className="import-card" style={{ marginTop: 8 }}>
              <div className="import-card-title">Import History</div>
              {history.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.82rem' }}>
                  No imports yet. Upload your first file above.
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr><th>File</th><th>Rows</th><th>Imported</th><th></th></tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.import_id}>
                        <td><div style={{ fontWeight: 600, color: 'var(--text)' }}>{h.import_filename}</div></td>
                        <td>{h.count} rows</td>
                        <td>{new Date(h.imported_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <button className="delete-btn" onClick={() => handleDelete(h.import_id)} disabled={deletingId === h.import_id}>
                            {deletingId === h.import_id ? 'Deleting...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}