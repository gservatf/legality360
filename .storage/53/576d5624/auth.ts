import { supabase, Profile } from './supabase'
import { User } from '@supabase/supabase-js'

class AuthService {
  private currentUser: (User & { profile?: Profile }) | null = null

  async initialize() {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      await this.loadUserProfile(session.user)
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
      }
    })
  }

  private async loadUserProfile(user: User) {
    try {
      // Get or create user profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile: Omit<Profile, 'created_at' | 'updated_at'> = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          role: 'cliente', // Default role
          client_id: null
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          return
        }

        profile = createdProfile
      } else if (error) {
        console.error('Error loading profile:', error)
        return
      }

      this.currentUser = { ...user, profile }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signUpWithEmail(email: string, password: string, fullName: string, role: Profile['role'] = 'cliente') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })

    if (error) throw error
    return data
  }

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    this.currentUser = null
  }

  getCurrentUser() {
    return this.currentUser
  }

  getCurrentProfile(): Profile | null {
    return this.currentUser?.profile || null
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.id || null
  }

  getCurrentClientId(): string | null {
    const profile = this.getCurrentProfile()
    if (profile?.role === 'cliente') {
      return profile.id // For clients, their profile ID is their client ID
    }
    return profile?.client_id || null
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  hasRole(role: Profile['role']): boolean {
    return this.getCurrentProfile()?.role === role
  }

  canAccessClientPortal(): boolean {
    const role = this.getCurrentProfile()?.role
    return role === 'cliente' || role === 'colaborador'
  }

  canAccessAnalystModule(): boolean {
    const role = this.getCurrentProfile()?.role
    return role === 'analista' || role === 'admin'
  }

  canAccessAdminPanel(): boolean {
    return this.getCurrentProfile()?.role === 'admin'
  }
}

export const authService = new AuthService()