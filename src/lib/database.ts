import { supabase } from './supabase'
import type { Profile, Empresa, Caso, Tarea, ProfileWithTaskCount, CasoWithDetails } from './supabase'

class DatabaseService {
  // Profile management with role-based access
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all profiles:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllProfiles:', error)
      return []
    }
  }

  async getAllProfilesWithTaskCounts(): Promise<ProfileWithTaskCount[]> {
    try {
      // First get all profiles
      const profiles = await this.getAllProfiles()
      
      // Then get task counts for each user
      const profilesWithCounts = await Promise.all(
        profiles.map(async (profile) => {
          const { data: taskCount } = await supabase
            .from('tareas')
            .select('id', { count: 'exact' })
            .eq('asignado_a', profile.id)
            .eq('estado', 'pendiente')

          return {
            ...profile,
            tareas_pendientes: taskCount?.length || 0
          }
        })
      )

      return profilesWithCounts
    } catch (error) {
      console.error('Error in getAllProfilesWithTaskCounts:', error)
      return []
    }
  }

  async getPendingUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPendingUsers:', error)
      return []
    }
  }

  async updateProfileRole(userId: string, newRole: Profile['role']): Promise<boolean> {
    try {
      console.log('Updating user role:', userId, 'to', newRole)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Error updating profile role:', error)
        return false
      }

      console.log('Profile role updated successfully:', data)
      return true
    } catch (error) {
      console.error('Error in updateProfileRole:', error)
      return false
    }
  }

  // Dashboard stats with role-based filtering
  async getDashboardStats(userId?: string): Promise<any> {
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

      // Get user counts (admin only)
      const { data: users } = await supabase
        .from('profiles')
        .select('role', { count: 'exact' })

      if (users) {
        stats.total_usuarios = users.length
        stats.usuarios_pendientes = users.filter(u => u.role === 'pending').length
      }

      // Get company count
      const { data: empresas } = await supabase
        .from('empresas')
        .select('id', { count: 'exact' })

      stats.total_empresas = empresas?.length || 0

      // Get case counts
      const { data: casos } = await supabase
        .from('casos')
        .select('estado', { count: 'exact' })

      if (casos) {
        stats.total_casos = casos.length
        stats.casos_activos = casos.filter(c => c.estado === 'activo').length
      }

      // Get task counts
      const { data: tareas } = await supabase
        .from('tareas')
        .select('estado, asignado_a', { count: 'exact' })

      if (tareas) {
        stats.total_tareas = tareas.length
        stats.tareas_pendientes = tareas.filter(t => t.estado === 'pendiente').length
        
        if (userId) {
          stats.mis_tareas_pendientes = tareas.filter(t => 
            t.asignado_a === userId && t.estado === 'pendiente'
          ).length
        }
      }

      return stats
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
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

  // Company management
  async getAllEmpresas(): Promise<Empresa[]> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) {
        console.error('Error fetching empresas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllEmpresas:', error)
      return []
    }
  }

  async createEmpresa(nombre: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empresas')
        .insert([{ nombre }])

      if (error) {
        console.error('Error creating empresa:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createEmpresa:', error)
      return false
    }
  }

  async updateEmpresa(id: string, nombre: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ nombre })
        .eq('id', id)

      if (error) {
        console.error('Error updating empresa:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateEmpresa:', error)
      return false
    }
  }

  async deleteEmpresa(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting empresa:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteEmpresa:', error)
      return false
    }
  }

  // Case management with role-based access
  async getAllCasosWithDetails(): Promise<CasoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles!casos_cliente_id_fkey(*),
          asignaciones:asignaciones(
            *,
            usuario:profiles(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching casos with details:', error)
        return []
      }

      // Get task counts for each case
      const casosWithCounts = await Promise.all(
        (data || []).map(async (caso) => {
          const { data: taskCounts } = await supabase
            .from('tareas')
            .select('estado', { count: 'exact' })
            .eq('caso_id', caso.id)

          const tareas_count = taskCounts?.length || 0
          const tareas_pendientes = taskCounts?.filter(t => t.estado === 'pendiente').length || 0

          return {
            ...caso,
            tareas_count,
            tareas_pendientes
          }
        })
      )

      return casosWithCounts as CasoWithDetails[]
    } catch (error) {
      console.error('Error in getAllCasosWithDetails:', error)
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
          cliente:profiles!casos_cliente_id_fkey(*),
          asignaciones:asignaciones(
            *,
            usuario:profiles(*)
          )
        `)

      // Filter based on user role
      if (userRole === 'cliente') {
        query = query.eq('cliente_id', userId)
      } else if (userRole === 'analista' || userRole === 'abogado') {
        // Get cases where user is assigned
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
      // Admin sees all cases (no additional filter)

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user cases:', error)
        return []
      }

      return data as CasoWithDetails[] || []
    } catch (error) {
      console.error('Error in getCasosByUser:', error)
      return []
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

      if (error) {
        console.error('Error creating caso:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createCaso:', error)
      return false
    }
  }

  // Task management
  async getTareasByUser(userId: string): Promise<Tarea[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          caso:casos(*)
        `)
        .eq('asignado_a', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user tasks:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTareasByUser:', error)
      return []
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

      if (error) {
        console.error('Error creating tarea:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createTarea:', error)
      return false
    }
  }

  async updateTareaEstado(tareaId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: nuevoEstado })
        .eq('id', tareaId)

      if (error) {
        console.error('Error updating tarea estado:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateTareaEstado:', error)
      return false
    }
  }

  // Solicitud de horas extra
  async solicitarHorasExtra({
    caso_id,
    horas_abogado,
    horas_analista,
    estado,
    solicitante_id
  }: {
    caso_id: string
    horas_abogado: number
    horas_analista: number
    estado: string
    solicitante_id: string
  }): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('horas_extra')
        .insert([{
          caso_id,
          horas_abogado,
          horas_analista,
          estado,
          solicitante_id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error solicitando horas extra:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error en solicitarHorasExtra:', error)
      return null
    }
  }

  // Get all tareas for a caso
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

      if (error) {
        console.error('Error fetching tareas by caso:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTareasByCaso:', error)
      return []
    }
  }

  // Update tarea fields
  async updateTarea(tareaId: string, updates: Partial<Tarea>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .update(updates)
        .eq('id', tareaId)

      if (error) {
        console.error('Error updating tarea:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateTarea:', error)
      return false
    }
  }

  // Get casos by cliente_id
  async getCasosByCliente(clienteId: string): Promise<Caso[]> {
    try {
      const { data, error } = await supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles!casos_cliente_id_fkey(*)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching casos by cliente:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCasosByCliente:', error)
      return []
    }
  }

  // Get profile by ID
  async getProfileById(profileId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProfileById:', error)
      return null
    }
  }
}

export const dbService = new DatabaseService()