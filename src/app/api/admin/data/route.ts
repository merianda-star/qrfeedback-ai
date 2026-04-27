import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: profile } = await adminSupabase
      .from('profiles').select('is_admin').eq('id', user.id).single()
    return !!profile?.is_admin
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profiles } = await adminSupabase
    .from('profiles').select('id, full_name, email, plan, business_name, created_at, trial_ends_at')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
  const authMap: Record<string, any> = {}
  authUsers?.users?.forEach(u => { authMap[u.id] = u })

  const { data: forms } = await adminSupabase.from('forms').select('id, user_id, title')
  const formMap: Record<string, number> = {}
  const formTitleMap: Record<string, string> = {}
  const formToUser: Record<string, string> = {}
  forms?.forEach(f => {
    formMap[f.user_id] = (formMap[f.user_id] || 0) + 1
    formTitleMap[f.id] = f.title || 'Unknown Form'
    formToUser[f.id] = f.user_id
  })

  const { data: responses } = await adminSupabase
    .from('responses').select('id, form_id, ai_processed, rating, answers, submitted_at')
  const responseMap: Record<string, number> = {}
  const failedAIMap: Record<string, number> = {}
  responses?.forEach(r => {
    const uid = formToUser[r.form_id]
    if (!uid) return
    responseMap[uid] = (responseMap[uid] || 0) + 1
    if (!r.ai_processed && r.rating <= 3) failedAIMap[uid] = (failedAIMap[uid] || 0) + 1
  })

  const users = (profiles || []).map(p => {
    const auth = authMap[p.id] || {}
    return {
      id: p.id, email: p.email || auth.email || '',
      full_name: p.full_name, plan: p.plan || 'free',
      business_name: p.business_name, created_at: p.created_at,
      email_confirmed_at: auth.email_confirmed_at || null,
      last_sign_in_at: auth.last_sign_in_at || null,
      form_count: formMap[p.id] || 0,
      response_count: responseMap[p.id] || 0,
      failed_ai_count: failedAIMap[p.id] || 0,
      trial_ends_at: p.trial_ends_at || null,
    }
  })

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const stats = {
    total_users: users.length,
    free_users: users.filter(u => u.plan === 'free').length,
    pro_users: users.filter(u => u.plan === 'pro').length,
    business_users: users.filter(u => u.plan === 'business').length,
    total_responses: responses?.length || 0,
    total_forms: forms?.length || 0,
    failed_ai: responses?.filter(r => !r.ai_processed && r.rating <= 3).length || 0,
    new_this_week: users.filter(u => u.created_at > oneWeekAgo).length,
  }

  const failedAIResponses = (responses || [])
    .filter(r => !r.ai_processed && r.rating <= 3).slice(0, 50)
    .map(r => {
      const uid = formToUser[r.form_id]
      const profile = profiles?.find(p => p.id === uid)
      return {
        id: r.id, form_id: r.form_id, rating: r.rating,
        answers: r.answers, submitted_at: r.submitted_at,
        email: profile?.email || '',
        form_title: formTitleMap[r.form_id] || 'Unknown Form',
      }
    })

  return NextResponse.json({ users, stats, failedAI: failedAIResponses })
}