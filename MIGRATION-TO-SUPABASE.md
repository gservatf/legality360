# Migración de mockDB a Supabase - Dashboard Components

## Resumen

Este documento describe la migración de los componentes del dashboard desde el uso de `mockDB` (base de datos simulada en localStorage) a `dbService` que utiliza Supabase como backend real.

## Cambios Implementados

### 1. Servicios Creados

#### `src/lib/dashboardAdapter.ts`
Adaptador que convierte entre los tipos de Supabase y los tipos esperados por los componentes del dashboard (mockDB types). Esto permite mantener la compatibilidad con los componentes existentes mientras se usa Supabase como backend.

**Funciones principales:**
- `casoToCase()`: Convierte `Caso` (Supabase) a `Case` (mockDB)
- `tareaToTask()`: Convierte `Tarea` (Supabase) a `Task` (mockDB)
- `taskEstadoToTareaEstado()`: Convierte estados de tareas entre ambos formatos
- `DashboardDataService`: Clase que proporciona una interfaz tipo mockDB usando Supabase

#### Extensión de `src/lib/database.ts`
Se agregaron los siguientes métodos al `DatabaseService`:
- `getTareasByCaso(casoId)`: Obtiene todas las tareas de un caso
- `updateTarea(tareaId, updates)`: Actualiza campos de una tarea
- `getCasosByCliente(clienteId)`: Obtiene casos de un cliente
- `getProfileById(profileId)`: Obtiene perfil de usuario por ID

### 2. Componentes Actualizados

#### Componentes con Integración Completa a Supabase:

1. **Dashboard.tsx**
   - Reemplazado: `mockDB.getCasesByClientId()` → `dashboardDataService.getCasesByClientId()`
   - Reemplazado: `authService.getCurrentClientId()` → `authService.getCurrentProfile()`
   - Agregado: Estado de carga asíncrona

2. **TaskKanban.tsx**
   - Reemplazado: `mockDB.getTasksByCaseId()` → `dashboardDataService.getTasksByCaseId()`
   - Reemplazado: `mockDB.updateTaskStatus()` → `dashboardDataService.updateTaskStatus()`
   - Reemplazado: `mockDB.updateTask()` → `dashboardDataService.updateTask()`
   - Agregado: Carga asíncrona de datos desde Supabase
   - Agregado: Estado de loading mientras se cargan los datos

3. **Chat.tsx**
   - Reemplazado: `mockDB.getCasesByClientId()` → `dashboardDataService.getCasesByClientId()`
   - **Nota**: Los mensajes de chat siguen en localStorage hasta que se implemente la tabla de mensajes en Supabase

4. **ClientAccount.tsx**
   - Reemplazado: `mockDB.getClientById()` → `authService.getCurrentProfile()`
   - Reemplazado: `mockDB.getCasesByClientId()` → `dashboardDataService.getCasesByClientId()`
   - Agregado: Carga asíncrona de perfil y casos

5. **TaskEditModal.tsx**
   - Reemplazado: `mockDB.getClientById()` → `dashboardDataService.getProfileById()`
   - **Nota**: Colaboradores y bloques BMC pendientes de implementación en Supabase

6. **NewTaskModal.tsx**
   - Reemplazado: `mockDB.addTask()` → `dbService.createTarea()`
   - Simplificado: Formulario reducido a campos esenciales disponibles en Supabase
   - Agregado: Manejo de errores y estado de loading

7. **TaskChatModal.tsx**
   - Actualizado: Uso de `authService.getCurrentProfile()` en lugar de acceso síncrono
   - **Nota**: Mensajes de chat siguen en localStorage

#### Componentes con Placeholders (Funcionalidad pendiente):

Los siguientes componentes muestran un mensaje de "Funcionalidad en desarrollo" porque requieren tablas que aún no existen en Supabase:

1. **CollaboratorManager.tsx** - Requiere tabla de colaboradores
2. **RiskMatrix.tsx** - Requiere tabla de bloques BMC
3. **Reports.tsx** - Requiere tabla de reportes
4. **DriveIntegration.tsx** - Requiere tabla de documentos

### 3. Mapeo de Tipos

#### Diferencias entre mockDB y Supabase:

| mockDB Type | Supabase Type | Diferencias Principales |
|-------------|---------------|-------------------------|
| `Client` | `Profile` | Supabase usa perfiles de usuario en lugar de entidad cliente separada |
| `Case` (caso_id) | `Caso` (id) | Diferentes nombres de campos ID |
| `Task` (task_id) | `Tarea` (id) | Diferentes nombres de campos y estados |
| `ChatMessage` | No existe aún | Pendiente de implementar |
| `ClientCollaborator` | No existe aún | Pendiente de implementar |
| `BMCBlock` | No existe aún | Pendiente de implementar |
| `Report` | No existe aún | Pendiente de implementar |
| `Document` | No existe aún | Pendiente de implementar |

#### Estados de Tareas:

**mockDB:**
- 'pendiente'
- 'en proceso'
- 'completada'

**Supabase:**
- 'pendiente'
- 'en_progreso' (con guión bajo)
- 'completada'

El adaptador maneja esta conversión automáticamente.

## Funcionalidad Actual vs Futura

### ✅ Implementado (usando Supabase):
- Autenticación de usuarios
- Perfiles de usuario
- Listado de casos del cliente
- Listado de tareas por caso
- Creación de nuevas tareas
- Actualización de estado de tareas
- Actualización de datos de tareas

### 🔄 Parcialmente Implementado (localStorage temporal):
- Chat general del caso
- Chat específico de tareas
- Enlaces de Drive en tareas

### ⏳ Pendiente (requiere extensión del schema de Supabase):
- Colaboradores del cliente
- Bloques BMC y matriz de riesgos
- Reportes
- Documentos y gestión de Drive
- Campos adicionales en tareas (prioridad, BMC block, fecha límite, etc.)
- Campos adicionales en casos (fecha_inicio, fecha_estimada_fin, carpeta_drive_url, descripcion)

## Esquema de Supabase Requerido

### Tablas Existentes:
1. `profiles` - Perfiles de usuario
2. `empresas` - Empresas
3. `casos` - Casos legales
4. `tareas` - Tareas del caso
5. `asignaciones` - Asignaciones de usuarios a casos

### Tablas Pendientes de Implementar:
1. `mensajes_chat` - Mensajes de chat de casos
2. `mensajes_tarea` - Mensajes de chat de tareas específicas
3. `colaboradores` - Colaboradores de clientes
4. `bloques_bmc` - Bloques del Business Model Canvas
5. `reportes` - Reportes generados
6. `documentos` - Documentos del caso

### Extensiones Sugeridas a Tablas Existentes:

#### `casos`:
```sql
ALTER TABLE casos ADD COLUMN fecha_inicio date;
ALTER TABLE casos ADD COLUMN fecha_estimada_fin date;
ALTER TABLE casos ADD COLUMN carpeta_drive_url text;
ALTER TABLE casos ADD COLUMN descripcion text;
```

#### `tareas`:
```sql
ALTER TABLE tareas ADD COLUMN prioridad text CHECK (prioridad IN ('baja', 'media', 'alta'));
ALTER TABLE tareas ADD COLUMN fecha_limite date;
ALTER TABLE tareas ADD COLUMN bmc_block text;
ALTER TABLE tareas ADD COLUMN created_by text CHECK (created_by IN ('cliente', 'analista'));
```

## Migración de Datos

Si hay datos en mockDB (localStorage) que necesitan migrarse a Supabase:

1. Los datos de `localStorage` con claves que comienzan con `legality360_` son del mockDB
2. Los datos de chat (`chat_messages_*` y `task_chat_*`) permanecen en localStorage temporalmente
3. No se requiere migración automática ya que mockDB era solo para desarrollo/demo

## Testing

Para probar la integración:

1. **Verificar autenticación**: Usuarios deben poder iniciar sesión con Supabase
2. **Verificar dashboard**: Dashboard debe cargar casos desde Supabase
3. **Verificar tareas**: TaskKanban debe mostrar tareas desde Supabase
4. **Crear tarea**: Botón "Nueva Tarea" debe crear en Supabase
5. **Actualizar tarea**: Cambios de estado y edición deben guardar en Supabase
6. **Chat**: Mensajes deben guardarse en localStorage (temporal)

## Notas de Desarrollo

### Patrones Usados:

1. **Adapter Pattern**: `dashboardAdapter.ts` traduce entre tipos de Supabase y mockDB
2. **Async/Await**: Todos los componentes ahora usan carga asíncrona
3. **Loading States**: Componentes muestran estado de carga durante operaciones
4. **Error Handling**: Manejo básico de errores en operaciones de base de datos
5. **Graceful Degradation**: Funcionalidad no implementada muestra placeholders informativos

### Próximos Pasos:

1. **Implementar tablas faltantes** en Supabase (ver lista arriba)
2. **Migrar chat** de localStorage a Supabase
3. **Agregar campos adicionales** a tablas existentes
4. **Implementar RLS policies** para seguridad
5. **Agregar validaciones** en backend
6. **Implementar notificaciones** en tiempo real con Supabase Realtime

## Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [Database Schema](/supabase-migration.sql)
- [Setup Guide](/README-SUPABASE-SETUP.md)
- [Database Service](/src/lib/database.ts)
- [Dashboard Adapter](/src/lib/dashboardAdapter.ts)
