import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(): Promise<boolean> {
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
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Run all queries in parallel
  const [
    usersRes,
    newUsersWeekRes,
    newUsersMonthRes,
    newUsersToday,
    formsRes,
    responsesRes,
    responsesTodayRes,
    responsesWeekRes,
    failedAiRes,
    planBreakdownRes,
    aiUsageWeekRes,
    recentSignupsRes,
  ] = await Promise.all([
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }),
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    adminSupabase.from('forms').select('id', { count: 'exact', head: true }),
    adminSupabase.from('responses').select('id', { count: 'exact', head: true }),
    adminSupabase.from('responses').select('id', { count: 'exact', head: true }).gte('submitted_at', todayStart),
    adminSupabase.from('responses').select('id', { count: 'exact', head: true }).gte('submitted_at', sevenDaysAgo),
    adminSupabase.from('responses').select('id', { count: 'exact', head: true }).eq('ai_processed', false).lte('rating', 3),
    adminSupabase.from('profiles').select('plan'),
    adminSupabase.from('ai_usage').select('id', { count: 'exact', head: true }).gte('used_at', sevenDaysAgo),
    adminSupabase.from('profiles').select('email, full_name, business_name, plan, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  // Plan breakdown
  const plans = { free: 0, pro: 0, business: 0 }
  planBreakdownRes.data?.forEach((p: any) => {
    const plan = p.plan || 'free'
    if (plan in plans) plans[plan as keyof typeof plans]++
  })

  // Daily responses for last 7 days
  const { data: recentResponses } = await adminSupabase
    .from('responses')
    .select('submitted_at')
    .gte('submitted_at', sevenDaysAgo)
    .order('submitted_at', { ascending: true })

  const dailyResponses: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    dailyResponses[key] = 0
  }
  recentResponses?.forEach((r: any) => {
    const key = r.submitted_at?.split('T')[0]
    if (key && key in dailyResponses) dailyResponses[key]++
  })

  // Daily signups for last 7 days
  const { data: recentSignupData } = await adminSupabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', sevenDaysAgo)
  const dailySignups: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    dailySignups[key] = 0
  }
  recentSignupData?.forEach((r: any) => {
    const key = r.created_at?.split('T')[0]
    if (key && key in dailySignups) dailySignups[key]++
  })

  return NextResponse.json({
    users: {
      total: usersRes.count || 0,
      new_today: newUsersToday.count || 0,
      new_this_week: newUsersWeekRes.count || 0,
      new_this_month: newUsersMonthRes.count || 0,
      by_plan: plans,
    },
    forms: {
      total: formsRes.count || 0,
    },
    responses: {
      total: responsesRes.count || 0,
      today: responsesTodayRes.count || 0,
      this_week: responsesWeekRes.count || 0,
      daily_chart: Object.entries(dailyResponses).map(([date, count]) => ({ date, count })),
    },
    ai: {
      failed_unprocessed: failedAiRes.count || 0,
      calls_this_week: aiUsageWeekRes.count || 0,
    },
    signups: {
      daily_chart: Object.entries(dailySignups).map(([date, count]) => ({ date, count })),
      recent: recentSignupsRes.data || [],
    },
    generated_at: new Date().toISOString(),
  })
}