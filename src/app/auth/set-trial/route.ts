import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    // Profile row is created by a Supabase trigger after signUp —
    // retry up to 5 times with 800ms gaps to wait for it to exist
    let success = false
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 800))
      }

      // Check if profile exists first
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (!profile) continue // not created yet, retry

      const { error } = await adminSupabase
        .from('profiles')
        .update({
          plan: 'pro',
          trial_ends_at: trialEndsAt.toISOString(),
        })
        .eq('id', userId)

      if (!error) { success = true; break }
    }

    if (!success) return NextResponse.json({ error: 'Profile not ready' }, { status: 500 })
    return NextResponse.json({ success: true, trial_ends_at: trialEndsAt.toISOString() })
  } catch (err) {
    console.error('Set trial error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}