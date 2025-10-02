import { supabase } from './supabase'
import type { Profile, Empresa, Caso, Tarea, ProfileWithTaskCount, CasoWithDetails } from './supabase'

class DatabaseService {
  // -----------------------------
  // Profiles
  // -----------------------------
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error in getAllProfiles:', err)
      return []
    }
  }

  async getAllProfilesWithTaskCounts(): Promise<ProfileWithTaskCount[]> {
    try {
      const profiles = await this.getAllProfiles()
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
    } catch (err) {
      console.error('Error in getAllProfilesWithTaskCounts:', err)
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

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error in getPendingUsers:', err)
      return []
    }
  }

  async updateProfileRole(userId: string, newRole: Profile['role']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in updateProfileRole:', err)
      return false
    }
  }

  // -----------------------------
  // Dashboard stats
  // -----------------------------
  async getDashboardStats(userId?: string): Promise<any> {
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

    try {
      const { data: users } = await supabase.from('profiles').select('role')
      if (users) {
        stats.total_usuarios = users.length
        stats.usuarios_pendientes = users.filter((u) => u.role === 'pending').length
      }

      const { data: empresas } = await supabase.from('empresas').select('id')
      stats.total_empresas = empresas?.length || 0

      const { data: casos } = await supabase.from('casos').select('estado')
      if (casos) {
        stats.total_casos = casos.length
        stats.casos_activos = casos.filter((c) => c.estado === 'activo').length
      }

      const { data: tareas } = await supabase.from('tareas').select('estado, asignado_a')
      if (tareas) {
        stats.total_tareas = tareas.length
        stats.tareas_pendientes = tareas.filter((t) => t.estado === 'pendiente').length
        if (userId) {
          stats.mis_tareas_pendientes = tareas.filter(
            (t) => t.asignado_a === userId && t.estado === 'pendiente'
          ).length
        }
      }

      return stats
    } catch (err) {
      console.error('Error in getDashboardStats:', err)
      return stats
    }
  }

  // -----------------------------
  // Empresas
  // -----------------------------
  async getAllEmpresas(): Promise<Empresa[]> {
    try {
      const { data, error } = await supabase.from('empresas').select('*').order('nombre')
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error in getAllEmpresas:', err)
      return []
    }
  }

  async createEmpresa(nombre: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('empresas').insert([{ nombre }])
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in createEmpresa:', err)
      return false
    }
  }

  async updateEmpresa(id: string, nombre: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('empresas').update({ nombre }).eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in updateEmpresa:', err)
      return false
    }
  }

  async deleteEmpresa(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('empresas').delete().eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in deleteEmpresa:', err)
      return false
    }
  }

  // -----------------------------
  // Casos
  // -----------------------------
  async getAllCasosWithDetails(): Promise<CasoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('casos')
        .select(`
          *,
          empresa:empresas(*),
          cliente:profiles!casos_cliente_id_fkey(*),
          asignaciones:asignaciones(*, usuario:profiles(*)),
          tareas:tareas(id, estado)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const casosWithCounts = (data || []).map((caso: any) => {
        const tareas = caso.tareas || []
        return {
          ...caso,
          tareas_count: tareas.length,
          tareas_pendientes: tareas.filter((t: any) => t.estado === 'pendiente').length
        }
      })

      return casosWithCounts as CasoWithDetails[]
    } catch (err) {
      console.error('Error in getAllCasosWithDetails:', err)
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
          asignaciones:asignaciones(*, usuario:profiles(*)),
          tareas:tareas(id, estado)
        `)

      if (userRole === 'cliente') {
        query = query.eq('cliente_id', userId)
      } else if (userRole === 'analista' || userRole === 'abogado') {
        const { data: userAssignments } = await supabase
          .from('asignaciones')
          .select('caso_id')
          .eq('usuario_id', userId)

        if (userAssignments?.length) {
          const casoIds = userAssignments.map((a) => a.caso_id)
          query = query.in('id', casoIds)
        } else {
          return []
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error

      const casosWithCounts = (data || []).map((caso: any) => {
        const tareas = caso.tareas || []
        return {
          ...caso,
          tareas_count: tareas.length,
          tareas_pendientes: tareas.filter((t: any) => t.estado === 'pendiente').length
        }
      })

      return casosWithCounts as CasoWithDetails[]
    } catch (err) {
      console.error('Error in getCasosByUser:', err)
      return []
    }
  }

  async createCaso(empresaId: string, clienteId: string, titulo: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('casos').insert([
        {
          empresa_id: empresaId,
          cliente_id: clienteId,
          titulo,
          estado: 'activo'
        }
      ])
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in createCaso:', err)
      return false
    }
  }

  // -----------------------------
  // Tareas
  // -----------------------------
  async getTareasByUser(userId: string): Promise<Tarea[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`*, caso:casos(*)`)
        .eq('asignado_a', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error in getTareasByUser:', err)
      return []
    }
  }

  async createTarea(
    casoId: string,
    asignadoA: string,
    titulo: string,
    descripcion?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('tareas').insert([
        {
          caso_id: casoId,
          asignado_a: asignadoA,
          titulo,
          descripcion,
          estado: 'pendiente'
        }
      ])
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in createTarea:', err)
      return false
    }
  }

  async updateTareaEstado(
    tareaId: string,
    nuevoEstado: 'pendiente' | 'en_progreso' | 'completada'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', tareaId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error in updateTareaEstado:', err)
      return false
    }
  }

  // -----------------------------
  // Horas Extra
  // -----------------------------
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
        .insert([{ caso_id, horas_abogado, horas_analista, estado, solicitante_id }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error in solicitarHorasExtra:', err)
      return null
    }
  }
}

export const dbService = new DatabaseService()
