'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Download, Star, Calendar, MessageSquare, CheckCircle } from 'lucide-react'

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

interface Response {
  id: string
  form_id: string
  answers: Answer[]
  submitted_at: string
}

export default function ResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadFormAndResponses()
  }, [])

  const loadFormAndResponses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Load form
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (formError || !formData) {
      router.push('/dashboard')
      return
    }

    setForm(formData)

    // Load responses
    const { data: responsesData, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formData.id)
      .order('submitted_at', { ascending: false })

    if (responsesData) {
      setResponses(responsesData)
    }

    setLoading(false)
  }

  const exportResponses = () => {
    if (!form || responses.length === 0) return

    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.title}-responses.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const generateCSV = () => {
    if (!form || responses.length === 0) return ''

    const headers = ['Submitted At', ...form.questions.map(q => q.text)]
    const rows = responses.map(response => [
      new Date(response.submitted_at).toLocaleString(),
      ...form.questions.map(question => {
        const answer = response.answers.find(a => a.questionId === question.id)
        return answer ? answer.value.toString() : ''
      })
    ])

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n')
  }

  const renderAnswer = (question: Question, answer: Answer | undefined) => {
    if (!answer) return <span className="text-gray-400">No answer</span>

    switch (question.type) {
      case 'rating':
        const rating = answer.value as number
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
          </div>
        )
      case 'text':
        return <p className="text-gray-700">{answer.value}</p>
      case 'multiple':
        return <span className="text-gray-700">{answer.value}</span>
      default:
        return <span className="text-gray-400">Unknown answer type</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading responses...</p>
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
              <Link href={`/dashboard/forms/${form.id}`} className="flex items-center text-gray-600 hover:text-gray-900 mr-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Form Builder
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Responses: {form.title}</h1>
            </div>
            {responses.length > 0 && (
              <button
                onClick={exportResponses}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-gray-900">{form.questions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Response</p>
                <p className="text-sm font-bold text-gray-900">
                  {responses.length > 0 
                    ? formatDateTime(responses[0].submitted_at)
                    : 'No responses yet'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Responses */}
        {responses.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-600 mb-6">Share your QR code to start collecting feedback</p>
            <Link
              href={`/dashboard/forms/${form.id}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Form Builder
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div key={response.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Response #{responses.length - index}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(response.submitted_at)}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {form.questions.map((question) => {
                    const answer = response.answers.find(a => a.questionId === question.id)
                    return (
                      <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                        <p className="font-medium text-gray-900 mb-2">{question.text}</p>
                        {renderAnswer(question, answer)}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
