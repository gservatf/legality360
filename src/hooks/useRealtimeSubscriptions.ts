/**
 * Example React Hook for using real-time subscriptions
 * 
 * This custom hook demonstrates how to use the DatabaseService
 * real-time subscriptions in a React component with proper cleanup.
 */

import { useEffect, useCallback } from 'react'
import { dbService } from '@/lib/database'

/**
 * Hook to subscribe to casos changes with automatic cleanup
 * @param onCasoChange Callback function to execute when casos change
 */
export function useCasosSubscription(onCasoChange: () => void) {
  useEffect(() => {
    const channelName = dbService.subscribeToCasos(() => {
      onCasoChange()
    })

    return () => {
      dbService.unsubscribe(channelName)
    }
  }, [onCasoChange])
}

/**
 * Hook to subscribe to tareas changes with automatic cleanup
 * @param onTareaChange Callback function to execute when tareas change
 */
export function useTareasSubscription(onTareaChange: () => void) {
  useEffect(() => {
    const channelName = dbService.subscribeToTareas(() => {
      onTareaChange()
    })

    return () => {
      dbService.unsubscribe(channelName)
    }
  }, [onTareaChange])
}

/**
 * Hook to subscribe to mensajes changes with automatic cleanup
 * @param onMensajeChange Callback function to execute when mensajes change
 */
export function useMensajesSubscription(onMensajeChange: () => void) {
  useEffect(() => {
    const channelName = dbService.subscribeToMensajes(() => {
      onMensajeChange()
    })

    return () => {
      dbService.unsubscribe(channelName)
    }
  }, [onMensajeChange])
}

/**
 * Hook to subscribe to all tables with automatic cleanup
 * @param callbacks Object containing callbacks for each table
 */
export function useRealtimeSubscriptions(callbacks: {
  onCasoChange?: () => void
  onTareaChange?: () => void
  onMensajeChange?: () => void
}) {
  const { onCasoChange, onTareaChange, onMensajeChange } = callbacks

  useEffect(() => {
    const channels: string[] = []

    if (onCasoChange) {
      channels.push(dbService.subscribeToCasos(onCasoChange))
    }

    if (onTareaChange) {
      channels.push(dbService.subscribeToTareas(onTareaChange))
    }

    if (onMensajeChange) {
      channels.push(dbService.subscribeToMensajes(onMensajeChange))
    }

    return () => {
      channels.forEach(channel => dbService.unsubscribe(channel))
    }
  }, [onCasoChange, onTareaChange, onMensajeChange])
}

/**
 * Example usage in a component:
 * 
 * ```typescript
 * import { useState, useCallback } from 'react'
 * import { dbService } from '@/lib/database'
 * import { useCasosSubscription } from '@/hooks/useRealtimeSubscriptions'
 * 
 * function MyCasosComponent() {
 *   const [casos, setCasos] = useState([])
 *   
 *   const loadCasos = useCallback(async () => {
 *     const data = await dbService.getAllCasosWithDetails()
 *     setCasos(data)
 *   }, [])
 *   
 *   // Use the hook to subscribe to casos changes
 *   useCasosSubscription(loadCasos)
 *   
 *   // Load initial data
 *   useEffect(() => {
 *     loadCasos()
 *   }, [loadCasos])
 *   
 *   return (
 *     <div>
 *       {casos.map(caso => (
 *         <div key={caso.id}>{caso.titulo}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 * 
 * Example with multiple subscriptions:
 * 
 * ```typescript
 * import { useState, useCallback } from 'react'
 * import { dbService } from '@/lib/database'
 * import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions'
 * 
 * function Dashboard() {
 *   const [casos, setCasos] = useState([])
 *   const [tareas, setTareas] = useState([])
 *   
 *   const loadCasos = useCallback(async () => {
 *     const data = await dbService.getAllCasosWithDetails()
 *     setCasos(data)
 *   }, [])
 *   
 *   const loadTareas = useCallback(async () => {
 *     const data = await dbService.getTareasByUser(userId)
 *     setTareas(data)
 *   }, [userId])
 *   
 *   // Subscribe to multiple tables at once
 *   useRealtimeSubscriptions({
 *     onCasoChange: loadCasos,
 *     onTareaChange: loadTareas
 *   })
 *   
 *   // Load initial data
 *   useEffect(() => {
 *     loadCasos()
 *     loadTareas()
 *   }, [loadCasos, loadTareas])
 *   
 *   return (
 *     <div>
 *       <section>
 *         <h2>Casos</h2>
 *         {casos.map(caso => <div key={caso.id}>{caso.titulo}</div>)}
 *       </section>
 *       <section>
 *         <h2>Tareas</h2>
 *         {tareas.map(tarea => <div key={tarea.id}>{tarea.titulo}</div>)}
 *       </section>
 *     </div>
 *   )
 * }
 * ```
 */
