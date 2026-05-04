import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const formId = req.nextUrl.searchParams.get('form_id')
  if (!formId) return NextResponse.json({ error: 'Missing form_id' }, { status: 400 })

  const { data: form } = await adminSupabase
    .from('forms').select('user_id').eq('id', formId).single()
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('plan, business_name, business_type, smart_routing')
    .eq('id', form.user_id)
    .single()

  return NextResponse.json({
    plan: profile?.plan || 'free',
    business_name: profile?.business_name || '',
    business_type: profile?.business_type || 'other',
    smart_routing: profile?.smart_routing ?? true,
  })
}