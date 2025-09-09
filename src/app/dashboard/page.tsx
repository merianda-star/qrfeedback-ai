'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getPlanLimits } from '@/lib/utils'
import { Plus, QrCode, Eye, Edit, Trash2, BarChart3, User, LogOut } from 'lucide-react'

interface Form {
  id: string
  title: string
  description: string
  questions: any[]
  created_at: string
}

interface Profile {
  id: string
  email: string
  full_name: string
  plan: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadForms()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user)

    // Load user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    setLoading(false)
  }

  const loadForms = async () => {
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
  }

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newFormTitle.trim()) return

    setCreating(true)

    // Check plan limits
    const limits = getPlanLimits(profile?.plan || 'free')
    if (limits.forms !== 'unlimited' && forms.length >= limits.forms) {
      alert(`Free plan allows only ${limits.forms} forms. Please upgrade to create more!`)
      setCreating(false)
      return
    }

    const { data, error } = await supabase
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                QRfeedback.ai
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {profile?.full_name} ({profile?.plan})
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Limits Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>

	    <h3 className="font-semibold text-blue-900">
	    {(profile?.plan || 'free') === 'free' ? 'Free Plan' : `${profile?.plan || 'Free'} Plan`}
	    </h3>  

              <p className="text-blue-700 text-sm">
                {forms.length}/{planLimits.forms === 'unlimited' ? '∞' : planLimits.forms} forms used
              </p>
            </div>
            {profile?.plan === 'free' && (
              <Link 
                href="/pricing"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your feedback forms and view responses</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Form
          </button>
        </div>

        {/* Forms Grid */}
        {forms.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-6">Create your first feedback form to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{form.description || 'No description'}</p>
                  <div className="text-xs text-gray-500 mb-4">
                    {form.questions.length} questions • Created {new Date(form.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Form"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/forms/${form.id}/responses`}
                        className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="View Responses"
                      >
                        <BarChart3 className="w-4 h-4" />
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Form</h2>
              <form onSubmit={createForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Restaurant Feedback"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newFormDescription}
                    onChange={(e) => setNewFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of what feedback you're collecting"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
