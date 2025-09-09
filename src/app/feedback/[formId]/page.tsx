'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Star, Send } from 'lucide-react'

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
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: formData, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', params.formId)
      .single()

    if (error || !formData) {
      setError('Form not found')
      setLoading(false)
      return
    }

    if (user && user.id === formData.user_id) {
      setIsFormOwner(true)
    }

    setForm(formData)
    const initialAnswers = formData.questions.map((question: Question) => ({
      questionId: question.id,
      value: question.type === 'rating' ? 0 : ''
    }))
    setAnswers(initialAnswers)
    setLoading(false)
  }

  const updateAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, value }
          : answer
      )
    )
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

    const { error } = await supabase
      .from('responses')
      .insert([
        {
          form_id: form.id,
          answers: answers
        }
      ])

    if (error) {
      setError('Error submitting feedback. Please try again.')
      setSubmitting(false)
    } else {
      setSubmitted(true)
    }
  }

  const renderQuestion = (question: Question, index: number) => {
    const answer = answers.find(a => a.questionId === question.id)

    switch (question.type) {
      case 'rating':
        return (
          <div key={question.id} className="mb-8">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {question.text}
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => updateAnswer(question.id, rating)}
                  className={`p-2 transition-colors ${
                    (answer?.value as number) >= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              {answer?.value ? `${answer.value} out of 5 stars` : 'Click to rate'}
            </div>
          </div>
        )

      case 'text':
        return (
          <div key={question.id} className="mb-8">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {question.text}
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
          <div key={question.id} className="mb-8">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {question.text}
            </label>
            <div className="space-y-3">
              {question.options?.map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answer?.value === option}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
            <p className="text-gray-600">
              The feedback form you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
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
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back to Form Builder
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (window.opener) {
                      window.close()
                    } else {
                      window.history.back()
                    }
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
                
                
                  href="/"
                  className="block w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg font-semibold hover:bg-green-200 transition-colors"
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{form?.title}</h1>
          {form?.description && (
            <p className="text-gray-600 text-lg">{form.description}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={submitFeedback}>
            {form?.questions.map((question, index) => renderQuestion(question, index))}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-blue-600">QRfeedback.ai</span>
          </p>
        </div>
      </div>
    </div>
  )
}
