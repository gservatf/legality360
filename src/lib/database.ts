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
      full_name: u.full_name && u.full_name.trim() !== '' ? u.full_name : 'Sin nombre'
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
      return (data || []).map((u) => this.mapProfile(u))
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
            console.error('Error contando tareas:', countError)
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
      return (data || []).map((u) => this.mapProfile(u))
    } catch (err) {
      console.error('Error in getPendingUsers:', err)
      return []
    }
  }

 async updateProfileRole(userId: string, newRole: UserRole): Promise<Profile | null> {
  try {
    const validRoles: UserRole[] = ['admin', 'cliente', 'analista', 'abogado', 'pending']
    if (!validRoles.includes(newRole)) {
      console.warn(`⚠️ Rol inválido: ${newRole}`)
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })   // 👈 ya no tocamos updated_at
      .eq('id', userId)
      .select('id, email, full_name, role, updated_at')
      .single()   // 👈 aquí mejor single()

    if (error) throw error

    console.log(`✅ Rol de ${data.email} actualizado a ${data.role}`)
    return this.mapProfile(data)
  } catch (err) {
    console.error('❌ Error en updateProfileRole:', err)
    return null
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
      const totalUsuariosRes = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const usuariosPendientesRes = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pending')
      const totalEmpresasRes = await supabase.from('empresas').select('*', { count: 'exact', head: true })
      const casosRes = await supabase.from('casos').select('estado', { count: 'exact' })
      const tareasRes = await supabase.from('tareas').select('estado, asignado_a', { count: 'exact' })

      stats.total_usuarios = totalUsuariosRes.count || 0
      stats.usuarios_pendientes = usuariosPendientesRes.count || 0
      stats.total_empresas = totalEmpresasRes.count || 0
      stats.total_casos = casosRes.count || 0
      stats.casos_activos = (casosRes.data || []).filter((c) => c.estado === 'activo').length
      stats.total_tareas = tareasRes.count || 0
      stats.tareas_pendientes = (tareasRes.data || []).filter((t) => t.estado === 'pendiente').length

      if (userId) {
        stats.mis_tareas_pendientes = (tareasRes.data || []).filter(
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
