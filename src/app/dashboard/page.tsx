'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getPlanLimits } from '@/lib/pricing'
import { Plus, QrCode, Edit, Trash2, BarChart3, LogOut, Crown, User, Home, AlertCircle, RefreshCw } from 'lucide-react'

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
  user_id: string
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
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Load user and forms on mount
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        console.log('🔄 Initializing dashboard...')
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.log('❌ No user found, redirecting to login')
          router.push('/auth/login')
          return
        }

        if (!mounted) return

        console.log('✅ User authenticated:', user.id)
        setUser(user as AuthUser)

        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('❌ Profile load error:', profileError)
        } else if (profileData && mounted) {
          console.log('✅ Profile loaded:', profileData.plan)
          setProfile(profileData)
        }

        // Load forms
        console.log('📋 Loading forms for user:', user.id)
        const { data: formsData, error: formsError } = await supabase
          .from('forms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (formsError) {
          console.error('❌ Forms load error:', formsError)
          if (mounted) {
            showToast('Error loading forms: ' + formsError.message, 'error')
          }
        } else {
          console.log('✅ Forms loaded:', formsData?.length || 0, 'forms')
          console.log('📊 Forms data:', JSON.stringify(formsData, null, 2))
          if (mounted && formsData) {
            setForms(formsData)
          }
        }

      } catch (error) {
        console.error('❌ Initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, []) // Only run once on mount

  const refreshForms = async () => {
    if (!user) return

    setRefreshing(true)
    console.log('🔄 Refreshing forms...')

    try {
      const { data: formsData, error } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Refresh error:', error)
        showToast('Error refreshing forms', 'error')
      } else {
        console.log('✅ Forms refreshed:', formsData?.length || 0, 'forms')
        setForms(formsData || [])
        showToast('Forms refreshed!', 'success')
      }
    } catch (error) {
      console.error('❌ Unexpected refresh error:', error)
      showToast('Error refreshing forms', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newFormTitle.trim()) {
      console.log('❌ Cannot create form: missing user or title')
      return
    }

    const limits = getPlanLimits(profile?.plan || 'free')
    if (limits.forms !== 'unlimited' && typeof limits.forms === 'number' && forms.length >= limits.forms) {
      showToast(`Your ${profile?.plan || 'free'} plan allows only ${limits.forms} forms. Please upgrade!`, 'error')
      return
    }

    setCreating(true)
    const titleToCreate = newFormTitle.trim()
    const descToCreate = newFormDescription.trim()

    console.log('📝 Creating form:', {
      title: titleToCreate,
      description: descToCreate,
      user_id: user.id
    })

    try {
      const { data, error } = await supabase
        .from('forms')
        .insert([
          {
            user_id: user.id,
            title: titleToCreate,
            description: descToCreate,
            questions: []
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('❌ Form creation error:', error)
        showToast('Error creating form: ' + error.message, 'error')
        setCreating(false)
        return
      }

      console.log('✅ Form created successfully:', data)
      
      // Close modal and clear inputs
      setShowCreateForm(false)
      setNewFormTitle('')
      setNewFormDescription('')
      
      // Show success message
      showToast('Form created! Click Edit to add questions.', 'success')

      // Wait a moment then refresh to ensure we get the latest data
      setTimeout(async () => {
        console.log('🔄 Reloading forms after creation...')
        const { data: updatedForms, error: reloadError } = await supabase
          .from('forms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (reloadError) {
          console.error('❌ Reload error:', reloadError)
          // Fallback: just add to existing list
          setForms(prev => [data, ...prev])
        } else {
          console.log('✅ Forms reloaded:', updatedForms?.length || 0, 'forms')
          setForms(updatedForms || [])
        }
        
        setCreating(false)
      }, 500)

    } catch (err) {
      console.error('❌ Unexpected error creating form:', err)
      showToast('Unexpected error. Please try again.', 'error')
      setCreating(false)
    }
  }

  const deleteForm = async (formId: string) => {
    console.log('🗑️ Delete requested for form:', formId)
    
    const confirmed = confirm('Are you sure you want to delete this form? This action cannot be undone.')
    
    if (!confirmed) {
      console.log('❌ Delete cancelled by user')
      return
    }

    const formToDelete = forms.find(f => f.id === formId)
    if (!formToDelete) {
      console.error('❌ Form not found in state:', formId)
      return
    }

    console.log('🗑️ Deleting form:', formToDelete.title)
    
    // Optimistically remove from UI
    setForms(prev => prev.filter(f => f.id !== formId))
    showToast('Deleting form...', 'success')

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('user_id', user?.id) // Extra safety check

      if (error) {
        console.error('❌ Delete error:', error)
        // Restore form
        setForms(prev => [formToDelete, ...prev].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
        showToast('Error deleting form: ' + error.message, 'error')
      } else {
        console.log('✅ Form deleted successfully')
        showToast('Form deleted successfully!', 'success')
      }
    } catch (err) {
      console.error('❌ Unexpected delete error:', err)
      // Restore form
      setForms(prev => [formToDelete, ...prev].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
      showToast('Error deleting form. Please try again.', 'error')
    }
  }

  const logout = async () => {
    console.log('👋 Logging out...')
    showToast('Logging out...', 'success')
    
    // Clear state immediately
    setUser(null)
    setProfile(null)
    setForms([])
    
    // Navigate home
    router.push('/')
    
    // Sign out in background
    try {
      await supabase.auth.signOut()
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
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
                  Get unlimited forms, 500 responses/month, advanced analytics, and priority support
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
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <button
                onClick={refreshForms}
                disabled={refreshing}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Refresh forms"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {planName === 'free' && (
                <Link 
                  href="/pricing"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {planLimits.forms !== 'unlimited' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
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
            disabled={creating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
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

                  {/* Helper message for forms without questions */}
                  {form.questions.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-yellow-800 font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Click <strong>Edit</strong> below to add questions and activate this form!</span>
                      </p>
                    </div>
                  )}
                  
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
                  Upgrade to Pro to create unlimited forms, collect up to 500 responses per month, 
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
                    autoFocus
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
                    💡 After creating the form, click <strong>Edit</strong> to add questions and generate a QR code
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
                    disabled={creating}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newFormTitle.trim()}
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
