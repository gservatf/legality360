// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// -----------------------------
// Supabase Client — Versión blindada para Vite
// -----------------------------
let supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:')
    console.error('VITE_SUPABASE_URL:', supabaseUrl)
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey)
    throw new Error('Supabase environment variables missing at runtime.')
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.info('✅ Supabase client initialized successfully.')
  return supabase
}
