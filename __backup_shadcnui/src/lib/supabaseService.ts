import { supabase, Profile, Client, Case, Task, BMCRisk, TaskComment, ClientCollaborator } from './supabase'
import { authService } from './auth'

export class SupabaseService {
  // Profile operations
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

  // Client operations
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }

    return data || []
  }

  async getClientById(clientId: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      return null
    }

    return data
  }

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return null
    }

    return data
  }

  // Case operations
  async getCases(): Promise<Case[]> {
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

  async getCasesByClientId(clientId: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cases:', error)
      return []
    }

    return data || []
  }

  async getCaseById(caseId: string): Promise<Case | null> {
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

  async createCase(caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>): Promise<Case | null> {
    const { data, error } = await supabase
      .from('cases')
      .insert([caseData])
      .select()
      .single()

    if (error) {
      console.error('Error creating case:', error)
      return null
    }

    return data
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
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

  async getTasksByCaseId(caseId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return data || []
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error) {
      console.error('Error fetching task:', error)
      return null
    }

    return data
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return null
    }

    return data
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return null
    }

    return data
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return false
    }

    return true
  }

  // BMC Risk operations
  async getBMCRisks(): Promise<BMCRisk[]> {
    const { data, error } = await supabase
      .from('bmc_risks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching BMC risks:', error)
      return []
    }

    return data || []
  }

  async getBMCRisksByCaseId(caseId: string): Promise<BMCRisk[]> {
    const { data, error } = await supabase
      .from('bmc_risks')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching BMC risks:', error)
      return []
    }

    return data || []
  }

  async createBMCRisk(risk: Omit<BMCRisk, 'id' | 'created_at' | 'updated_at'>): Promise<BMCRisk | null> {
    const { data, error } = await supabase
      .from('bmc_risks')
      .insert([risk])
      .select()
      .single()

    if (error) {
      console.error('Error creating BMC risk:', error)
      return null
    }

    return data
  }

  async updateBMCRisk(riskId: string, updates: Partial<BMCRisk>): Promise<BMCRisk | null> {
    const { data, error } = await supabase
      .from('bmc_risks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', riskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating BMC risk:', error)
      return null
    }

    return data
  }

  // Task Comment operations
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching task comments:', error)
      return []
    }

    return data || []
  }

  async createTaskComment(comment: Omit<TaskComment, 'id' | 'created_at'>): Promise<TaskComment | null> {
    const { data, error } = await supabase
      .from('task_comments')
      .insert([comment])
      .select()
      .single()

    if (error) {
      console.error('Error creating task comment:', error)
      return null
    }

    return data
  }

  // Client Collaborator operations
  async getClientCollaborators(clientId: string): Promise<ClientCollaborator[]> {
    const { data, error } = await supabase
      .from('client_collaborators')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching collaborators:', error)
      return []
    }

    return data || []
  }

  async createCollaborator(collaborator: Omit<ClientCollaborator, 'id' | 'created_at'>): Promise<ClientCollaborator | null> {
    const { data, error } = await supabase
      .from('client_collaborators')
      .insert([collaborator])
      .select()
      .single()

    if (error) {
      console.error('Error creating collaborator:', error)
      return null
    }

    return data
  }

  async inviteCollaborator(email: string, clientId: string, role: 'collaborator' | 'admin'): Promise<boolean> {
    try {
      // Create a profile for the collaborator
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          role: 'colaborador',
          client_id: clientId
        }
      })

      if (authError) {
        console.error('Error inviting user:', authError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in inviteCollaborator:', error)
      return false
    }
  }
}

export const supabaseService = new SupabaseService()