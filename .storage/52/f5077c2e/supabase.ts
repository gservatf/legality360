import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmmvhunhekjwcjkvzoel.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXZodW5oZWtqd2Nqa3Z6b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTczNzMsImV4cCI6MjA3NDY3MzM3M30.rFmjdb5sBQv_8jFkcdlzltW5VjIqy9qz_k--j1b5Ocg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'analista' | 'cliente' | 'colaborador'
  created_at: string
  updated_at: string
  client_id?: string | null
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  contract_url: string | null
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  client_id: string
  title: string
  description: string | null
  status: 'new' | 'in_review' | 'in_progress' | 'completed' | 'paused'
  start_date: string
  estimated_end_date: string | null
  drive_folder_url: string | null
  assigned_analyst: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  case_id: string
  title: string
  description: string | null
  assignee_id: string
  assignee_type: 'client' | 'analyst' | 'collaborator'
  assignee_name: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string
  bmc_block: string | null
  drive_link: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface BMCRisk {
  id: string
  case_id: string
  block_name: string
  risk_level: 'green' | 'yellow' | 'red'
  risk_description: string
  recommendation: string
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  user_name: string
  message: string
  message_type: 'message' | 'status_change' | 'file_upload'
  created_at: string
}

export interface ClientCollaborator {
  id: string
  client_id: string
  profile_id: string
  name: string
  email: string
  role: 'collaborator' | 'admin'
  created_at: string
}