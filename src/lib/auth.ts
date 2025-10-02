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

// Sign in with email and password (no profile creation here)
export async function signIn(email: string, password: string): Promise<{ user: User | null, profile: UserProfile | null, error: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { user: null, profile: null, error };
    }
    const user = data.user;
    return { user, profile: null, error: null };
  } catch (err: any) {
    return { user: null, profile: null, error: err };
  }
}

// Sign in with Google OAuth (no profile creation or user fetch here)
export async function signInWithGoogle(): Promise<{ user: User | null, profile: UserProfile | null, error: any }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      return { user: null, profile: null, error };
    }
    // After OAuth, user/profile will be available after redirect
    return { user: null, profile: null, error: null };
  } catch (err: any) {
    return { user: null, profile: null, error: err };
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

// Sign up with email and password, and create profile with role 'pending'
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User | null, profile: UserProfile | null, error: any }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error || !data.user) {
      return { user: null, profile: null, error };
    }

    const user = data.user;

    // Create profile in 'profiles' table
    const newProfile = {
      id: user.id,
      email: user.email || '',
      full_name: fullName,
      role: 'pending'
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      return { user, profile: null, error: createError };
    }

    return { user, profile: createdProfile, error: null };
  } catch (err: any) {
    return { user: null, profile: null, error: err };
  }
}

// Export authService object for backward compatibility
export const authService = {
  getCurrentSession,
  getCurrentUser,
  getCurrentProfile,
  signOut,
  signIn,
  signInWithGoogle,
  signUp
}

// Devuelve true si el perfil tiene rol 'cliente'
export function canAccessClientPanel(profile: UserProfile | null): boolean {
  return profile?.role === 'cliente';
}