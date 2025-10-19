'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { generateQRData } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2, QrCode, Download, Eye, Save, Info, Star, MessageSquare, CheckSquare, Crown, AlertCircle, Loader2 } from 'lucide-react'
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

interface Profile {
  plan: string
}

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    type: 'rating' as 'rating' | 'text' | 'multiple',
    text: '',
    options: ['']
  })
  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    loadForm()
  }, [])

  const isFirstTime = form?.questions.length === 0

  const loadForm = async () => {
    try {
      setLoadError(null)
      
      // Set a timeout for slow database responses
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 15000)
      )

      const loadPromise = (async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/auth/login')
          return
        }

        // Load profile and form in parallel for speed
        const [profileResult, formResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('forms').select('*').eq('id', params.id).eq('user_id', user.id).single()
        ])

        if (profileResult.data) {
          setProfile(profileResult.data)
        }

        if (formResult.error || !formResult.data) {
          throw new Error('Form not found or access denied')
        }

        setForm(formResult.data)
      })()

      await Promise.race([loadPromise, timeoutPromise])
      
    } catch (error: any) {
      console.error('Load error:', error)
      if (error.message === 'Database timeout') {
        setLoadError('Loading is taking longer than usual. This might be a connectivity issue.')
        showToast('Slow connection detected. Retrying...', 'error')
        // Retry after 2 seconds
        setTimeout(loadForm, 2000)
      } else if (error.message === 'Form not found or access denied') {
        showToast('Form not found', 'error')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setLoadError('Error loading form. Please refresh the page.')
        showToast('Error loading form', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveForm = async () => {
    if (!form) return

    setSaving(true)
    showToast('Saving changes...', 'success')

    try {
      const { error } = await supabase
        .from('forms')
        .update({ questions: form.questions })
        .eq('id', form.id)

      if (error) throw error

      showToast('Changes saved successfully!', 'success')
    } catch (error: any) {
      console.error('Save error:', error)
      showToast('Error saving: ' + (error.message || 'Please try again'), 'error')
    } finally {
      setSaving(false)
    }
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

    // Optimistic update
    setForm({
      ...form,
      questions: [...form.questions, question]
    })

    setNewQuestion({
      type: 'rating',
      text: '',
      options: ['']
    })

    if (isFirstTime) {
      setShowInstructions(false)
    }

    showToast('Question added! Remember to save your changes.', 'success')
  }

  const deleteQuestion = (questionId: string) => {
    if (!form) return

    // Optimistic update
    setForm({
      ...form,
      questions: form.questions.filter(q => q.id !== questionId)
    })

    showToast('Question removed! Remember to save your changes.', 'success')
  }

  const generateQR = async () => {
    if (!form) return

    const qrData = generateQRData(form.id)
    
    try {
      const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
        width: 512,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      
      setQrCodeUrl(qrCodeDataUrl)
      setShowQRModal(true)
    } catch (error) {
      showToast('Error generating QR code', 'error')
    }
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${form?.title || 'feedback-form'}-qr-code.png`
    link.click()
    showToast('QR code downloaded!', 'success')
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
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">Loading your form...</p>
          {loadError && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
              <p className="text-yellow-800 text-sm">{loadError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Form not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Star className="w-4 h-4" />
      case 'text': return <MessageSquare className="w-4 h-4" />
      case 'multiple': return <CheckSquare className="w-4 h-4" />
      default: return null
    }
  }

  const getQuestionTypeDescription = (type: string) => {
    switch (type) {
      case 'rating': return 'Customers rate from 1-5 stars'
      case 'text': return 'Customers write detailed responses'
      case 'multiple': return 'Customers select from predefined options'
      default: return ''
    }
  }

  const planName = profile?.plan || 'free'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white max-w-md`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
                <p className="text-sm text-gray-500">Form Builder</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {planName === 'free' && (
                <Link
                  href="/pricing"
                  className="hidden sm:flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Link>
              )}
              <button
                onClick={saveForm}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={generateQR}
                disabled={form.questions.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                title={form.questions.length === 0 ? "Add questions first to generate QR code" : "Generate QR code"}
              >
                <QrCode className="w-4 h-4" />
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions for new users */}
        {isFirstTime && showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to your Form Builder!</h3>
                <p className="text-blue-800 mb-4">
                  Your form has been created with the title and description. Now you need to add questions that your customers will answer.
                </p>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Step 1:</strong> Choose a question type (Rating, Text, or Multiple Choice)</p>
                  <p><strong>Step 2:</strong> Write your question</p>
                  <p><strong>Step 3:</strong> Add answer options (for Multiple Choice only)</p>
                  <p><strong>Step 4:</strong> Click "Add Question" to save it</p>
                  <p><strong>Step 5:</strong> Click the green "Save" button at the top</p>
                  <p><strong>Step 6:</strong> Generate your QR code when ready!</p>
                </div>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="mt-4 text-blue-600 text-sm hover:text-blue-700 font-medium"
                >
                  Got it, hide this
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Warning */}
        {form.questions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <strong>Don't forget to save!</strong> Click the green <strong>Save</strong> button at the top after making changes.
              </p>
            </div>
          </div>
        )}

        {/* Form Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h2>
              <p className="text-gray-600">{form.description || 'No description'}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Questions added:</div>
              <div className="text-2xl font-bold text-blue-600">{form.questions.length}</div>
            </div>
          </div>
        </div>

        {/* Add Question Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center mb-4">
            <Plus className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Add New Question</h3>
          </div>
          
          <div className="space-y-6">
            {/* Question Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Question Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'rating', label: 'Rating Scale', icon: Star, desc: '1-5 star ratings' },
                  { value: 'text', label: 'Text Response', icon: MessageSquare, desc: 'Written feedback' },
                  { value: 'multiple', label: 'Multiple Choice', icon: CheckSquare, desc: 'Select from options' }
                ].map(({ value, label, icon: Icon, desc }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="questionType"
                      value={value}
                      checked={newQuestion.type === value}
                      onChange={(e) => setNewQuestion({
                        ...newQuestion,
                        type: e.target.value as 'rating' | 'text' | 'multiple',
                        options: e.target.value === 'multiple' ? [''] : []
                      })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 transition-colors ${
                      newQuestion.type === value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center mb-2">
                        <Icon className={`w-5 h-5 mr-2 ${
                          newQuestion.type === value ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className={`font-medium ${
                          newQuestion.type === value ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {label}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        newQuestion.type === value ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {getQuestionTypeDescription(newQuestion.type)}
              </p>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <input
                type="text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="e.g., How would you rate our service?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Multiple Choice Options */}
            {newQuestion.type === 'multiple' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options *
                </label>
                <div className="space-y-3">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
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
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    Add Another Option
                  </button>
                </div>
              </div>
            )}

            {/* Add Question Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {!newQuestion.text.trim() && "Enter question text to continue"}
                {newQuestion.type === 'multiple' && newQuestion.options.filter(opt => opt.trim()).length < 2 && 
                  newQuestion.text.trim() && "Add at least 2 options for multiple choice"}
              </div>
              <button
                onClick={addQuestion}
                disabled={
                  !newQuestion.text.trim() || 
                  (newQuestion.type === 'multiple' && newQuestion.options.filter(opt => opt.trim()).length < 2)
                }
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            Current Questions 
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
              {form.questions.length}
            </span>
          </h3>
          
          {form.questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No questions added yet</p>
              <p className="text-sm text-gray-400">Add your first question above to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          Question {index + 1}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getQuestionTypeIcon(question.type)}
                          {question.type === 'rating' ? 'Rating Scale' : 
                           question.type === 'text' ? 'Text Response' : 'Multiple Choice'}
                        </div>
                      </div>
                      <p className="text-gray-900 font-medium mb-3 text-lg">{question.text}</p>
                      {question.options && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-600 font-medium mb-2">Answer Options:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-700">
                                <div className="w-5 h-5 rounded-full bg-white border border-gray-300 mr-2 flex-shrink-0"></div>
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded ml-4"
                      title="Delete Question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {form.questions.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Your form is ready!</h4>
                <p className="text-gray-600 mb-4">Preview your form or generate a QR code to start collecting feedback</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`/feedback/${form.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Form
                  </Link>
                  <button
                    onClick={generateQR}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    Generate QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Tip for Free Users */}
        {planName === 'free' && form.questions.length > 0 && (
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start">
              <Crown className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-1">Want Advanced Features?</h4>
                <p className="text-purple-800 text-sm mb-3">
                  Upgrade to Pro for advanced analytics, unlimited responses, custom branding, and priority support.
                </p>
                <Link 
                  href="/pricing"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View pricing plans →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your QR Code is Ready!</h2>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 rounded-lg shadow-md" />
              <p className="text-gray-600 mb-2 font-medium">Scan this QR code to test your form:</p>
              <p className="text-sm text-gray-500 mb-6">
                Print and place it where customers can scan with their phones
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={downloadQR}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
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
