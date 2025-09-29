import { supabase } from './supabase'
import { Profile, Empresa, Caso, Tarea, ProfileWithTaskCount, CasoWithDetails } from './supabase'

class DatabaseService {
  // Profile management with role-based access
  async getAllProfiles(): Promise<ProfileWithTaskCount[]> {
    try {
      console.log('Fetching all profiles for admin - using SELECT * FROM profiles')
      
      // Admin query: SELECT * FROM profiles (no filtering by auth.uid())
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all profiles:', error)
        throw error
      }

      console.log('Profiles fetched:', profiles?.length || 0)

      // Get task counts for each profile
      const profilesWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('tareas')
            .select('*', { count: 'exact', head: true })
            .eq('asignado_a', profile.id)
            .eq('estado', 'pendiente')

          return {
            ...profile,
            tareas_pendientes: count || 0
          }
        })
      )

      return profilesWithCounts
    } catch (error) {
      console.error('Database error in getAllProfiles:', error)
      throw error
    }
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      console.log('Fetching profile for user:', userId)
      
      // Individual user query: SELECT * FROM profiles WHERE id = userId
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return profile
    } catch (error) {
      console.error('Database error in getUserProfile:', error)
      return null
    }
  }

  async getPendingUsers(): Promise<Profile[]> {
    try {
      console.log('Fetching pending users for admin approval')
      
      // Admin query: SELECT * FROM profiles WHERE role = 'pending'
      const { data: pendingUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending users:', error)
        throw error
      }

      console.log('Pending users found:', pendingUsers?.length || 0)
      return pendingUsers || []
    } catch (error) {
      console.error('Database error in getPendingUsers:', error)
      throw error
    }
  }

  async updateUserRole(userId: string, newRole: Profile['role']): Promise<boolean> {
    try {
      console.log('Updating user role:', userId, 'to', newRole)
      
      // Admin update: UPDATE profiles SET role = newRole WHERE id = userId
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return false
      }

      console.log('User role updated successfully')
      return true
    } catch (error) {
      console.error('Database error in updateUserRole:', error)
      return false
    }
  }

  // Dashboard stats - admin sees all, others see filtered
  async getDashboardStats(userId?: string, userRole?: string): Promise<any> {
    try {
      console.log('Fetching dashboard stats for user:', userId, 'role:', userRole)
      
      // Admin sees all stats, others see filtered stats
      const { data: userStats } = await supabase
        .from('profiles')
        .select('role')
      
      const { data: empresaStats } = await supabase
        .from('empresas')
        .select('id')
      
      const { data: casoStats } = await supabase
        .from('casos')
        .select('estado')
      
      const { data: tareaStats } = await supabase
        .from('tareas')
        .select('estado, asignado_a')

      // Calculate stats
      const total_usuarios = userStats?.length || 0
      const usuarios_pendientes = userStats?.filter(u => u.role === 'pending').length || 0
      const total_empresas = empresaStats?.length || 0
      const total_casos = casoStats?.length || 0
      const casos_activos = casoStats?.filter(c => c.estado === 'activo').length || 0
      const total_tareas = tareaStats?.length || 0
      const tareas_pendientes = tareaStats?.filter(t => t.estado === 'pendiente').length || 0
      const mis_tareas_pendientes = userId ? 
        tareaStats?.filter(t => t.asignado_a === userId && t.estado === 'pendiente').length || 0 : 0

      return {
        total_usuarios,
        usuarios_pendientes,
        total_empresas,
        total_casos,
        casos_activos,
        total_tareas,
        tareas_pendientes,
        mis_tareas_pendientes
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        total_usuarios: 0,
        usuarios_pendientes: 0,
        total_empresas: 0,
        total_casos: 0,
        casos_activos: 0,
        total_tareas: 0,
        tareas_pendientes: 0,
        mis_tareas_pendientes: 0
      }
    }
  }

  // Existing methods with role-based access
  async getAllProfilesWithTaskCounts(): Promise<ProfileWithTaskCount[]> {
    return this.getAllProfiles()
  }

  async updateProfileRole(userId: string, newRole: Profile['role']): Promise<boolean> {
    return this.updateUserRole(userId, newRole)
  }

  // Company management
  async getAllEmpresas(): Promise<Empresa[]> {
    try {
      const { data: empresas, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      return empresas || []
    } catch (error) {
      console.error('Error fetching empresas:', error)
      throw error
    }
  }

  async createEmpresa(nombre: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empresas')
        .insert([{ nombre }])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating empresa:', error)
      return false
    }
  }

  async updateEmpresa(id: string, nombre: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ nombre })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating empresa:', error)
      return false
    }
  }

  async deleteEmpresa(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting empresa:', error)
      return false
    }
  }

  // Case management with role-based filtering
  async getAllCasosWithDetails(): Promise<CasoWithDetails[]> {
    try {
      const { data: casos, error } = await supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles!cliente_id(*),
          asignaciones:asignaciones(
            *,
            usuario:profiles(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add task counts for each case
      const casosWithCounts = await Promise.all(
        (casos || []).map(async (caso) => {
          const { count: totalTasks } = await supabase
            .from('tareas')
            .select('*', { count: 'exact', head: true })
            .eq('caso_id', caso.id)

          const { count: pendingTasks } = await supabase
            .from('tareas')
            .select('*', { count: 'exact', head: true })
            .eq('caso_id', caso.id)
            .eq('estado', 'pendiente')

          return {
            ...caso,
            tareas_count: totalTasks || 0,
            tareas_pendientes: pendingTasks || 0
          }
        })
      )

      return casosWithCounts as CasoWithDetails[]
    } catch (error) {
      console.error('Error fetching casos:', error)
      throw error
    }
  }

  async getCasosByUser(userId: string, userRole: Profile['role']): Promise<CasoWithDetails[]> {
    try {
      let query = supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles!cliente_id(*),
          asignaciones:asignaciones(
            *,
            usuario:profiles(*)
          )
        `)

      // Filter based on user role
      if (userRole === 'cliente') {
        query = query.eq('cliente_id', userId)
      } else if (userRole === 'analista' || userRole === 'abogado') {
        // Get cases where user is assigned through asignaciones table
        const { data: userAssignments } = await supabase
          .from('asignaciones')
          .select('caso_id')
          .eq('usuario_id', userId)

        if (userAssignments && userAssignments.length > 0) {
          const casoIds = userAssignments.map(a => a.caso_id)
          query = query.in('id', casoIds)
        } else {
          return []
        }
      }
      // Admin sees all cases (no filter)

      const { data: casos, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return casos as CasoWithDetails[] || []
    } catch (error) {
      console.error('Error fetching user cases:', error)
      throw error
    }
  }

  async createCaso(empresaId: string, clienteId: string, titulo: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('casos')
        .insert([{
          empresa_id: empresaId,
          cliente_id: clienteId,
          titulo,
          estado: 'activo'
        }])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating caso:', error)
      return false
    }
  }

  // Task management
  async getTareasByUser(userId: string): Promise<Tarea[]> {
    try {
      const { data: tareas, error } = await supabase
        .from('tareas')
        .select(`
          *,
          caso:casos(titulo)
        `)
        .eq('asignado_a', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return tareas || []
    } catch (error) {
      console.error('Error fetching user tasks:', error)
      throw error
    }
  }

  async createTarea(casoId: string, asignadoA: string, titulo: string, descripcion?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .insert([{
          caso_id: casoId,
          asignado_a: asignadoA,
          titulo,
          descripcion,
          estado: 'pendiente'
        }])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating tarea:', error)
      return false
    }
  }

  async updateTareaEstado(tareaId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: nuevoEstado })
        .eq('id', tareaId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating tarea estado:', error)
      return false
    }
  }
}

export const dbService = new DatabaseService()