'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { generateQRData } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2, QrCode, Download, Eye, Save } from 'lucide-react'
import QRCodeLib from 'qrcode'

interface Question {
  id: string
  type: 'rating' | 'text' | 'multiple'
  text: string
  options?: string[]
}

interface Form {
  id: string
  title: string
  description: string
  questions: Question[]
  user_id: string
}

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    type: 'rating' as 'rating' | 'text' | 'multiple',
    text: '',
    options: ['']
  })
  const supabase = createClient()

  useEffect(() => {
    loadForm()
  }, [])

  const loadForm = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: formData, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !formData) {
      router.push('/dashboard')
      return
    }

    setForm(formData)
    setLoading(false)
  }

  const saveForm = async () => {
    if (!form) return

    setSaving(true)

    const { error } = await supabase
      .from('forms')
      .update({ questions: form.questions })
      .eq('id', form.id)

    if (error) {
      alert('Error saving form: ' + error.message)
    }

    setSaving(false)
  }

  const addQuestion = () => {
    if (!form || !newQuestion.text.trim()) return

    const question: Question = {
      id: Date.now().toString(),
      type: newQuestion.type,
      text: newQuestion.text.trim(),
      options: newQuestion.type === 'multiple' 
        ? newQuestion.options.filter(opt => opt.trim()) 
        : undefined
    }

    setForm({
      ...form,
      questions: [...form.questions, question]
    })

    setNewQuestion({
      type: 'rating',
      text: '',
      options: ['']
    })
  }

  const deleteQuestion = (questionId: string) => {
    if (!form) return

    setForm({
      ...form,
      questions: form.questions.filter(q => q.id !== questionId)
    })
  }

  const generateQR = async () => {
    if (!form) return

    const qrData = generateQRData(form.id)
    
    try {
      const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      
      setQrCodeUrl(qrCodeDataUrl)
      setShowQRModal(true)
    } catch (error) {
      alert('Error generating QR code')
    }
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${form?.title || 'feedback-form'}-qr-code.png`
    link.click()
  }

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, '']
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({
      ...newQuestion,
      options: newOptions
    })
  }

  const removeOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Form not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveForm}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={generateQR}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h2>
          <p className="text-gray-600">{form.description || 'No description'}</p>
        </div>

        {/* Add Question */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Question</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({
                  ...newQuestion,
                  type: e.target.value as 'rating' | 'text' | 'multiple',
                  options: e.target.value === 'multiple' ? [''] : []
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Rating (1-5 stars)</option>
                <option value="text">Text Response</option>
                <option value="multiple">Multiple Choice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <input
                type="text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="Enter your question"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {newQuestion.type === 'multiple' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options
                </label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      {newQuestion.options.length > 1 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Option
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={addQuestion}
              disabled={!newQuestion.text.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Questions ({form.questions.length})
          </h3>
          
          {form.questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No questions added yet. Add your first question above.
            </p>
          ) : (
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Q{index + 1}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">
                          {question.type === 'rating' ? 'Rating' : 
                           question.type === 'text' ? 'Text' : 'Multiple Choice'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{question.text}</p>
                      {question.options && (
                        <div className="text-sm text-gray-600">
                          Options: {question.options.join(', ')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {form.questions.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={`/feedback/${form.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <Eye className="w-4 h-4" />
              Preview Form
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your QR Code</h2>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 rounded-lg" />
              <p className="text-gray-600 mb-6">
                Place this QR code where customers can easily scan it
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={downloadQR}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
