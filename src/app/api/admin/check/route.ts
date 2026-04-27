import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/supabase-server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ isAdmin: false })

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ isAdmin: !!profile?.is_admin })
}