/**
 * Example usage of real-time subscriptions in DatabaseService
 * 
 * This file demonstrates how to use the subscription methods
 * to listen for changes in the casos, tareas, and mensajes tables.
 */

import { dbService } from '@/lib/database'

// Example 1: Subscribe to casos changes
export function subscribeToAllCasosChanges() {
  const channelName = dbService.subscribeToCasos((payload) => {
    console.log('Caso event:', payload.eventType) // 'INSERT', 'UPDATE', or 'DELETE'
    console.log('Caso data:', payload.new) // New row data (for INSERT and UPDATE)
    console.log('Old caso data:', payload.old) // Old row data (for UPDATE and DELETE)
    
    // Example: Reload casos list when a change is detected
    // reloadCasosList()
  })
  
  console.log(`Subscribed to casos with channel: ${channelName}`)
  return channelName
}

// Example 2: Subscribe to tareas changes
export function subscribeToAllTareasChanges() {
  const channelName = dbService.subscribeToTareas((payload) => {
    console.log('Tarea event:', payload.eventType) // 'INSERT', 'UPDATE', or 'DELETE'
    console.log('Tarea data:', payload.new)
    console.log('Old tarea data:', payload.old)
    
    // Example: Update UI when a task changes
    // if (payload.eventType === 'UPDATE') {
    //   updateTaskInUI(payload.new)
    // }
  })
  
  console.log(`Subscribed to tareas with channel: ${channelName}`)
  return channelName
}

// Example 3: Subscribe to mensajes changes
export function subscribeToAllMensajesChanges() {
  const channelName = dbService.subscribeToMensajes((payload) => {
    console.log('Mensaje event:', payload.eventType)
    console.log('Mensaje data:', payload.new)
    
    // Example: Show new message notification
    // if (payload.eventType === 'INSERT') {
    //   showNotification('New message received', payload.new)
    // }
  })
  
  console.log(`Subscribed to mensajes with channel: ${channelName}`)
  return channelName
}

// Example 4: Cleanup subscriptions when component unmounts
export function cleanupSubscriptions() {
  // Unsubscribe from all channels
  dbService.unsubscribeAll()
  
  // Or unsubscribe from a specific channel
  // dbService.unsubscribe('casos-changes')
  // dbService.unsubscribe('tareas-changes')
  // dbService.unsubscribe('mensajes-changes')
}

// Example 5: Usage in a React component (pseudocode)
/*
import { useEffect } from 'react'
import { dbService } from '@/lib/database'

function MyCasosComponent() {
  const [casos, setCasos] = useState([])
  
  useEffect(() => {
    // Load initial data
    loadCasos()
    
    // Subscribe to real-time updates
    const channelName = dbService.subscribeToCasos((payload) => {
      // Reload data when changes occur
      loadCasos()
    })
    
    // Cleanup on unmount
    return () => {
      dbService.unsubscribe(channelName)
    }
  }, [])
  
  const loadCasos = async () => {
    const data = await dbService.getAllCasosWithDetails()
    setCasos(data)
  }
  
  return (
    // Your component JSX
  )
}
*/
