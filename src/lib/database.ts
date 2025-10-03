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
        .select('id, email, full_name, role, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      const profilesWithCounts = await Promise.all(
        (data || []).map(async (profile) => {
          const { count, error: countError } = await supabase
            .from('tareas')
            .select('*', { count: 'exact', head: true })
            .eq('asignado_a', profile.id)
            .eq('estado', 'pendiente')

          if (countError) {
            console.error('Error contando tareas para usuario:', profile.id, countError)
          }

          return {
            ...this.mapProfile(profile),
            tareas_pendientes: count || 0
          }
        })
      )

      return profilesWithCounts
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
        .update({ role: newRole, updated_at: new Date().toISOString() })
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
      const [usersRes, empresasRes, casosRes, tareasRes] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('empresas').select('id'),
        supabase.from('casos').select('estado'),
        supabase.from('tareas').select('estado, asignado_a')
      ])

      const users = usersRes.data || []
      const empresas = empresasRes.data || []
      const casos = casosRes.data || []
      const tareas = tareasRes.data || []

      stats.total_usuarios = users.length
      stats.usuarios_pendientes = users.filter((u) => u.role === 'pending').length

      stats.total_empresas = empresas.length
      stats.total_casos = casos.length
      stats.casos_activos = casos.filter((c) => c.estado === 'activo').length

      stats.total_tareas = tareas.length
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
      const { data, error } = await supabase.from('empresas').select('*').order('nombre')
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
        .select()
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
          cliente:profiles!casos_cliente_id_fkey(id, email, full_name, role),
          asignaciones:asignaciones(*, usuario:profiles(id, email, full_name, role)),
          tareas:tareas(id, estado)
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

  // (el resto de métodos de casos y tareas los dejamos como están pero con la misma idea de limitar campos)

}

export const dbService = new DatabaseService()
