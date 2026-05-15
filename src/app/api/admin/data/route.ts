import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(req: NextRequest): Promise<{ ok: boolean; userId?: string; isMasterAdmin?: boolean }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false }
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin, is_master_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) return { ok: false }
    return { ok: true, userId: user.id, isMasterAdmin: !!profile.is_master_admin }
  } catch { return { ok: false } }
}

export async function GET(req: NextRequest) {
  const auth = await isAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Users ─────────────────────────────────────────────────────────────────
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, email, plan, business_name, created_at, trial_ends_at, is_admin, is_master_admin')
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
      is_admin: !!p.is_admin,
      is_master_admin: !!p.is_master_admin,
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

  // ── Admins list ────────────────────────────────────────────────────────────
  const admins = users
    .filter(u => u.is_admin)
    .map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      is_master_admin: u.is_master_admin,
    }))

  // ── Activity data — last 7 days ────────────────────────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const { data: activityRaw } = await adminSupabase
    .from('user_activity')
    .select('id, user_id, event_type, page, created_at')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(2000)

  // Aggregate by day
  const dayMap: Record<string, { visits: number; signins: number; uniqueUsers: Set<string> }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dayMap[key] = { visits: 0, signins: 0, uniqueUsers: new Set() }
  }

  activityRaw?.forEach(a => {
    const key = a.created_at.split('T')[0]
    if (!dayMap[key]) return
    dayMap[key].uniqueUsers.add(a.user_id)
    if (a.event_type === 'signin') dayMap[key].signins++
    else dayMap[key].visits++
  })

  const activityDays = Object.entries(dayMap).map(([date, d]) => ({
    date,
    visits: d.visits,
    signins: d.signins,
    unique_users: d.uniqueUsers.size,
    total: d.visits + d.signins,
  }))

  // Recent activity with user info
  const profileEmailMap: Record<string, string> = {}
  const profileNameMap: Record<string, string | null> = {}
  profiles?.forEach(p => {
    profileEmailMap[p.id] = p.email || ''
    profileNameMap[p.id] = p.full_name
  })

  const recentActivity = (activityRaw || []).slice(0, 50).map(a => ({
    id: a.id,
    user_id: a.user_id,
    user_email: profileEmailMap[a.user_id] || 'Unknown',
    user_name: profileNameMap[a.user_id] || null,
    event_type: a.event_type,
    page: a.page,
    created_at: a.created_at,
  }))

  // Today's summary
  const todayKey = new Date().toISOString().split('T')[0]
  const todayStats = dayMap[todayKey] || { visits: 0, signins: 0, uniqueUsers: new Set() }

  return NextResponse.json({
    users,
    stats,
    failedAI: failedAIResponses,
    isMasterAdmin: auth.isMasterAdmin,
    admins,
    activityDays,
    recentActivity,
    todayStats: {
      visits: todayStats.visits,
      signins: todayStats.signins,
      unique_users: todayStats.uniqueUsers.size,
    },
  })
}