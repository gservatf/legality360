# Implementación de Suscripciones en Tiempo Real

## Resumen

Se ha configurado el `DatabaseService` para suscribirse a cambios en las tablas `casos`, `tareas` y `mensajes` usando `supabase.channel()` para que los componentes se actualicen en tiempo real.

## Cambios Realizados

### 1. DatabaseService (`src/lib/database.ts`)

Se han añadido los siguientes elementos al `DatabaseService`:

#### Propiedades
- `private channels: Map<string, RealtimeChannel>`: Mapa para gestionar canales activos de suscripción

#### Métodos de Suscripción
- **`subscribeToCasos(callback)`**: Suscribe a cambios en la tabla `casos`
- **`subscribeToTareas(callback)`**: Suscribe a cambios en la tabla `tareas`
- **`subscribeToMensajes(callback)`**: Suscribe a cambios en la tabla `mensajes`

Cada método:
- Acepta una función callback que se ejecuta cuando hay cambios
- Retorna el nombre del canal para poder desuscribirse
- Detecta todos los tipos de eventos: INSERT, UPDATE, DELETE
- Gestiona automáticamente canales duplicados

#### Métodos de Limpieza
- **`unsubscribe(channelName)`**: Cancela la suscripción de un canal específico
- **`unsubscribeAll()`**: Cancela todas las suscripciones activas

### 2. Custom Hooks (`src/hooks/useRealtimeSubscriptions.ts`)

Hooks de React para facilitar el uso de suscripciones en componentes:

- **`useCasosSubscription(callback)`**: Hook para suscribirse a casos
- **`useTareasSubscription(callback)`**: Hook para suscribirse a tareas
- **`useMensajesSubscription(callback)`**: Hook para suscribirse a mensajes
- **`useRealtimeSubscriptions(callbacks)`**: Hook para múltiples suscripciones

Los hooks gestionan automáticamente:
- La suscripción al montar el componente
- La limpieza al desmontar el componente
- Prevención de memory leaks

### 3. Ejemplos de Uso (`src/examples/realtimeSubscriptionExample.ts`)

Archivo con ejemplos prácticos mostrando:
- Cómo suscribirse a cada tabla
- Cómo manejar diferentes tipos de eventos
- Cómo limpiar suscripciones
- Patrones de uso en componentes React

### 4. Documentación (`docs/REALTIME_SUBSCRIPTIONS.md`)

Documentación completa con:
- Descripción de la API
- Ejemplos de uso básicos y avanzados
- Guía de configuración en Supabase
- Consideraciones de rendimiento
- Solución de problemas comunes

## Cómo Usar

### Ejemplo Rápido

```typescript
import { dbService } from '@/lib/database'
import { useCasosSubscription } from '@/hooks/useRealtimeSubscriptions'

function MiComponente() {
  const [casos, setCasos] = useState([])
  
  const loadCasos = useCallback(async () => {
    const data = await dbService.getAllCasosWithDetails()
    setCasos(data)
  }, [])
  
  // Cargar datos iniciales
  useEffect(() => {
    loadCasos()
  }, [loadCasos])
  
  // Suscribirse a cambios (se limpia automáticamente)
  useCasosSubscription(loadCasos)
  
  return <div>{/* Tu JSX */}</div>
}
```

## Configuración Requerida en Supabase

Para que las suscripciones funcionen, debes:

1. Ir al dashboard de Supabase
2. Navegar a Database → Replication
3. Activar Realtime para las tablas:
   - `casos`
   - `tareas`
   - `mensajes`

## Características Técnicas

### Gestión de Canales
- Se usa un `Map` para rastrear canales activos
- Se previene la creación de canales duplicados
- Limpieza automática con `unsubscribe()` y `unsubscribeAll()`

### Tipos de Eventos
Cada suscripción detecta tres tipos de eventos:
- **INSERT**: Cuando se crea un nuevo registro
- **UPDATE**: Cuando se actualiza un registro existente
- **DELETE**: Cuando se elimina un registro

### Payload de Eventos
Cada callback recibe un objeto con:
```typescript
{
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  new: any,  // Datos nuevos (INSERT, UPDATE)
  old: any   // Datos antiguos (UPDATE, DELETE)
}
```

## Beneficios

1. **Actualizaciones Automáticas**: Los componentes se actualizan sin necesidad de polling
2. **Mejor UX**: Los usuarios ven cambios inmediatamente sin recargar
3. **Menos Carga en el Servidor**: No se necesitan peticiones periódicas
4. **Fácil de Usar**: Hooks personalizados simplifican la integración
5. **Gestión Automática**: Los hooks manejan la limpieza automáticamente

## Archivos Modificados

- `src/lib/database.ts` - Clase DatabaseService con métodos de suscripción

## Archivos Creados

- `src/hooks/useRealtimeSubscriptions.ts` - Custom hooks para React
- `src/examples/realtimeSubscriptionExample.ts` - Ejemplos de uso
- `docs/REALTIME_SUBSCRIPTIONS.md` - Documentación completa
- `REALTIME_IMPLEMENTATION_SUMMARY.md` - Este resumen

## Testing

La implementación:
- ✅ Compila correctamente con TypeScript
- ✅ Build exitoso sin errores
- ✅ Tipos correctamente definidos con Supabase
- ⏳ Requiere testing en entorno con base de datos real

## Próximos Pasos

1. Habilitar Realtime en Supabase para las tablas especificadas
2. Integrar los hooks en componentes existentes que necesiten actualizaciones en tiempo real
3. Monitorear el rendimiento y ajustar según sea necesario
4. Considerar implementar filtros específicos si se necesitan suscripciones más granulares

## Notas Adicionales

- La tabla `mensajes` no existe aún en el esquema, pero el método está listo para cuando se cree
- Se pueden añadir más métodos de suscripción para otras tablas siguiendo el mismo patrón
- Los logs en consola ayudan a depurar eventos en desarrollo
