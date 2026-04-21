import { NextResponse } from 'next/server'

// This route is no longer used — admin auth is handled via JWT cookie
// Kept as a stub to avoid 404s from any cached references
export async function POST() {
  return NextResponse.json({ isAdmin: false })
}