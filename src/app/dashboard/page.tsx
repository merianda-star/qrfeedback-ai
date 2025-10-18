'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getPlanLimits } from '@/lib/pricing'
import { Plus, QrCode, Edit, Trash2, BarChart3, LogOut, Crown, User, Home } from 'lucide-react'

interface Question {
  id: string
  type: string
  text: string
  options?: string[]
}

interface Form {
  id: string
  title: string
  description: string
  questions: Question[]
  created_at: string
}

interface Profile {
  id: string
  email: string
  full_name: string
  plan: string
}

interface AuthUser {
  id: string
  email?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user as AuthUser)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    setLoading(false)
  }, [supabase, router])

  const loadForms = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data: formsData } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (formsData) {
      setForms(formsData)
    }
  }, [supabase])

  useEffect(() => {
    checkUser()
    loadForms()
  }, [checkUser, loadForms])

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newFormTitle.trim()) return

    setCreating(true)

    const limits = getPlanLimits(profile?.plan || 'free')
    if (limits.forms !== 'unlimited' && typeof limits.forms === 'number' && forms.length >= limits.forms) {
      alert(`Your ${profile?.plan || 'free'} plan allows only ${limits.forms} forms. Please upgrade to create more!`)
      setCreating(false)
      return
    }

    const { error } = await supabase
      .from('forms')
      .insert([
        {
          user_id: user.id,
          title: newFormTitle,
          description: newFormDescription,
          questions: []
        }
      ])
      .select()

    if (error) {
      alert('Error creating form: ' + error.message)
    } else {
      setShowCreateForm(false)
      setNewFormTitle('')
      setNewFormDescription('')
      loadForms()
    }

    setCreating(false)
  }

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', formId)

    if (error) {
      alert('Error deleting form: ' + error.message)
    } else {
      loadForms()
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const planLimits = getPlanLimits(profile?.plan || 'free')
  const planName = profile?.plan || 'free'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <QrCode className="w-6 h-6 text-blue-600 mr-2" />
              <Link href="/" className="text-xl font-bold text-gray-900">
                QRfeedback.ai
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="flex items-center text-blue-600 font-medium"
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <Link 
                href="/pricing" 
                className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                <Crown className="w-4 h-4 mr-1" />
                {planName === 'free' ? 'Upgrade' : 'Manage Plan'}
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Plan Badge */}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                planName === 'free' 
                  ? 'bg-gray-100 text-gray-700' 
                  : planName === 'pro'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {planName.toUpperCase()} PLAN
              </span>

              {/* User Info */}
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {profile?.full_name || user?.email}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Banner for Free Users */}
        {planName === 'free' && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Crown className="w-6 h-6 mr-2" />
                  <h3 className="text-xl font-semibold">Unlock More Features with Pro</h3>
                </div>
                <p className="text-white/90">
                  Get unlimited forms, 1,000 responses/month, advanced analytics, and priority support
                </p>
              </div>
              <Link
                href="/pricing"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                View Plans
              </Link>
            </div>
          </div>
        )}

        {/* Plan Usage Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                Your {planName.charAt(0).toUpperCase() + planName.slice(1)} Plan
              </h3>  
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  Forms: <strong>{forms.length}/{planLimits.forms === 'unlimited' ? '∞' : planLimits.forms}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Responses Limit: <strong>{planLimits.responses === 'unlimited' ? '∞' : planLimits.responses}/month</strong>
                </span>
              </div>
            </div>
            {planName === 'free' && (
              <Link 
                href="/pricing"
                className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade Plan
              </Link>
            )}
          </div>

          {/* Progress Bar */}
          {planLimits.forms !== 'unlimited' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    forms.length >= planLimits.forms ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min((forms.length / (planLimits.forms as number)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
            <p className="text-gray-600 mt-1">Create, manage, and analyze your feedback forms</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </button>
        </div>

        {/* Forms Grid */}
        {forms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first feedback form to start collecting customer insights via QR codes
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {form.title}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-2 ${
                      form.questions.length === 0 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {form.questions.length === 0 ? 'Draft' : 'Active'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {form.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4 space-x-3">
                    <span className="flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {form.questions.length} questions
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(form.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/dashboard/forms/${form.id}`}
                      className="flex-1 flex items-center justify-center text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/forms/${form.id}/responses`}
                      className="flex-1 flex items-center justify-center text-green-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Responses
                    </Link>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pro Tip for Free Users */}
        {planName === 'free' && forms.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Crown className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                <p className="text-blue-800 text-sm">
                  Upgrade to Pro to create unlimited forms, collect up to 1,000 responses per month, 
                  and access advanced analytics to better understand your customers.
                </p>
                <Link 
                  href="/pricing"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
                >
                  Compare plans →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create New Form</h2>
              <p className="text-gray-600 text-sm mb-6">
                Start by giving your feedback form a title and description
              </p>
              
              <form onSubmit={createForm} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Title *
                  </label>
                  <input
                    type="text"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Restaurant Feedback Survey"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newFormDescription}
                    onChange={(e) => setNewFormDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of what feedback you're collecting"
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 After creating the form, you'll be able to add questions and generate a QR code
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewFormTitle('')
                      setNewFormDescription('')
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create Form'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

