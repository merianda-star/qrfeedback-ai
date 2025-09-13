import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // During build time, provide dummy values
  const dummyUrl = 'https://dummy.supabase.co'
  const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.M9jrxyvPLkUVSIoJsyp2Z7ROE6rUCH9c6w3HNk-TZvs'
  
  console.warn('Supabase environment variables not found, using dummy values for build')
  
  export const createClient = () => createSupabaseClient(dummyUrl, dummyKey, {
    auth: { persistSession: false }
  })
} else {
  export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
