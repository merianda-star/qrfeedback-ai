'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Star, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

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

interface Answer {
  questionId: string
  value: string | number
}

export default function FeedbackPage() {
  const params = useParams()
  const [isFormOwner, setIsFormOwner] = useState(false)
  const [form, setForm] = useState<Form | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadForm()
  }, [])

  const loadForm = async () => {
    try {
      console.log('📋 Loading form:', params.formId)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', params.formId)
        .single()

      if (formError || !formData) {
        console.error('❌ Form not found:', formError)
        setError('Form not found')
        setLoading(false)
        return
      }

      console.log('✅ Form loaded:', formData.title)

      // Check if form has questions
      if (!formData.questions || formData.questions.length === 0) {
        console.log('⚠️ Form has no questions')
        setError('This form has no questions yet. The form creator needs to add questions first.')
        setLoading(false)
        return
      }

      if (user && user.id === formData.user_id) {
        setIsFormOwner(true)
        console.log('👤 User is form owner')
      }

      setForm(formData)
      const initialAnswers = formData.questions.map((question: Question) => ({
        questionId: question.id,
        value: question.type === 'rating' ? 0 : ''
      }))
      setAnswers(initialAnswers)
    } catch (err) {
      console.error('❌ Error loading form:', err)
      setError('Error loading form')
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, value }
          : answer
      )
    )
    // Clear error when user starts answering
    if (error) setError('')
  }

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    const unanswered = answers.filter(answer => 
      answer.value === '' || answer.value === 0
    )

    if (unanswered.length > 0) {
      setError('Please answer all questions before submitting.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      console.log('📤 Submitting feedback...')
      
      const { error: submitError } = await supabase
        .from('responses')
        .insert([
          {
            form_id: form.id,
            answers: answers,
            submitted_at: new Date().toISOString()
          }
        ])

      if (submitError) {
        console.error('❌ Submit error:', submitError)
        throw submitError
      }

      console.log('✅ Feedback submitted successfully')
      setSubmitted(true)
    } catch (err: any) {
      console.error('❌ Error submitting feedback:', err)
      setError('Error submitting feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: Question, index: number) => {
    const answer = answers.find(a => a.questionId === question.id)

    switch (question.type) {
      case 'rating':
        return (
          <div key={question.id} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {index + 1}. {question.text}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => updateAnswer(question.id, rating)}
                  className={`p-2 transition-all hover:scale-110 ${
                    (answer?.value as number) >= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <Star className="w-10 h-10 fill-current" />
                </button>
              ))}
            </div>
            <div className="text-center mt-3 text-sm font-medium text-gray-600">
              {answer?.value ? (
                <span className="text-blue-600">{answer.value} out of 5 stars</span>
              ) : (
                'Click to rate'
              )}
            </div>
          </div>
        )

      case 'text':
        return (
          <div key={question.id} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {index + 1}. {question.text}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={answer?.value as string || ''}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Please share your thoughts..."
            />
          </div>
        )

      case 'multiple':
        return (
          <div key={question.id} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {index + 1}. {question.text}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-3">
              {question.options?.map(option => (
                <label key={option} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answer?.value === option}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading feedback form...</p>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {isFormOwner && (
            
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          )}
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Your feedback has been submitted successfully. We appreciate your time and input!
          </p>
          
          <div className="space-y-3 mb-6">
            {isFormOwner ? (
              <>
                
                  href="/dashboard"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Dashboard
                </a>
                
                  href={`/dashboard/forms/${form?.id}/responses`}
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  View All Responses
                </a>
              </>
            ) : (
              <>
                
                  href="/"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Your Own Feedback Forms
                </a>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-blue-600">QRfeedback.ai</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">{form?.title}</h1>
            {form?.description && (
              <p className="text-blue-100 text-lg">{form.description}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={submitFeedback} className="p-8">
            <div className="mb-8">
              {form?.questions.map((question, index) => renderQuestion(question, index))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 mx-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-semibold text-blue-600">QRfeedback.ai</span>
          </p>
        </div>
      </div>
    </div>
  )
}
