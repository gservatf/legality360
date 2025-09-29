import { supabase } from './supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

// Types
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  updated_at: string
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error.message)
      return null
    }
    return session
  } catch (err) {
    console.error('Exception getting session:', err)
    return null
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error.message)
      return null
    }
    return user
  } catch (err) {
    console.error('Exception getting user:', err)
    return null
  }
}

// Get current profile from profiles table
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role: 'pending'
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError.message)
          return null
        }

        return createdProfile
      }
      console.error('Error fetching profile:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Exception getting profile:', err)
    return null
  }
}

// Check if user can access client panel
export async function canAccessClientPanel(): Promise<boolean> {
  try {
    const session = await getCurrentSession()
    if (!session) return false

    const profile = await getCurrentProfile()
    if (!profile) return false

    return profile.role === 'cliente' || profile.role === 'client'
  } catch (err) {
    console.error('Exception checking client panel access:', err)
    return false
  }
}

// Sign up
export async function signUp(email: string, password: string, fullName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        }
      }
    })

    if (error) {
      console.error('Error in signUp:', error.message)
      return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
  } catch (err) {
    console.error('Exception in signUp:', err)
    return { user: null, error: 'An unexpected error occurred' }
  }
}

// Sign in
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error in signIn:', error.message)
      return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
  } catch (err) {
    console.error('Exception in signIn:', err)
    return { user: null, error: 'An unexpected error occurred' }
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error in signOut:', error.message)
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    console.error('Exception in signOut:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Create profile if not exists (legacy function for compatibility)
export async function createProfileIfNotExists(user: User) {
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role: 'pending'
        }])

      if (error) {
        console.error('Error creating profile:', error.message)
      }
    }
  } catch (err) {
    console.error('Exception creating profile:', err)
  }
}

// Export authService object for backward compatibility
export const authService = {
  signUp,
  signIn,
  signOut,
  createProfileIfNotExists,
  getCurrentProfile,
  canAccessClientPanel,
  getCurrentSession,
  getCurrentUser
}