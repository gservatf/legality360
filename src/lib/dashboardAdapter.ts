import { dbService } from './database'
import type { Caso, Tarea, Profile } from './supabase'
import type { Case, Task } from '@/types/database'

/**
 * Adapter to convert between Supabase types and mockDB types
 * This allows dashboard components to continue using their expected types
 * while actually fetching from Supabase
 */

// Convert Supabase Caso to mockDB Case
export function casoToCase(caso: Caso, analista?: Profile): Case {
  const caseObj: Case = {
    caso_id: caso.id,
    cliente_id: caso.cliente_id || '',
    titulo: caso.titulo,
    estado: mapCasoEstado(caso.estado),
    fecha_inicio: caso.created_at.split('T')[0],
    fecha_estimada_fin: '', // Not in Supabase schema - could be extended
    carpeta_drive_url: '', // Not in Supabase schema - could be extended
    analista_asignado: analista?.full_name || caso.cliente?.full_name || 'Sin asignar',
    descripcion: '' // Not in Supabase schema - could be extended
  }
  return caseObj
}

// Map Supabase estado to mockDB estado
function mapCasoEstado(estado: 'activo' | 'cerrado'): Case['estado'] {
  switch (estado) {
    case 'activo':
      return 'en proceso'
    case 'cerrado':
      return 'completado'
    default:
      return 'nuevo'
  }
}

// Convert Supabase Tarea to mockDB Task
export function tareaToTask(tarea: Tarea, createdBy?: 'cliente' | 'analista'): Task {
  const asignado = tarea.asignado as any as Profile | undefined
  
  const task: Task = {
    task_id: tarea.id,
    caso_id: tarea.caso_id,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion || '',
    responsable: tarea.asignado_a || '',
    responsable_tipo: determineResponsableTipo(asignado),
    responsable_nombre: asignado?.full_name || 'Sin asignar',
    estado: mapTareaEstado(tarea.estado),
    fecha_limite: tarea.created_at.split('T')[0], // Default to created date - could be extended
    fecha_creacion: tarea.created_at,
    bmc_block: undefined, // Not in Supabase schema - could be extended
    prioridad: 'media', // Not in Supabase schema - could be extended
    created_by: createdBy || 'analista'
  }
  return task
}

// Determine responsable tipo from profile role
function determineResponsableTipo(profile?: Profile): Task['responsable_tipo'] {
  if (!profile) return 'analista'
  switch (profile.role) {
    case 'cliente':
      return 'cliente'
    case 'analista':
    case 'abogado':
      return 'analista'
    default:
      return 'colaborador'
  }
}

// Map Supabase tarea estado to mockDB task estado
function mapTareaEstado(estado: 'pendiente' | 'en_progreso' | 'completada'): Task['estado'] {
  switch (estado) {
    case 'pendiente':
      return 'pendiente'
    case 'en_progreso':
      return 'en proceso'
    case 'completada':
      return 'completada'
    default:
      return 'pendiente'
  }
}

// Reverse: Convert mockDB task estado to Supabase tarea estado
export function taskEstadoToTareaEstado(estado: Task['estado']): Tarea['estado'] {
  switch (estado) {
    case 'pendiente':
      return 'pendiente'
    case 'en proceso':
      return 'en_progreso'
    case 'completada':
      return 'completada'
    default:
      return 'pendiente'
  }
}

/**
 * Dashboard data service - provides mockDB-like interface using Supabase
 */
export class DashboardDataService {
  
  // Get cases by client ID
  async getCasesByClientId(clientId: string): Promise<Case[]> {
    try {
      const casos = await dbService.getCasosByCliente(clientId)
      
      // Get analyst info for each case
      const cases = await Promise.all(
        casos.map(async (caso) => {
          // Get assigned analyst from asignaciones
          const analista = caso.asignaciones?.[0]?.usuario
          return casoToCase(caso, analista as Profile)
        })
      )
      
      return cases
    } catch (error) {
      console.error('Error in getCasesByClientId:', error)
      return []
    }
  }
  
  // Get tasks by case ID
  async getTasksByCaseId(caseId: string): Promise<Task[]> {
    try {
      const tareas = await dbService.getTareasByCaso(caseId)
      return tareas.map(tarea => tareaToTask(tarea))
    } catch (error) {
      console.error('Error in getTasksByCaseId:', error)
      return []
    }
  }
  
  // Update task status
  async updateTaskStatus(taskId: string, newStatus: Task['estado']): Promise<boolean> {
    try {
      const tareaEstado = taskEstadoToTareaEstado(newStatus)
      return await dbService.updateTareaEstado(taskId, tareaEstado)
    } catch (error) {
      console.error('Error in updateTaskStatus:', error)
      return false
    }
  }
  
  // Update task
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<boolean> {
    try {
      const updates: Partial<Tarea> = {}
      
      if (taskData.titulo !== undefined) updates.titulo = taskData.titulo
      if (taskData.descripcion !== undefined) updates.descripcion = taskData.descripcion
      if (taskData.responsable !== undefined) updates.asignado_a = taskData.responsable
      if (taskData.estado !== undefined) updates.estado = taskEstadoToTareaEstado(taskData.estado)
      
      return await dbService.updateTarea(taskId, updates)
    } catch (error) {
      console.error('Error in updateTask:', error)
      return false
    }
  }

  // Get profile by ID - useful for getting client/analyst info
  async getProfileById(profileId: string): Promise<Profile | null> {
    return await dbService.getProfileById(profileId)
  }
}

export const dashboardDataService = new DashboardDataService()
