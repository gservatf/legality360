import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmmvhunhekjwcjkvzoel.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXZodW5oZWtqd2Nqa3Z6b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTczNzMsImV4cCI6MjA3NDY3MzM3M30.rFmjdb5sBQv_8jFkcdlzltW5VjIqy9qz_k--j1b5Ocg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'analista' | 'cliente' | 'colaborador' | 'inactive'
  client_id?: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  nombre: string
  correo: string
  telefono: string
  contrato_url: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  created_at: string
}

export interface Case {
  id: string
  client_id: string
  titulo: string
  estado: 'nuevo' | 'en revisión' | 'en proceso' | 'completado' | 'pausado'
  fecha_inicio: string
  fecha_estimada_fin?: string
  carpeta_drive_url: string
  analista_asignado: string
  descripcion: string
  created_at: string
}

export interface Task {
  id: string
  case_id: string
  titulo: string
  descripcion: string
  responsable_id: string
  responsable_tipo: 'cliente' | 'analista' | 'colaborador'
  responsable_nombre: string
  estado: 'pendiente' | 'en proceso' | 'completada'
  fecha_limite: string
  fecha_creacion: string
  bmc_block?: string
  prioridad: 'baja' | 'media' | 'alta'
  created_by_id: string
  drive_link?: string
}

export interface Risk {
  id: string
  case_id: string
  block_name: string
  risk_level: 'green' | 'yellow' | 'red'
  risk_description: string
  recommendation: string
  last_updated: string
}

export interface ChatMessage {
  id: string
  case_id: string
  task_id?: string
  sender_id: string
  sender_name: string
  sender_role: 'cliente' | 'analista' | 'colaborador'
  mensaje: string
  fecha_envio: string
  leido: boolean
  type: 'message' | 'status_change' | 'file_upload'
}