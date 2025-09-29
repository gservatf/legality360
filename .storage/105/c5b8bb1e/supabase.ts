import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmmvhunhekjwcjkvzoel.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXZodW5oZWtqd2Nqa3Z6b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTczNzMsImV4cCI6MjA3NDY3MzM3M30.rFmjdb5sBQv_8jFkcdlzltW5VjIqy9qz_k--j1b5Ocg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Legality360
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'pending' | 'cliente' | 'analista' | 'abogado' | 'admin'
  created_at: string
  updated_at: string
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
  created_at: string
  caso?: Caso
  asignado?: Profile
}

// Extended types with counts
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