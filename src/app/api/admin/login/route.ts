import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.ADMIN_JWT_SECRET

    if (!adminEmail || !adminPassword || !jwtSecret) {
      console.error('Admin env vars not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Check credentials — deliberately slow comparison to prevent timing attacks
    const emailMatch = email.toLowerCase().trim() === adminEmail.toLowerCase().trim()
    const passwordMatch = password === adminPassword

    if (!emailMatch || !passwordMatch) {
      // Deliberate delay to prevent brute force
      await new Promise(r => setTimeout(r, 1000))
      return NextResponse.json({ error: 'Access denied' }, { status: 401 })
    }

    // Sign a JWT valid for 8 hours
    const secret = new TextEncoder().encode(jwtSecret)
    const token = await new SignJWT({ role: 'admin', email: adminEmail })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret)

    // Set httpOnly cookie — not accessible via JS
    const response = NextResponse.json({ success: true })
    response.cookies.set('qrf_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}