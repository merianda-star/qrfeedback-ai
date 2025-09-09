import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export function createClientSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// For client components
export { createClientSupabase as createClient }

// Types for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          plan: 'free' | 'starter' | 'professional' | 'enterprise'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          plan?: 'free' | 'starter' | 'professional' | 'enterprise'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          plan?: 'free' | 'starter' | 'professional' | 'enterprise'
          created_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          questions: any[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          questions?: any[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          questions?: any[]
          created_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          form_id: string
          answers: any[]
          submitted_at: string
        }
        Insert: {
          id?: string
          form_id: string
          answers: any[]
          submitted_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          answers?: any[]
          submitted_at?: string
        }
      }
    }
  }
}
