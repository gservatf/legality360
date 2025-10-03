import { supabase } from './supabase'
import type {
  Profile,
  Empresa,
  Caso,
  Tarea,
  ProfileWithTaskCount,
  CasoWithDetails
} from './supabase'

export type UserRole = 'pending' | 'cliente' | 'analista' | 'abogado' | 'admin'

class DatabaseService {
  // -----------------------------
  // Helpers
  // -----------------------------
  private mapProfile(u: any): Profile {
    return {
      ...u,
      full_name: u.full_name || 'Sin nombre'
    }
  }

  // -----------------------------
  // Profiles
  // -----------------------------
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(this.mapProfile)
    } catch (err) {
      console.error('Error in getAllProfiles:', err)
      return []
    }
  }

  async getAllProfilesWithTaskCounts(): Promise<ProfileWithTaskCount[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, role, created_at, updated_at,
          tareas:tareas(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((profile: any) => ({
        ...this.mapProfile(profile),
        tareas_pendientes: profile.tareas?.[0]?.count || 0
      }))
    } catch (err) {
      console.error('Error en getAllProfilesWithTaskCounts:', err)
      return []
    }
  }

  async getPendingUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, updated_at')
        .eq('role', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(this.mapProfile)
    } catch (err) {
      console.error('Error in getPendingUsers:', err)
      return []
    }
  }

  async updateProfileRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      const validRoles: UserRole[] = ['admin', 'cliente', 'analista', 'abogado', 'pending']
      if (!validRoles.includes(newRole)) {
        console.warn(`Invalid role attempted: ${newRole}`)
        return false
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
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
      const [
        { count: total_usuarios = 0 },
        { count: usuarios_pendientes = 0 },
        { count: total_empresas = 0 },
        { data: casos = [], count: total_casos = 0 },
        { data: tareas = [], count: total_tareas = 0 }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pending'),
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('casos').select('estado', { count: 'exact' }),
        supabase.from('tareas').select('estado, asignado_a', { count: 'exact' })
      ])

      stats.total_usuarios = total_usuarios
      stats.usuarios_pendientes = usuarios_pendientes
      stats.total_empresas = total_empresas
      stats.total_casos = total_casos
      stats.casos_activos = casos.filter((c) => c.estado === 'activo').length
      stats.total_tareas = total_tareas
      stats.tareas_pendientes = tareas.filter((t) => t.estado === 'pendiente').length

      if (userId) {
        stats.mis_tareas_pendientes = tareas.filter(
          (t) => t.asignado_a === userId && t.estado === 'pendiente'
        ).length
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
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nombre, created_at, updated_at')
        .order('nombre')

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error in getAllEmpresas:', err)
      return []
    }
  }

  async createEmpresa(nombre: string): Promise<Empresa | null> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([{ nombre }])
        .select('id, nombre, created_at, updated_at')
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error in createEmpresa:', err)
      return null
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
          id, titulo, estado, created_at,
          empresa:empresas(id,nombre),
          cliente:profiles!casos_cliente_id_fkey(id,email,full_name,role),
          asignaciones:asignaciones(id, usuario:profiles(id,email,full_name,role)),
          tareas(id,estado)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((caso: any) => ({
        ...caso,
        tareas_count: caso.tareas?.length || 0,
        tareas_pendientes: (caso.tareas || []).filter((t: any) => t.estado === 'pendiente').length
      })) as CasoWithDetails[]
    } catch (err) {
      console.error('Error in getAllCasosWithDetails:', err)
      return []
    }
  }
}

export const dbService = new DatabaseService()
