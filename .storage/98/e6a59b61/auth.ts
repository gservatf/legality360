import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './supabase'

class AuthService {
  private currentUser: User | null = null
  private currentProfile: Profile | null = null
  private initialized = false

  async initialize() {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return
      }

      if (session?.user) {
        this.currentUser = session.user
        console.log('Session user found:', session.user.id)
        
        // Load profile from database
        await this.loadProfile(session.user.id)
      } else {
        console.log('No active session found')
        this.currentUser = null
        this.currentProfile = null
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          this.currentUser = session.user
          await this.loadProfile(session.user.id)
        } else {
          this.currentUser = null
          this.currentProfile = null
        }
      })

      this.initialized = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.initialized = true // Mark as initialized even on error
    }
  }

  private async loadProfile(userId: string) {
    try {
      console.log('Loading profile for user:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        this.currentProfile = null
        return
      }

      console.log('Profile loaded:', profile)
      this.currentProfile = profile
    } catch (error) {
      console.error('Profile loading error:', error)
      this.currentProfile = null
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        this.currentUser = data.user
        console.log('Sign in successful, loading profile for:', data.user.id)
        
        // Load profile after successful sign in
        await this.loadProfile(data.user.id)
      }

      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error

      // Profile will be created by the database trigger
      // and loaded by the auth state change listener

      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      this.currentUser = null
      this.currentProfile = null
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getCurrentProfile(): Profile | null {
    return this.currentProfile
  }

  isInitialized(): boolean {
    return this.initialized
  }

  // Role-based access control
  canAccessAdminPanel(): boolean {
    return this.currentProfile?.role === 'admin'
  }

  canAccessProfessionalPanel(): boolean {
    return this.currentProfile?.role === 'analista' || this.currentProfile?.role === 'abogado'
  }

  canAccessClientPanel(): boolean {
    return this.currentProfile?.role === 'cliente'
  }

  // Force refresh profile from database
  async refreshProfile(): Promise<Profile | null> {
    if (!this.currentUser) return null
    
    await this.loadProfile(this.currentUser.id)
    return this.currentProfile
  }
}

export const authService = new AuthService()