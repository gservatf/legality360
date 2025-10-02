import { createClient } from '@supabase/supabase-js'

// ✅ Vite usa import.meta.env para leer variables del .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase environment variables in Vite")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
