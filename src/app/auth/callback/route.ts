import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // THE FIX: Safely determine the real origin when behind a proxy like Ngrok
  const forwardedHost = request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const origin = forwardedHost ? `${protocol}://${forwardedHost}` : request.nextUrl.origin

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('CALLBACK HIT:', { code, token_hash, type, next, origin })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (!error) {
      // Redirect using our safely calculated origin
      const redirectUrl = new URL(`${origin}${next}`)
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('exchangeCode result:', { error, redirectingTo: `${origin}${next}` })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log('CALLBACK FAILED — redirecting to login')
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}