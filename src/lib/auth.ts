import { supabase } from './supabase' // 🔒 Usa siempre el mismo cliente
import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'pending' | 'cliente' | 'analista' | 'abogado' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at?: string
  updated_at?: string
  status?: 'ACTIVE' | 'PENDING'
}

// -----------------------------
// Session & User
// -----------------------------
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (err) {
    console.error('Error getting session:', err)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (err) {
    console.error('Error getting user:', err)
    return null
  }
}

// -----------------------------
// Profile
// -----------------------------
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at') // 🔒 evita recursion
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Si no existe perfil, lo creamos con rol pending
    if (!data) {
      const newProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: 'pending',
        status: 'PENDING'
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) throw createError
      return createdProfile
    }

    return {
      ...data,
      status: data.role === 'pending' ? 'PENDING' : 'ACTIVE'
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
    return null
  }
}

// -----------------------------
// Sign In / Out / Up
// -----------------------------
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return { user: null, profile: null, error }
  }
  const profile = await getCurrentProfile()
  return { user: data.user, profile, error: null }
}

export async function signInWithGoogle() {
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    return { user: null, profile: null, error: null }
  } catch (err: any) {
    return { user: null, profile: null, error: err }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return error ? { error: error.message } : { error: null }
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })

  if (error || !data.user) {
    return { user: null, profile: null, error }
  }

  const newProfile: UserProfile = {
    id: data.user.id,
    email: data.user.email || '',
    full_name: fullName,
    role: 'pending',
    status: 'PENDING'
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single()

  if (createError) {
    return { user: data.user, profile: null, error: createError }
  }

  return { user: data.user, profile: createdProfile, error: null }
}

// -----------------------------
// Utilities
// -----------------------------
export const authService = {
  getCurrentSession,
  getCurrentUser,
  getCurrentProfile,
  signOut,
  signIn,
  signInWithGoogle,
  signUp
}

export const isAdmin = (profile: UserProfile | null) => profile?.role === 'admin'
export const canAccessClientPanel = (profile: UserProfile | null) => profile?.role === 'cliente'
