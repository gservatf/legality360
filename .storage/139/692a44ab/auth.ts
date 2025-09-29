import { supabase } from './supabase'

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Create profile if user was created successfully
    if (data.user) {
      await createProfileIfNotExists(data.user.id, email, fullName)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error signing up:', error)
    return { success: false, error: error.message }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Create profile if it doesn't exist (for existing users)
    if (data.user) {
      await createProfileIfNotExists(data.user.id, email, data.user.user_metadata?.full_name || '')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error signing in:', error)
    return { success: false, error: error.message }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error)
    return { success: false, error: error.message }
  }
}

export const createProfileIfNotExists = async (userId: string, email: string, fullName: string) => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return { success: true, data: existingProfile }
    }

    // Create new profile with 'pending' role
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          full_name: fullName,
          role: 'pending',
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating profile:', error)
    return { success: false, error: error.message }
  }
}

// Export authService object that groups all functions
export const authService = {
  signIn,
  signUp,
  signOut,
  createProfileIfNotExists,
}