import { supabase, Profile } from './supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthError {
  message: string
}

interface AuthResult {
  success: boolean
  error?: string
  user?: User | null
  data?: unknown
  profile?: Profile
}

class AuthService {
  private currentUser: (User & { profile?: Profile }) | null = null
  private currentSession: Session | null = null
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
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

      this.initialized = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      throw error
    }
  }

  private async loadUserProfile(user: User) {
    try {
      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it with pending role
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          role: 'pending' as const, // Default to pending
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          this.currentUser = { ...user, profile: newProfile }
        } else {
          this.currentUser = { ...user, profile: createdProfile }
        }
      } else if (error) {
        console.error('Error loading profile:', error)
        // Create a basic profile from user data
        this.currentUser = {
          ...user,
          profile: {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            role: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      } else {
        this.currentUser = { ...user, profile }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      // Fallback profile
      this.currentUser = {
        ...user,
        profile: {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Usuario',
          role: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
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

  async signInWithGoogle(): Promise<AuthResult> {
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

  async signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResult> {
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

      return { success: true, user: data.user }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  async signOut(): Promise<AuthResult> {
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

  getCurrentUser(): (User & { profile?: Profile }) | null {
    return this.currentUser
  }

  getCurrentProfile(): Profile | null {
    return this.currentUser?.profile || null
  }

  getCurrentSession(): Session | null {
    return this.currentSession
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.id || null
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  getUserRole(): Profile['role'] | null {
    return this.currentUser?.profile?.role || null
  }

  hasRole(role: Profile['role']): boolean {
    return this.getCurrentProfile()?.role === role
  }

  canAccessAdminPanel(): boolean {
    return this.getCurrentProfile()?.role === 'admin'
  }

  canAccessProfessionalPanel(): boolean {
    const role = this.getCurrentProfile()?.role
    return role === 'analista' || role === 'abogado'
  }

  canAccessClientPanel(): boolean {
    return this.getCurrentProfile()?.role === 'cliente'
  }

  isPending(): boolean {
    return this.getCurrentProfile()?.role === 'pending'
  }
}

export const authService = new AuthService()