import { supabase, Profile, Empresa, Caso, Tarea } from './supabase'

export class SupabaseService {
  // -----------------------------
  // Profiles
  // -----------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    return data
  }

  // -----------------------------
  // Empresas (ejemplo adicional)
  // -----------------------------
  async getEmpresas(): Promise<Empresa[]> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching empresas:', error)
      return []
    }
    return data || []
  }

  // -----------------------------
  // Casos
  // -----------------------------
  async getCases(): Promise<Caso[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cases:', error)
      return []
    }
    return data || []
  }

  async getCaseById(caseId: string): Promise<Caso | null> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (error) {
      console.error('Error fetching case:', error)
      return null
    }
    return data
  }

  // -----------------------------
  // Tareas
  // -----------------------------
  async getTasks(): Promise<Tarea[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
    return data || []
  }
}

export const supabaseService = new SupabaseService()
