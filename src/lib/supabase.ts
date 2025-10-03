import { createClient } from '@supabase/supabase-js'

// -----------------------------
// Supabase Client
// -----------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables")
  throw new Error("Missing Supabase environment variables: check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// -----------------------------
// Shared Types
// -----------------------------
export type UserRole = 'pending' | 'cliente' | 'analista' | 'abogado' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string | null
}

export interface Empresa {
  id: string
  nombre: string
  created_at: string
}

export interface Caso {
  id: string
  empresa_id: string
  cliente_id: string | null
  titulo: string
  estado: 'activo' | 'cerrado'
  created_at: string
  empresa?: Empresa
  cliente?: Profile
  asignaciones?: Asignacion[]
  tareas?: Tarea[]
}

export interface Asignacion {
  id: string
  caso_id: string
  usuario_id: string
  rol_asignado: 'analista' | 'abogado'
  created_at: string
  usuario?: Profile
  caso?: Caso
}

export interface Tarea {
  id: string
  caso_id: string
  asignado_a: string | null
  titulo: string
  descripcion: string | null
  estado: 'pendiente' | 'en_progreso' | 'completada'
  fecha_limite: string | null
  created_at: string
  caso?: Caso
  asignado?: Profile
}

export interface ProfileWithTaskCount extends Profile {
  tareas_pendientes?: number
}

export interface CasoWithDetails extends Caso {
  empresa: Empresa
  cliente: Profile | null
  asignaciones: (Asignacion & { usuario: Profile })[]
  tareas_count?: number
  tareas_pendientes?: number
}

export interface ChatMessage {
  id: string
  caso_id: string
  sender: Exclude<UserRole, 'pending'> // cualquier rol válido menos 'pending'
  sender_name: string
  mensaje: string
  fecha_envio: string
  leido: boolean
  created_at?: string
}
