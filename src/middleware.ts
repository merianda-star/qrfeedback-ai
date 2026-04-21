import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function verifyAdminCookie(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('qrf_admin_session')?.value
    if (!token) return false
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url)

  console.log('MW:', pathname, searchParams.toString())

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/auth/reset-password'

  // Intercept Supabase PKCE recovery tokens
  if (token_hash && type && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    url.search = `?token_hash=${token_hash}&type=${type}&next=${encodeURIComponent(next)}`
    return NextResponse.redirect(url)
  }

  // ── Admin routes — completely separate from Supabase auth ──
  if (pathname.startsWith('/qrf-admin')) {
    const isAdmin = await verifyAdminCookie(request)
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/admin-login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // If already has valid admin cookie and visits admin-login, redirect to panel
  if (pathname === '/auth/admin-login') {
    const isAdmin = await verifyAdminCookie(request)
    if (isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/qrf-admin'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── Regular Supabase auth ──
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = pathname

  if (!user && path.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (
    user &&
    path.startsWith('/auth') &&
    path !== '/auth/callback' &&
    path !== '/auth/admin-login' &&
    path !== '/auth/reset-password'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}