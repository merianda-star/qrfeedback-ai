import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('qrf_admin_session')?.value
    if (!token) return NextResponse.json({ isAdmin: false })

    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
    await jwtVerify(token, secret)

    return NextResponse.json({ isAdmin: true })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}