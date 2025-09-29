import { supabase } from './supabase'
import { Profile } from './supabase'

class AuthService {
  private currentUser: any = null
  private currentProfile: Profile | null = null
  private initialized = false

  async initialize() {
    try {
      console.log('Initializing AuthService...')
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return
      }

      if (session?.user) {
        this.currentUser = session.user
        console.log('User session found:', session.user.id)
        
        // Always fetch profile from database
        await this.loadProfile(session.user.id)
      } else {
        console.log('No active session found')
        this.currentUser = null
        this.currentProfile = null
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          this.currentUser = session.user
          await this.loadProfile(session.user.id)
        } else {
          this.currentUser = null
          this.currentProfile = null
        }
      })

      this.initialized = true
      console.log('AuthService initialized successfully')
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.initialized = true
    }
  }

  async loadProfile(userId: string) {
    try {
      console.log('Loading profile for user:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating basic profile...')
          const basicProfile: Profile = {
            id: userId,
            email: this.currentUser?.email || '',
            full_name: this.currentUser?.user_metadata?.full_name || 'Usuario',
            role: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          this.currentProfile = basicProfile
          return basicProfile
        }
        
        this.currentProfile = null
        return null
      }

      console.log('Profile loaded from database:', profile)
      this.currentProfile = profile
      return profile
    } catch (error) {
      console.error('Error in loadProfile:', error)
      this.currentProfile = null
      return null
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      if (data.user) {
        console.log('Sign in successful for user:', data.user.id)
        this.currentUser = data.user
        
        // Load profile immediately after sign in
        await this.loadProfile(data.user.id)
      }

      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  async signUp(email: string, password: string, fullName: string) {
    try {
      console.log('Attempting sign up for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        throw error
      }

      if (data.user) {
        console.log('Sign up successful for user:', data.user.id)
        this.currentUser = data.user
        
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Load the newly created profile
        await this.loadProfile(data.user.id)
      }

      return data
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  async signInWithGoogle() {
    try {
      console.log('Attempting Google sign in')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
    }
  }

  async signOut() {
    try {
      console.log('Signing out...')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      this.currentUser = null
      this.currentProfile = null
      console.log('Sign out successful')
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  // Add the missing refreshProfile method
  async refreshProfile(): Promise<Profile | null> {
    if (!this.currentUser) {
      console.log('No current user to refresh profile for')
      return null
    }
    
    console.log('Refreshing profile for user:', this.currentUser.id)
    return await this.loadProfile(this.currentUser.id)
  }

  getCurrentUser() {
    return this.currentUser
  }

  getCurrentProfile(): Profile | null {
    return this.currentProfile
  }

  isInitialized() {
    return this.initialized
  }

  // Permission checks
  canAccessAdminPanel(): boolean {
    return this.currentProfile?.role === 'admin'
  }

  canAccessProfessionalPanel(): boolean {
    return this.currentProfile?.role === 'analista' || this.currentProfile?.role === 'abogado'
  }

  canAccessClientPanel(): boolean {
    return this.currentProfile?.role === 'cliente'
  }

  // Get redirect path based on role
  getRedirectPath(): string {
    if (!this.currentProfile) {
      console.log('No profile found, redirecting to pending')
      return '/pending'
    }

    console.log('Getting redirect path for role:', this.currentProfile.role)

    switch (this.currentProfile.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'analista':
        return '/analista/dashboard'
      case 'abogado':
        return '/abogado/dashboard'
      case 'cliente':
        return '/cliente/dashboard'
      case 'pending':
      default:
        return '/pending'
    }
  }
}

export const authService = new AuthService()