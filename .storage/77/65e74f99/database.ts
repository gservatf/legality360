import { supabase, Profile, Empresa, Caso, Asignacion, Tarea, ProfileWithTaskCount, CasoWithDetails } from './supabase'

export class DatabaseService {
  // Profile operations
  async getProfileWithTaskCount(userId: string): Promise<ProfileWithTaskCount | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Count pending tasks
      const { count } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('asignado_a', userId)
        .eq('estado', 'pendiente')

      return {
        ...profile,
        tareas_pendientes: count || 0
      }
    } catch (error) {
      console.error('Error fetching profile with task count:', error)
      return null
    }
  }

  async getAllProfilesWithTaskCounts(): Promise<ProfileWithTaskCount[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get task counts for each profile
      const profilesWithCounts = await Promise.all(
        profiles.map(async (profile) => {
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
      console.error('Error fetching profiles with task counts:', error)
      return []
    }
  }

  async updateProfileRole(userId: string, newRole: Profile['role']): Promise<Profile | null> {
    try {
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
      return data
    } catch (error) {
      console.error('Error updating profile role:', error)
      return null
    }
  }

  // Empresa operations
  async getAllEmpresas(): Promise<Empresa[]> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching empresas:', error)
      return []
    }
  }

  async createEmpresa(nombre: string): Promise<Empresa | null> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert({ nombre })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating empresa:', error)
      return null
    }
  }

  async updateEmpresa(id: string, nombre: string): Promise<Empresa | null> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({ nombre })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating empresa:', error)
      return null
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

  // Caso operations
  async getAllCasosWithDetails(): Promise<CasoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles(*),
          asignaciones(*, usuario:profiles(*))
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add task counts
      const casosWithCounts = await Promise.all(
        (data || []).map(async (caso) => {
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
      console.error('Error fetching casos with details:', error)
      return []
    }
  }

  async getCasosByUser(userId: string, userRole: string): Promise<CasoWithDetails[]> {
    try {
      let query = supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles(*),
          asignaciones(*, usuario:profiles(*))
        `)

      // Filter based on user role
      if (userRole === 'cliente') {
        query = query.eq('cliente_id', userId)
      } else if (userRole === 'analista' || userRole === 'abogado') {
        // Get cases where user is assigned
        const { data: asignaciones } = await supabase
          .from('asignaciones')
          .select('caso_id')
          .eq('usuario_id', userId)

        const casoIds = asignaciones?.map(a => a.caso_id) || []
        if (casoIds.length === 0) return []

        query = query.in('id', casoIds)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as CasoWithDetails[]
    } catch (error) {
      console.error('Error fetching casos by user:', error)
      return []
    }
  }

  async createCaso(empresaId: string, clienteId: string, titulo: string): Promise<Caso | null> {
    try {
      const { data, error } = await supabase
        .from('casos')
        .insert({
          empresa_id: empresaId,
          cliente_id: clienteId,
          titulo,
          estado: 'activo'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating caso:', error)
      return null
    }
  }

  async updateCaso(id: string, updates: Partial<Caso>): Promise<Caso | null> {
    try {
      const { data, error } = await supabase
        .from('casos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating caso:', error)
      return null
    }
  }

  // Asignacion operations
  async createAsignacion(casoId: string, usuarioId: string, rolAsignado: 'analista' | 'abogado'): Promise<Asignacion | null> {
    try {
      const { data, error } = await supabase
        .from('asignaciones')
        .insert({
          caso_id: casoId,
          usuario_id: usuarioId,
          rol_asignado: rolAsignado
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating asignacion:', error)
      return null
    }
  }

  async deleteAsignacion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('asignaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting asignacion:', error)
      return false
    }
  }

  // Tarea operations
  async getAllTareas(): Promise<Tarea[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          caso:casos(*),
          asignado:profiles(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all tareas:', error)
      return []
    }
  }

  async getTareasByUser(userId: string): Promise<Tarea[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          caso:casos(*),
          asignado:profiles(*)
        `)
        .eq('asignado_a', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tareas by user:', error)
      return []
    }
  }

  async getTareasByCaso(casoId: string): Promise<Tarea[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          caso:casos(*),
          asignado:profiles(*)
        `)
        .eq('caso_id', casoId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tareas by caso:', error)
      return []
    }
  }

  async createTarea(casoId: string, asignadoA: string, titulo: string, descripcion?: string): Promise<Tarea | null> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .insert({
          caso_id: casoId,
          asignado_a: asignadoA,
          titulo,
          descripcion,
          estado: 'pendiente'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating tarea:', error)
      return null
    }
  }

  async updateTareaEstado(id: string, estado: 'pendiente' | 'en_progreso' | 'completada'): Promise<Tarea | null> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .update({ estado })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating tarea estado:', error)
      return null
    }
  }

  async updateTarea(id: string, updates: Partial<Tarea>): Promise<Tarea | null> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating tarea:', error)
      return null
    }
  }

  async deleteTarea(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting tarea:', error)
      return false
    }
  }

  // Dashboard stats
  async getDashboardStats(userId?: string) {
    try {
      const stats = {
        total_usuarios: 0,
        usuarios_pendientes: 0,
        total_empresas: 0,
        total_casos: 0,
        casos_activos: 0,
        total_tareas: 0,
        tareas_pendientes: 0,
        mis_tareas_pendientes: 0
      }

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      stats.total_usuarios = totalUsers || 0

      // Pending users
      const { count: pendingUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'pending')
      stats.usuarios_pendientes = pendingUsers || 0

      // Total empresas
      const { count: totalEmpresas } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })
      stats.total_empresas = totalEmpresas || 0

      // Total casos
      const { count: totalCasos } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
      stats.total_casos = totalCasos || 0

      // Active casos
      const { count: activeCasos } = await supabase
        .from('casos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo')
      stats.casos_activos = activeCasos || 0

      // Total tareas
      const { count: totalTareas } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
      stats.total_tareas = totalTareas || 0

      // Pending tareas
      const { count: pendingTareas } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
      stats.tareas_pendientes = pendingTareas || 0

      // User's pending tasks
      if (userId) {
        const { count: userPendingTasks } = await supabase
          .from('tareas')
          .select('*', { count: 'exact', head: true })
          .eq('asignado_a', userId)
          .eq('estado', 'pendiente')
        stats.mis_tareas_pendientes = userPendingTasks || 0
      }

      return stats
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
}

export const dbService = new DatabaseService()