import { createClient } from '@supabase/supabase-js'

// Debug: Log environment variables to check if they're loaded
console.log('=== Supabase Environment Variables Debug ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Not set')
console.log('=== End Debug ===')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback values for development/testing (using the provided values)
const fallbackUrl = 'https://hmmvhunhekjwcjkvzoel.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXZodW5oZWtqd2Nqa3Z6b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTczNzMsImV4cCI6MjA3NDY3MzM3M30.rFmjdb5sBQv_8jFkcdlzltW5VjIqy9qz_k--j1b5Ocg'

// Use environment variables if available, otherwise use fallback values
const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey

// Log what we're actually using
console.log('Using Supabase URL:', finalUrl)
console.log('Using Supabase Key:', finalKey ? 'Set' : 'Missing')

if (!finalUrl || !finalKey) {
  const errorMessage = 'Error: Faltan variables de entorno de Supabase. Consulte NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
  console.error(errorMessage)
  throw new Error(errorMessage)
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Log successful initialization
console.log('✅ Supabase client initialized successfully')