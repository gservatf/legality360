# Real-Time Subscriptions - DatabaseService

Este documento explica cómo usar las suscripciones en tiempo real del `DatabaseService` para mantener los componentes actualizados automáticamente cuando hay cambios en la base de datos.

## Características

El `DatabaseService` ahora soporta suscripciones en tiempo real para las siguientes tablas:

- **casos**: Detecta cambios en casos (creación, actualización, eliminación)
- **tareas**: Detecta cambios en tareas (creación, actualización, eliminación)
- **mensajes**: Detecta cambios en mensajes (creación, actualización, eliminación)

## API

### Métodos de Suscripción

#### `subscribeToCasos(callback: (payload: any) => void): string`

Suscribe a cambios en la tabla `casos`.

**Parámetros:**
- `callback`: Función que se ejecuta cuando hay un cambio. Recibe un objeto `payload` con:
  - `eventType`: Tipo de evento ('INSERT', 'UPDATE', 'DELETE')
  - `new`: Los datos nuevos de la fila (para INSERT y UPDATE)
  - `old`: Los datos antiguos de la fila (para UPDATE y DELETE)

**Retorna:** El nombre del canal para poder desuscribirse después.

```typescript
const channelName = dbService.subscribeToCasos((payload) => {
  console.log('Evento:', payload.eventType)
  console.log('Datos nuevos:', payload.new)
  console.log('Datos antiguos:', payload.old)
  
  // Actualizar UI o recargar datos
  reloadCasos()
})
```

#### `subscribeToTareas(callback: (payload: any) => void): string`

Suscribe a cambios en la tabla `tareas`.

**Parámetros y retorno:** Igual que `subscribeToCasos`.

```typescript
const channelName = dbService.subscribeToTareas((payload) => {
  if (payload.eventType === 'UPDATE') {
    // Actualizar tarea específica en la UI
    updateTareaInUI(payload.new)
  }
})
```

#### `subscribeToMensajes(callback: (payload: any) => void): string`

Suscribe a cambios en la tabla `mensajes`.

**Parámetros y retorno:** Igual que `subscribeToCasos`.

```typescript
const channelName = dbService.subscribeToMensajes((payload) => {
  if (payload.eventType === 'INSERT') {
    // Mostrar notificación de nuevo mensaje
    showNotification('Nuevo mensaje', payload.new)
  }
})
```

### Métodos de Limpieza

#### `unsubscribe(channelName: string): Promise<void>`

Cancela la suscripción de un canal específico.

```typescript
await dbService.unsubscribe('casos-changes')
```

#### `unsubscribeAll(): Promise<void>`

Cancela todas las suscripciones activas.

```typescript
await dbService.unsubscribeAll()
```

## Uso en Componentes React

### Ejemplo Básico

```typescript
import { useEffect, useState } from 'react'
import { dbService } from '@/lib/database'

function CasosComponent() {
  const [casos, setCasos] = useState([])
  
  useEffect(() => {
    // Cargar datos iniciales
    loadCasos()
    
    // Suscribirse a cambios en tiempo real
    const channelName = dbService.subscribeToCasos(() => {
      // Recargar datos cuando hay cambios
      loadCasos()
    })
    
    // Limpiar suscripción al desmontar
    return () => {
      dbService.unsubscribe(channelName)
    }
  }, [])
  
  const loadCasos = async () => {
    const data = await dbService.getAllCasosWithDetails()
    setCasos(data)
  }
  
  return (
    <div>
      {/* Tu JSX aquí */}
    </div>
  )
}
```

### Ejemplo Avanzado: Actualización Selectiva

```typescript
import { useEffect, useState } from 'react'
import { dbService } from '@/lib/database'

function TareasComponent() {
  const [tareas, setTareas] = useState([])
  
  useEffect(() => {
    loadTareas()
    
    const channelName = dbService.subscribeToTareas((payload) => {
      if (payload.eventType === 'INSERT') {
        // Añadir nueva tarea sin recargar todo
        setTareas(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        // Actualizar tarea específica
        setTareas(prev => 
          prev.map(t => t.id === payload.new.id ? payload.new : t)
        )
      } else if (payload.eventType === 'DELETE') {
        // Eliminar tarea
        setTareas(prev => 
          prev.filter(t => t.id !== payload.old.id)
        )
      }
    })
    
    return () => {
      dbService.unsubscribe(channelName)
    }
  }, [])
  
  const loadTareas = async () => {
    const data = await dbService.getTareasByUser(userId)
    setTareas(data)
  }
  
  return (
    <div>
      {/* Tu JSX aquí */}
    </div>
  )
}
```

### Ejemplo: Múltiples Suscripciones

```typescript
import { useEffect } from 'react'
import { dbService } from '@/lib/database'

function DashboardComponent() {
  useEffect(() => {
    // Suscribirse a múltiples tablas
    const casosChannel = dbService.subscribeToCasos(() => {
      console.log('Casos actualizados')
      refreshCasosSection()
    })
    
    const tareasChannel = dbService.subscribeToTareas(() => {
      console.log('Tareas actualizadas')
      refreshTareasSection()
    })
    
    const mensajesChannel = dbService.subscribeToMensajes(() => {
      console.log('Mensajes actualizados')
      refreshMensajesSection()
    })
    
    // Limpiar todas las suscripciones
    return () => {
      dbService.unsubscribe(casosChannel)
      dbService.unsubscribe(tareasChannel)
      dbService.unsubscribe(mensajesChannel)
      
      // O simplemente:
      // dbService.unsubscribeAll()
    }
  }, [])
  
  return (
    <div>
      {/* Tu JSX aquí */}
    </div>
  )
}
```

## Configuración de Supabase

Para que las suscripciones en tiempo real funcionen, asegúrate de que:

1. **Realtime está habilitado** en tu proyecto de Supabase
2. Las tablas tienen **Realtime habilitado** en el dashboard de Supabase:
   - Ve a Database → Replication
   - Activa Realtime para las tablas: `casos`, `tareas`, `mensajes`

## Consideraciones de Rendimiento

- **Limpieza**: Siempre desuscríbete cuando el componente se desmonta para evitar memory leaks
- **Recargas Selectivas**: En lugar de recargar todos los datos, actualiza solo lo necesario cuando sea posible
- **Múltiples Suscripciones**: Puedes tener múltiples suscripciones activas, pero recuerda limpiarlas todas

## Solución de Problemas

### Las suscripciones no funcionan

1. Verifica que Realtime esté habilitado en Supabase
2. Comprueba la consola del navegador para mensajes de error
3. Asegúrate de que las políticas RLS permiten acceso a las tablas

### Memory Leaks

Si notas problemas de memoria, asegúrate de:
- Llamar a `unsubscribe()` o `unsubscribeAll()` en el cleanup de useEffect
- No crear múltiples suscripciones al mismo canal sin limpiar las anteriores

## Referencias

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client - Realtime](https://supabase.com/docs/reference/javascript/subscribe)
