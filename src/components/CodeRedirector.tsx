'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CodeRedirectorInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/auth/reset-password'

    if (token_hash && type) {
      router.replace(
        `/auth/callback?token_hash=${token_hash}&type=${type}&next=${encodeURIComponent(next)}`
      )
    } else if (code) {
      router.replace(
        `/auth/callback?code=${code}&next=${encodeURIComponent(next)}`
      )
    }
  }, [])

  return null
}

export default function CodeRedirector() {
  return (
    <Suspense fallback={null}>
      <CodeRedirectorInner />
    </Suspense>
  )
}