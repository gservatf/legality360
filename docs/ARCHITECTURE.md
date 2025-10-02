# Real-Time Subscriptions Architecture

## Overview

Esta implementación proporciona actualización en tiempo real de datos usando Supabase Realtime channels.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Database                       │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐                    │
│  │  casos  │  │ tareas  │  │ mensajes │                    │
│  └────┬────┘  └────┬────┘  └────┬─────┘                    │
└───────┼────────────┼────────────┼──────────────────────────┘
        │            │            │
        │ Realtime   │ Realtime   │ Realtime
        │ Events     │ Events     │ Events
        ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Realtime Channels                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │casos-changes │ │tareas-changes│ │mensajes-...  │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   DatabaseService                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ private channels: Map<string, RealtimeChannel>       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Methods:                                                    │
│  • subscribeToCasos(callback)    → 'casos-changes'         │
│  • subscribeToTareas(callback)   → 'tareas-changes'        │
│  • subscribeToMensajes(callback) → 'mensajes-changes'      │
│  • unsubscribe(channelName)                                 │
│  • unsubscribeAll()                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              React Custom Hooks Layer                        │
│  (src/hooks/useRealtimeSubscriptions.ts)                    │
│                                                              │
│  • useCasosSubscription(callback)                           │
│  • useTareasSubscription(callback)                          │
│  • useMensajesSubscription(callback)                        │
│  • useRealtimeSubscriptions({ onCasoChange, ... })          │
│                                                              │
│  Features:                                                   │
│  ✓ Automatic subscription on mount                          │
│  ✓ Automatic cleanup on unmount                             │
│  ✓ Prevents memory leaks                                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Components                            │
│                                                              │
│  AdminPanel.tsx                                             │
│  • useCasosSubscription(() => loadCasos())                  │
│                                                              │
│  ProfessionalPanel.tsx                                      │
│  • useTareasSubscription(() => loadTareas())                │
│                                                              │
│  Dashboard.tsx                                              │
│  • useRealtimeSubscriptions({                               │
│      onCasoChange: refreshCasos,                            │
│      onTareaChange: refreshTareas                           │
│    })                                                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Event Flow (Database → UI)

```
1. User A creates a new caso in database
   ↓
2. Supabase triggers INSERT event on 'casos' table
   ↓
3. Supabase Realtime sends event to 'casos-changes' channel
   ↓
4. DatabaseService receives event in subscribeToCasos callback
   ↓
5. React hook (useCasosSubscription) executes callback
   ↓
6. Component calls loadCasos() to fetch updated data
   ↓
7. UI updates automatically for User B
```

### Subscription Lifecycle

```
Component Mount
   ↓
useEffect runs
   ↓
Call dbService.subscribeToCasos(callback)
   ↓
Create Supabase channel
   ↓
Store channel in Map
   ↓
Return channel name
   ↓
... Component receives realtime updates ...
   ↓
Component Unmount
   ↓
useEffect cleanup runs
   ↓
Call dbService.unsubscribe(channelName)
   ↓
Remove channel from Supabase
   ↓
Delete from Map
```

## Event Payload Structure

```typescript
{
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  schema: 'public',
  table: 'casos' | 'tareas' | 'mensajes',
  new: {
    // New row data (for INSERT and UPDATE)
    id: string,
    titulo: string,
    // ... other fields
  },
  old: {
    // Old row data (for UPDATE and DELETE)
    id: string,
    // ... other fields
  }
}
```

## Key Components

### 1. DatabaseService
**Location:** `src/lib/database.ts`

**Responsibilities:**
- Manage Supabase channel subscriptions
- Track active channels in a Map
- Provide subscription methods for each table
- Clean up channels on unsubscribe

**Key Features:**
- Prevents duplicate channels
- Type-safe with TypeScript
- Automatic channel management

### 2. React Hooks
**Location:** `src/hooks/useRealtimeSubscriptions.ts`

**Responsibilities:**
- Wrap DatabaseService subscriptions
- Handle React lifecycle (mount/unmount)
- Prevent memory leaks with cleanup
- Provide simple API for components

**Available Hooks:**
- `useCasosSubscription` - Single table subscription
- `useTareasSubscription` - Single table subscription
- `useMensajesSubscription` - Single table subscription
- `useRealtimeSubscriptions` - Multiple table subscriptions

### 3. Supabase Client
**Location:** `src/lib/supabase.ts`

**Responsibilities:**
- Initialize Supabase client
- Provide database connection
- Enable Realtime functionality

## Performance Considerations

### Channel Management
- ✅ Channels are reused (no duplicates)
- ✅ Channels are cleaned up on unmount
- ✅ Multiple subscriptions use separate channels

### Data Updates
- ⚡ **Simple approach**: Reload all data on any change
- 🚀 **Optimized approach**: Update specific items based on event type

Example of optimized approach:
```typescript
useTareasSubscription((payload) => {
  if (payload.eventType === 'INSERT') {
    setTareas(prev => [payload.new, ...prev])
  } else if (payload.eventType === 'UPDATE') {
    setTareas(prev => prev.map(t => 
      t.id === payload.new.id ? payload.new : t
    ))
  } else if (payload.eventType === 'DELETE') {
    setTareas(prev => prev.filter(t => t.id !== payload.old.id))
  }
})
```

### Network Usage
- Realtime uses WebSockets (efficient)
- No polling required
- Events only sent when data changes

## Configuration Requirements

### Supabase Dashboard
1. Go to Database → Replication
2. Enable Realtime for tables:
   - ✓ casos
   - ✓ tareas
   - ✓ mensajes (when created)

### Row Level Security (RLS)
- Ensure RLS policies allow reading the data
- Realtime respects RLS policies
- Users only receive events for data they can access

## Security

### RLS Integration
```sql
-- Example: Users only receive events for their casos
CREATE POLICY "Users can view own casos" ON casos
  FOR SELECT USING (
    auth.uid() = cliente_id OR
    auth.uid() IN (
      SELECT usuario_id FROM asignaciones 
      WHERE caso_id = casos.id
    )
  );
```

### Channel Security
- Channels use authenticated Supabase client
- Events filtered by RLS policies
- No additional authentication needed

## Testing

### Manual Testing
1. Open app in two browser windows
2. Login with different users
3. Create/update/delete data in one window
4. Verify updates appear in other window

### Console Logging
All subscription methods log events:
```javascript
console.log('Casos change detected:', payload)
console.log('Tareas change detected:', payload)
console.log('Mensajes change detected:', payload)
```

## Troubleshooting

### Subscriptions Not Working
1. Check Realtime is enabled in Supabase
2. Verify RLS policies allow access
3. Check browser console for errors
4. Ensure channels are subscribed (check logs)

### Memory Leaks
1. Always use hooks in useEffect
2. Ensure cleanup functions run
3. Don't create subscriptions outside React lifecycle
4. Use useCallback for callbacks to prevent re-subscriptions

### Multiple Subscriptions
```typescript
// ✅ Good: One subscription per hook
useCasosSubscription(loadCasos)

// ❌ Bad: Multiple calls without cleanup
useEffect(() => {
  dbService.subscribeToCasos(callback)
  dbService.subscribeToCasos(callback) // Duplicate!
}, [])
```

## Future Enhancements

### Possible Improvements
1. **Filtered Subscriptions**: Subscribe to specific casos or tareas
2. **Debouncing**: Prevent too many rapid updates
3. **Optimistic Updates**: Update UI before server confirms
4. **Connection Status**: Show online/offline indicator
5. **Retry Logic**: Reconnect on disconnection

### Example: Filtered Subscription
```typescript
// Future enhancement
dbService.subscribeToCasoById(casoId, callback)
```

## References

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase JS Client - Realtime](https://supabase.com/docs/reference/javascript/subscribe)
- [React Hooks Best Practices](https://react.dev/reference/react)
