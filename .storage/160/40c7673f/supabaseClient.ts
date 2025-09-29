import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmmvhunhekjwcjkvzoel.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXZodW5oZWtqd2Nqa3Z6b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTczNzMsImV4cCI6MjA3NDY3MzM3M30.rFmjdb5sBQv_8jFkcdlzltW5VjIqy9qz_k--j1b5Ocg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)