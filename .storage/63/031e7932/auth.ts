import { supabase, Profile } from './supabase'
import { User, Session } from '@supabase/supabase-js'

class AuthService {
  private currentUser: Profile | null = null
  private currentSession: Session | null = null

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      this.currentSession = session
      await this.loadUserProfile(session.user)
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentSession = session
      if (session?.user) {
        await this.loadUserProfile(session.user)
      } else {
        this.currentUser = null
      }
    })
  }

  private async loadUserProfile(user: User) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      this.currentUser = profile
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        await this.loadUserProfile(data.user)
      }

      return { success: true, user: data.user }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
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

      return { success: true, data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  async signUp(email: string, password: string, fullName: string, role: 'cliente' | 'analista' = 'cliente') {
    try {
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

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: role
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { success: true, user: data.user }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      this.currentUser = null
      this.currentSession = null
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  getCurrentUser(): Profile | null {
    return this.currentUser
  }

  getCurrentSession(): Session | null {
    return this.currentSession
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && !!this.currentUser
  }

  getUserRole(): string | null {
    return this.currentUser?.role || null
  }

  getUserId(): string | null {
    return this.currentUser?.id || null
  }

  getClientId(): string | null {
    if (this.currentUser?.role === 'cliente') {
      return this.currentUser.id
    }
    return this.currentUser?.client_id || null
  }

  // Create collaborator profile
  async createCollaborator(email: string, fullName: string, clientId: string) {
    try {
      // First, invite the user to sign up
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role: 'colaborador',
          client_id: clientId
        }
      })

      if (error) throw error

      return { success: true, data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Profile>) {
    try {
      if (!this.currentUser) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single()

      if (error) throw error

      this.currentUser = { ...this.currentUser, ...data }
      return { success: true, profile: data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }
}

export const authService = new AuthService()