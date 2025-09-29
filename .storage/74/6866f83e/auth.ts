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
          // Use a basic profile if database creation fails
          this.currentUser = {
            ...user,
            profile: {
              ...newProfile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as Profile
          }
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
            role: 'cliente',
            client_id: null,
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
          role: 'cliente',
          client_id: null,
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

  async signUpWithEmail(email: string, password: string, fullName: string, role: 'cliente' | 'analista' = 'cliente'): Promise<AuthResult> {
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

  getCurrentClientId(): string | null {
    const profile = this.getCurrentProfile()
    if (profile?.role === 'cliente') {
      return profile.id
    }
    return profile?.client_id || null
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  getUserRole(): string | null {
    return this.currentUser?.profile?.role || null
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

  // Admin functions
  async getAllUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  async updateUserRole(userId: string, newRole: Profile['role']): Promise<AuthResult> {
    try {
      if (!this.canAccessAdminPanel()) {
        throw new Error('No tienes permisos para realizar esta acción')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { success: true, profile: data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  async deactivateUser(userId: string): Promise<AuthResult> {
    try {
      if (!this.canAccessAdminPanel()) {
        throw new Error('No tienes permisos para realizar esta acción')
      }

      // For now, we'll use a role change to indicate deactivation
      // In a full implementation, you might add an 'active' field
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { success: true, profile: data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  // Create collaborator profile
  async createCollaborator(email: string, fullName: string, clientId: string): Promise<AuthResult> {
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
  async updateProfile(updates: Partial<Profile>): Promise<AuthResult> {
    try {
      if (!this.currentUser?.profile) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)
        .select()
        .single()

      if (error) throw error

      this.currentUser.profile = { ...this.currentUser.profile, ...data }
      return { success: true, profile: data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }
}

export const authService = new AuthService()