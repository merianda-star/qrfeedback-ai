'use client'

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Environment Variables</h1>
      <div className="space-y-2">
        <p><strong>Supabase URL:</strong> {supabaseUrl || 'NOT FOUND'}</p>
        <p><strong>Supabase Key:</strong> {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND'}</p>
        <p><strong>Current Host:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server'}</p>
      </div>
    </div>
  )
}
