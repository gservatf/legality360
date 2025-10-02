# Documentación de Arquitectura de Software - Legality360

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Estructura de Carpetas y Módulos](#estructura-de-carpetas-y-módulos)
4. [Servicios Implementados](#servicios-implementados)
5. [Dependencias Externas](#dependencias-externas)
6. [Flujo de Datos](#flujo-de-datos)
7. [Patrones de Diseño Detectados](#patrones-de-diseño-detectados)
8. [Módulos y Componentes Principales](#módulos-y-componentes-principales)
9. [Módulos Incompletos o Mockeados](#módulos-incompletos-o-mockeados)
10. [Recomendaciones de Arquitectura](#recomendaciones-de-arquitectura)

---

## Resumen Ejecutivo

**Legality360** es una plataforma de gestión legal colaborativa diseñada para estudios jurídicos, empresas y clientes. El sistema permite gestionar casos legales, tareas, horas de trabajo, y proporciona paneles diferenciados por rol (administrador, cliente, abogado, analista).

### Tecnologías Core
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Query + Zustand
- **Routing**: React Router v6

### Características Principales
- Autenticación y autorización basada en roles
- Gestión de empresas, casos y tareas
- Control de horas trabajadas y solicitud de horas extra
- Matriz de riesgos basada en Business Model Canvas (BMC)
- Sistema de chat y colaboración
- Integración con Google Drive (planificado)

---

## Arquitectura General

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTACIÓN (UI)                        │
│  Components: Admin, Client, Professional, Dashboard          │
│  UI Library: shadcn/ui (Radix UI + Tailwind)                │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    LÓGICA DE NEGOCIO                         │
│  Hooks: use-toast, use-mobile                                │
│  Context: React Query, State Management                      │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE SERVICIOS                          │
│  - auth.ts: Autenticación y autorización                     │
│  - database.ts: Acceso a datos (CRUD operations)            │
│  - supabaseService.ts: Servicios específicos de Supabase    │
│  - mockDatabase.ts: Base de datos mock para desarrollo      │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Supabase)                         │
│  - PostgreSQL Database                                        │
│  - Authentication Service                                     │
│  - Row Level Security (RLS)                                  │
│  - Realtime Subscriptions                                    │
└─────────────────────────────────────────────────────────────┘
```

### Patrón de Arquitectura
- **Cliente-Servidor**: Frontend React comunica con Supabase backend via REST/GraphQL
- **Arquitectura de Capas**: Separación clara entre UI, Lógica de Negocio y Acceso a Datos
- **Microservicios Implícitos**: Supabase proporciona servicios independientes (Auth, Database, Storage)

---

## Estructura de Carpetas y Módulos

### Vista General del Proyecto

```
legality360/
├── src/
│   ├── components/          # Componentes React organizados por feature
│   ├── lib/                 # Servicios y utilidades core
│   ├── pages/               # Páginas principales de la aplicación
│   ├── hooks/               # Custom hooks reutilizables
│   ├── types/               # Definiciones de TypeScript
│   └── main.tsx             # Entry point de la aplicación
├── public/                  # Assets estáticos
├── __backup_shadcnui/       # Backup de componentes shadcn/ui
├── .storage/                # Archivos temporales de almacenamiento
├── supabase-migration.sql   # Scripts de migración de base de datos
├── vite.config.ts           # Configuración de Vite
├── tailwind.config.ts       # Configuración de Tailwind CSS
└── package.json             # Dependencias y scripts
```

### Estructura Detallada de `/src`

```
src/
├── App.tsx                  # Componente principal con routing y auth
├── main.tsx                 # Entry point, inicialización React
├── index.css                # Estilos globales y variables CSS
│
├── components/
│   ├── admin/
│   │   └── AdminPanel.tsx              # Panel de administración completo
│   ├── professional/
│   │   ├── ProfessionalPanel.tsx       # Panel para abogados/analistas
│   │   └── RequestMoreHoursDialog.tsx  # Modal de solicitud de horas
│   ├── client/
│   │   └── ClientPanel.tsx             # Panel para clientes
│   ├── auth/
│   │   ├── LoginPage.tsx               # Página de inicio de sesión
│   │   ├── LoginForm.tsx               # Formulario de login
│   │   └── PendingAuthorization.tsx    # Vista para usuarios pendientes
│   ├── dashboard/
│   │   ├── TaskKanban.tsx              # Tablero Kanban de tareas
│   │   ├── RiskMatrix.tsx              # Matriz de riesgos BMC
│   │   ├── TaskEditModal.tsx           # Modal de edición de tareas
│   │   ├── NewTaskModal.tsx            # Modal de creación de tareas
│   │   ├── TaskChatModal.tsx           # Chat por tarea
│   │   ├── ClientAccount.tsx           # Gestión de cuenta de cliente
│   │   ├── CollaboratorManager.tsx     # Gestión de colaboradores
│   │   ├── ProgressTimeline.tsx        # Línea de tiempo de progreso
│   │   ├── Reports.tsx                 # Generación de reportes
│   │   ├── Chat.tsx                    # Chat general
│   │   └── DriveIntegration.tsx        # Integración con Google Drive
│   ├── layout/
│   │   ├── DashboardLayout.tsx         # Layout principal del dashboard
│   │   └── Header.tsx                  # Header de la aplicación
│   ├── ui/                             # 48 componentes shadcn/ui
│   │   ├── button.tsx                  # Componente Button
│   │   ├── card.tsx                    # Componente Card
│   │   ├── dialog.tsx                  # Componente Dialog/Modal
│   │   ├── table.tsx                   # Componente Table
│   │   └── ...                         # Otros componentes UI
│   └── PrivateRoute.tsx                # Componente de ruta protegida
│
├── lib/
│   ├── supabase.ts                     # Cliente y tipos de Supabase
│   ├── supabaseClient.ts               # Inicialización del cliente
│   ├── supabaseService.ts              # Servicios específicos
│   ├── database.ts                     # Servicio de acceso a datos
│   ├── auth.ts                         # Servicio de autenticación
│   ├── mockDatabase.ts                 # Base de datos mock
│   └── utils.ts                        # Utilidades generales
│
├── hooks/
│   ├── use-toast.ts                    # Hook para notificaciones toast
│   └── use-mobile.tsx                  # Hook para detección mobile
│
├── pages/
│   ├── Index.tsx                       # Página principal/landing
│   ├── Dashboard.tsx                   # Página de dashboard
│   └── NotFound.tsx                    # Página 404
│
├── types/
│   └── database.ts                     # Tipos de la base de datos
│
└── __tests__/
    ├── App.test.tsx                    # Tests del componente App
    └── PrivateRoute.test.tsx           # Tests de rutas privadas
```

---

## Servicios Implementados

### 1. **database.ts** - Servicio de Acceso a Datos

Clase `DatabaseService` que encapsula todas las operaciones CRUD con Supabase.

#### Métodos Principales

| Categoría | Método | Descripción |
|-----------|--------|-------------|
| **Perfiles** | `getAllProfiles()` | Obtiene todos los perfiles de usuario |
| | `getAllProfilesWithTaskCounts()` | Perfiles con conteo de tareas pendientes |
| | `getProfileById(id)` | Obtiene perfil por ID |
| | `updateUserRole(id, role)` | Actualiza el rol de un usuario |
| **Empresas** | `getAllEmpresas()` | Lista todas las empresas |
| | `createEmpresa(nombre)` | Crea una nueva empresa |
| | `updateEmpresa(id, nombre)` | Actualiza datos de empresa |
| | `deleteEmpresa(id)` | Elimina una empresa |
| **Casos** | `getAllCasos()` | Obtiene todos los casos |
| | `getCasosWithDetails()` | Casos con datos relacionados |
| | `createCaso(empresaId, clienteId, titulo)` | Crea un nuevo caso |
| | `updateCasoEstado(id, estado)` | Actualiza estado del caso |
| | `deleteCaso(id)` | Elimina un caso |
| **Asignaciones** | `createAsignacion(casoId, usuarioId, rol)` | Asigna profesional a caso |
| | `getAsignacionesByCasoId(casoId)` | Obtiene asignaciones de un caso |
| | `deleteAsignacion(id)` | Elimina una asignación |
| **Tareas** | `getAllTareas()` | Obtiene todas las tareas |
| | `getTareasByCasoId(casoId)` | Tareas de un caso específico |
| | `createTarea(casoId, asignadoA, titulo, descripcion)` | Crea nueva tarea |
| | `updateTarea(id, data)` | Actualiza una tarea |
| | `deleteTarea(id)` | Elimina una tarea |
| **Solicitudes** | `createSolicitudHorasExtra(data)` | Crea solicitud de horas extra |
| | `getSolicitudesByClienteId(clienteId)` | Obtiene solicitudes de un cliente |
| | `updateSolicitudEstado(id, estado)` | Actualiza estado de solicitud |

#### Características Técnicas
- **Manejo de Errores**: Try-catch en todos los métodos con logging
- **Tipo Safety**: TypeScript con tipos importados de `supabase.ts`
- **Async/Await**: Todas las operaciones son asíncronas
- **Single Responsibility**: Un método por operación específica

#### Ejemplo de Implementación

```typescript
async createCaso(empresaId: string, clienteId: string, titulo: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('casos')
      .insert([{
        empresa_id: empresaId,
        cliente_id: clienteId,
        titulo,
        estado: 'activo'
      }])

    if (error) {
      console.error('Error creating caso:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in createCaso:', error)
    return false
  }
}
```

---

### 2. **supabase.ts** - Cliente y Tipos de Supabase

Archivo central para la inicialización del cliente Supabase y definición de tipos.

#### Configuración del Cliente

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Interfaces de Base de Datos

| Interface | Descripción | Campos Principales |
|-----------|-------------|-------------------|
| **Profile** | Perfil de usuario | id, email, full_name, role, created_at |
| **Empresa** | Empresa/Compañía | id, nombre, created_at |
| **Caso** | Caso legal | id, empresa_id, cliente_id, titulo, estado |
| **Asignacion** | Asignación de profesional | id, caso_id, usuario_id, rol_asignado |
| **Tarea** | Tarea del caso | id, caso_id, asignado_a, titulo, descripcion, estado |
| **SolicitudHorasExtra** | Solicitud de horas | id, caso_id, solicitante_id, horas_abogado, horas_analista, estado |

#### Roles del Sistema

```typescript
role: 'pending' | 'cliente' | 'analista' | 'abogado' | 'admin'
```

---

### 3. **auth.ts** - Servicio de Autenticación

Gestiona toda la lógica de autenticación y autorización.

#### Funcionalidades Principales

| Función | Descripción |
|---------|-------------|
| `getCurrentSession()` | Obtiene la sesión actual del usuario |
| `getCurrentUser()` | Obtiene el usuario autenticado |
| `getCurrentProfile()` | Obtiene el perfil completo desde la tabla profiles |
| `signIn(email, password)` | Inicia sesión con credenciales |
| `signUp(email, password, fullName)` | Registra nuevo usuario |
| `signOut()` | Cierra sesión |
| `onAuthStateChange(callback)` | Escucha cambios en el estado de autenticación |

#### Características de Seguridad
- Gestión de sesiones con Supabase Auth
- Validación de roles en el frontend
- Refresh automático de tokens
- Listeners de cambio de estado de autenticación

---

### 4. **mockDatabase.ts** - Base de Datos Mock

Base de datos en memoria usando `localStorage` para desarrollo y testing.

#### Datos Mockeados

| Tabla | Registros | Uso |
|-------|-----------|-----|
| Users | ~5 registros | Usuarios de prueba con diferentes roles |
| Clients | ~3 registros | Empresas cliente de ejemplo |
| Cases | ~2 registros | Casos legales de muestra |
| BMCBlocks | ~9 registros | Bloques de Business Model Canvas |
| Tasks | ~10 registros | Tareas de ejemplo con diferentes estados |
| Documents | ~5 registros | Documentos asociados a casos |
| ChatMessages | ~15 registros | Mensajes de chat de prueba |
| Reports | ~3 registros | Reportes generados |

#### Métodos Implementados
- `initializeDatabase()`: Inicializa datos seed
- `getCasesByClientId(clientId)`: Obtiene casos por cliente
- `getTasksByCaseId(caseId)`: Obtiene tareas de un caso
- `getBMCBlocksByCaseId(caseId)`: Obtiene bloques BMC
- `updateTaskStatus(taskId, status)`: Actualiza estado de tarea
- CRUD completo para todas las entidades

#### Características
- **Persistencia**: Datos guardados en `localStorage`
- **Seed Data**: Datos iniciales para demo
- **Sincronización**: Mantiene consistencia entre sesiones

---

### 5. **supabaseService.ts** - Servicios Específicos

Servicios adicionales y utilidades específicas de Supabase.

#### Funciones Implementadas
- Manejo de subscripciones realtime
- Gestión de storage para archivos
- Funciones helpers para queries complejas
- Utilidades de transformación de datos

---

## Dependencias Externas

### Dependencias de Producción

#### Framework y Core

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **react** | ^18.3.1 | Librería principal para UI |
| **react-dom** | ^18.3.1 | Renderizado de React en DOM |
| **react-router-dom** | ^6.30.1 | Routing y navegación |
| **typescript** | ^5.5.3 | Lenguaje tipado |

#### Backend y Estado

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **@supabase/supabase-js** | ^2.52.0 | Cliente de Supabase |
| **@supabase/auth-ui-react** | ^0.4.7 | Componentes de autenticación |
| **@tanstack/react-query** | ^5.83.0 | Gestión de estado servidor |
| **zustand** | ^4.5.0 | State management global |

#### UI y Estilos

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **tailwindcss** | ^3.4.11 | Framework CSS utility-first |
| **tailwindcss-animate** | ^1.0.7 | Animaciones para Tailwind |
| **@radix-ui/*** | ^1.x - ^2.x | Primitivas UI accesibles (40+ paquetes) |
| **lucide-react** | ^0.462.0 | Iconos |
| **framer-motion** | ^11.0.0 | Animaciones avanzadas |
| **recharts** | ^2.12.7 | Gráficos y visualización de datos |

#### Utilidades

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **react-hook-form** | ^7.53.0 | Manejo de formularios |
| **zod** | ^3.23.8 | Validación de esquemas |
| **date-fns** | ^3.6.0 | Manipulación de fechas |
| **clsx** | ^2.1.1 | Utilidad para clases CSS condicionales |
| **uuid** | ^10.0.0 | Generación de IDs únicos |
| **sonner** | ^1.5.0 | Sistema de notificaciones toast |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **vite** | ^5.4.1 | Build tool y dev server |
| **@vitejs/plugin-react-swc** | ^3.5.0 | Plugin React con SWC compiler |
| **eslint** | ^9.9.0 | Linter de código |
| **typescript-eslint** | ^8.0.1 | ESLint para TypeScript |
| **@metagptx/vite-plugin-source-locator** | latest | Plugin de localización de código |

### Shadcn/UI Components (48 componentes)

La aplicación utiliza **shadcn/ui**, una colección de componentes construidos sobre Radix UI:

- Accordion, Alert, Avatar, Badge, Button, Card, Calendar
- Checkbox, Collapsible, Command, Context Menu, Dialog
- Dropdown Menu, Form, Hover Card, Input, Label, Menubar
- Navigation Menu, Popover, Progress, Radio Group, Scroll Area
- Select, Separator, Sheet, Sidebar, Skeleton, Slider
- Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip
- Y más...

Estos componentes proporcionan:
- ✅ Accesibilidad ARIA completa
- ✅ Teclado navegable
- ✅ Totalmente personalizables con Tailwind
- ✅ TypeScript first

---

## Flujo de Datos

### Arquitectura de Flujo de Datos

```
┌─────────────┐
│  Supabase   │
│  PostgreSQL │
└──────┬──────┘
       │
       ↓ SQL Queries / REST API
┌─────────────────────────────────┐
│    Servicios en /lib/           │
│  ┌─────────────────────────┐    │
│  │  database.ts            │    │
│  │  - DatabaseService      │    │
│  │  - CRUD Operations      │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  auth.ts                │    │
│  │  - Auth Service         │    │
│  │  - Session Management   │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  supabaseService.ts     │    │
│  │  - Realtime subs        │    │
│  │  - File storage         │    │
│  └─────────────────────────┘    │
└────────────┬────────────────────┘
             │
             ↓ Return typed data
┌────────────────────────────────┐
│  React Query / State           │
│  - Caching                     │
│  - Refetching                  │
│  - Optimistic updates          │
└────────────┬───────────────────┘
             │
             ↓ Props / Hooks
┌────────────────────────────────┐
│  Componentes React             │
│  ┌──────────────────────┐      │
│  │  AdminPanel          │      │
│  │  ProfessionalPanel   │      │
│  │  ClientPanel         │      │
│  │  TaskKanban          │      │
│  │  RiskMatrix          │      │
│  └──────────────────────┘      │
└────────────────────────────────┘
```

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. LoginForm → auth.ts → signIn()
   ↓
3. Supabase Auth valida credenciales
   ↓
4. Supabase retorna Session + User
   ↓
5. auth.ts → getCurrentProfile() 
   ↓
6. Database query a tabla 'profiles'
   ↓
7. App.tsx actualiza estado con userProfile
   ↓
8. Router redirige según role:
   - admin → /admin
   - cliente → /client
   - abogado/analista → /professional
   - pending → /pending
```

### Flujo de Gestión de Tareas

```
1. Usuario crea tarea en NewTaskModal
   ↓
2. Formulario valida con react-hook-form + zod
   ↓
3. Llama a database.ts → createTarea()
   ↓
4. DatabaseService ejecuta INSERT en Supabase
   ↓
5. Supabase ejecuta query y retorna resultado
   ↓
6. Si éxito: Toast notification + refetch data
   ↓
7. React Query invalida cache
   ↓
8. TaskKanban re-renderiza con nueva data
```

### Flujo de Actualización en Tiempo Real

```
1. Usuario A crea/modifica registro
   ↓
2. Supabase detecta cambio en tabla
   ↓
3. Realtime subscription emite evento
   ↓
4. supabaseService.ts escucha evento
   ↓
5. Callback actualiza estado local
   ↓
6. Componentes suscritos re-renderizan
   ↓
7. Usuario B ve cambios automáticamente
```

---

## Patrones de Diseño Detectados

### 1. **Component Composition Pattern**

Los componentes se componen de componentes más pequeños reutilizables.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

**Ventajas:**
- Reutilización de código
- Mejor mantenibilidad
- Separación de responsabilidades

---

### 2. **Custom Hooks Pattern**

Hooks personalizados para encapsular lógica reutilizable.

#### Hooks Implementados:

| Hook | Archivo | Propósito |
|------|---------|-----------|
| `useToast` | `use-toast.ts` | Gestión de notificaciones toast |
| `useMobile` | `use-mobile.tsx` | Detección de dispositivo móvil |

**Ejemplo de uso:**
```tsx
const { toast } = useToast()
toast({
  title: "Éxito",
  description: "Tarea creada correctamente"
})
```

---

### 3. **Service Layer Pattern**

Capa de servicios que abstrae la lógica de acceso a datos.

```
Components → Services → Database
```

**Implementación:**
- `database.ts`: DatabaseService class
- `auth.ts`: Funciones de autenticación
- `supabaseService.ts`: Servicios adicionales

**Beneficios:**
- Separación de preocupaciones
- Facilita testing (mockeable)
- Centraliza lógica de negocio

---

### 4. **Provider Pattern**

React Context para compartir estado global.

```tsx
<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <BrowserRouter>
      <Routes>
        {/* Rutas */}
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
</QueryClientProvider>
```

**Contextos Utilizados:**
- QueryClient (React Query)
- TooltipProvider (Radix UI)
- Router Context (React Router)

---

### 5. **Modal/Dialog Pattern**

Uso extensivo de modales para interacciones secundarias.

#### Modales Implementados:

| Modal | Componente | Propósito |
|-------|-----------|-----------|
| Edición de tareas | `TaskEditModal` | Editar tareas existentes |
| Nueva tarea | `NewTaskModal` | Crear nueva tarea |
| Chat de tarea | `TaskChatModal` | Chat contextual por tarea |
| Solicitud de horas | `RequestMoreHoursDialog` | Solicitar horas extra |

**Patrón de Uso:**
```tsx
const [isOpen, setIsOpen] = useState(false)

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Contenido del modal */}
  </DialogContent>
</Dialog>
```

---

### 6. **Protected Routes Pattern**

Rutas protegidas basadas en autenticación y roles.

```tsx
<PrivateRoute 
  isAuthenticated={isAuthenticated} 
  userRole={userProfile?.role}
  allowedRoles={['admin']}
>
  <AdminPanel />
</PrivateRoute>
```

**Implementación:**
- Verifica autenticación
- Valida rol del usuario
- Redirige si no autorizado

---

### 7. **Singleton Pattern**

Instancia única de servicios compartidos.

```typescript
export const dbService = new DatabaseService()
```

**Servicios Singleton:**
- `dbService` en `database.ts`
- `supabase` client en `supabase.ts`
- `authService` en `auth.ts`

---

### 8. **Factory Pattern**

Funciones factory para crear objetos complejos.

```typescript
const createTaskData = (formData: FormData): Task => {
  return {
    task_id: uuid(),
    caso_id: formData.casoId,
    titulo: formData.titulo,
    // ... más campos
  }
}
```

---

### 9. **Observer Pattern (Implicit)**

A través de React Query y Supabase Realtime.

```typescript
// Supabase Realtime subscription
supabase
  .channel('public:tareas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, 
    (payload) => {
      // Actualizar estado
    }
  )
  .subscribe()
```

---

### 10. **Error Boundary Pattern**

Manejo de errores a nivel de componente.

```tsx
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

---

## Módulos y Componentes Principales

### Paneles por Rol

#### 1. **AdminPanel** (`components/admin/AdminPanel.tsx`)

Panel completo de administración del sistema.

**Características:**
- Gestión de usuarios (aprobación de cuentas pendientes)
- CRUD de empresas
- CRUD de casos
- Asignación de profesionales a casos
- Gestión de tareas
- Dashboard con estadísticas
- Vista de solicitudes de horas extra

**Tabs Implementadas:**
- 📊 Dashboard: Estadísticas generales
- 👥 Usuarios: Gestión de perfiles
- 🏢 Empresas: CRUD de empresas
- 📁 Casos: Gestión de casos legales
- ✅ Tareas: Vista y gestión de todas las tareas

**Estado Gestionado:**
- Users list con conteo de tareas
- Pending users
- Empresas
- Casos con detalles
- Dashboard stats

---

#### 2. **ProfessionalPanel** (`components/professional/ProfessionalPanel.tsx`)

Panel para abogados y analistas.

**Características:**
- Vista de casos asignados
- Lista de tareas propias
- Solicitud de horas extra
- Registro de horas trabajadas
- Estado de casos

**Funcionalidades:**
- ✅ Ver casos asignados
- ✅ Gestionar tareas
- ✅ Solicitar horas adicionales
- ✅ Actualizar estado de tareas

---

#### 3. **ClientPanel** (`components/client/ClientPanel.tsx`)

Panel para clientes de las empresas.

**Características:**
- Vista de casos propios
- Seguimiento de tareas
- Aprobación/rechazo de solicitudes de horas extra
- Visualización de presupuesto consumido
- Comunicación con equipo legal

**Funcionalidades:**
- ✅ Ver casos y su progreso
- ✅ Revisar tareas
- ✅ Aprobar/rechazar solicitudes
- ✅ Ver reportes

---

### Componentes de Dashboard

#### 4. **TaskKanban** (`components/dashboard/TaskKanban.tsx`)

Tablero Kanban para gestión visual de tareas.

**Columnas:**
- Pendiente
- En Proceso
- Completada

**Características:**
- Drag & drop entre columnas
- Filtrado por caso
- Priorización visual (alta/media/baja)
- Iconos por tipo de responsable
- Edición rápida de tareas
- Chat contextual por tarea

**Acciones:**
- Crear nueva tarea
- Editar tarea existente
- Ver chat de tarea
- Cambiar estado

---

#### 5. **RiskMatrix** (`components/dashboard/RiskMatrix.tsx`)

Matriz de riesgos basada en Business Model Canvas.

**Bloques BMC:**
1. Customer Segments
2. Value Proposition
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partners
9. Cost Structure

**Niveles de Riesgo:**
- 🟢 Verde: Sin riesgos
- 🟡 Amarillo: Riesgo medio
- 🔴 Rojo: Riesgo alto

**Información por Bloque:**
- Nivel de riesgo
- Descripción del riesgo
- Recomendación
- Última actualización

---

#### 6. **CollaboratorManager** (`components/dashboard/CollaboratorManager.tsx`)

Gestión de colaboradores adicionales del cliente.

**Características:**
- Añadir colaboradores
- Asignar roles (colaborador/administrador)
- Gestionar permisos
- Eliminar colaboradores

---

#### 7. **Reports** (`components/dashboard/Reports.tsx`)

Generación y visualización de reportes.

**Tipos de Reportes:**
- Reporte de progreso de caso
- Reporte de riesgos
- Reporte de horas trabajadas
- Análisis de tiempo

---

### Componentes de Autenticación

#### 8. **LoginPage** (`components/auth/LoginPage.tsx`)

Página de inicio de sesión.

**Características:**
- Formulario de login/registro
- Validación de campos
- Manejo de errores
- Redirección post-login

#### 9. **PendingAuthorization** (`components/auth/PendingAuthorization.tsx`)

Vista para usuarios registrados pero no aprobados.

**Mensaje:**
- Estado de cuenta pendiente
- Instrucciones de espera
- Opción de logout

---

### Componentes UI Reutilizables

**48 componentes shadcn/ui** proporcionan la base de la interfaz:

| Categoría | Componentes |
|-----------|-------------|
| **Inputs** | Button, Input, Textarea, Checkbox, Radio, Switch, Slider, Select |
| **Layout** | Card, Sheet, Dialog, Tabs, Accordion, Collapsible, Separator |
| **Feedback** | Toast, Alert, Progress, Skeleton, Badge |
| **Navigation** | Dropdown Menu, Context Menu, Menubar, Navigation Menu, Breadcrumb |
| **Overlays** | Dialog, Drawer, Popover, Tooltip, Hover Card |
| **Data Display** | Table, Avatar, Calendar, Chart, Carousel |
| **Forms** | Form, Label, Input OTP |

---

## Módulos Incompletos o Mockeados

### 1. **mockDatabase.ts** - Base de Datos Mock

**Estado:** 🟡 Implementado parcialmente

**Propósito:**
- Desarrollo sin necesidad de Supabase activo
- Testing rápido de UI
- Demostración de funcionalidades

**Limitaciones:**
- Datos solo en `localStorage` (no persistentes entre navegadores)
- No simula latencia de red
- Sin validación de integridad referencial completa
- Relaciones entre entidades simplificadas

**Datos Mockeados:**
- ✅ Users (5 registros)
- ✅ Clients (3 registros)
- ✅ Cases (2 registros)
- ✅ BMC Blocks (9 registros)
- ✅ Tasks (10+ registros)
- ✅ Documents (5 registros)
- ✅ Chat Messages (15+ registros)
- ✅ Reports (3 registros)

**Recomendación:**
- Migrar completamente a Supabase en producción
- Mantener mock solo para tests unitarios
- Implementar faker.js para datos de prueba más realistas

---

### 2. **DriveIntegration.tsx** - Integración con Google Drive

**Estado:** 🔴 No implementado / Placeholder

**Funcionalidad Esperada:**
- Listar archivos del caso desde Google Drive
- Subir documentos directamente
- Sincronización bidireccional
- Permisos por rol

**Actual:**
- Componente placeholder
- UI básica sin funcionalidad real

**Requerimientos para Implementar:**
- Google Drive API credentials
- OAuth2 flow para autenticación
- SDK de Google Drive
- Gestión de tokens de acceso

**Complejidad:** Alta

---

### 3. **Chat.tsx** - Sistema de Chat General

**Estado:** 🟡 Implementado básicamente

**Implementado:**
- UI de chat
- Mensajes mockeados
- Display de usuarios

**No Implementado:**
- Persistencia real de mensajes
- Supabase Realtime para chat en vivo
- Notificaciones de mensajes nuevos
- Indicador de "escribiendo..."
- Búsqueda en historial
- Adjuntos de archivos

**Recomendación:**
- Integrar Supabase Realtime subscriptions
- Crear tabla `chat_messages` en Supabase
- Implementar notificaciones con web push

---

### 4. **Reports.tsx** - Generación de Reportes

**Estado:** 🟡 Parcialmente implementado

**Implementado:**
- Listado de reportes existentes
- UI básica de reportes

**No Implementado:**
- Generación de PDF
- Exportación a Excel
- Gráficos dinámicos (aunque recharts está disponible)
- Reportes personalizables
- Programación de reportes automáticos

**Requerimientos:**
- Librería PDF (react-pdf, jsPDF)
- Plantillas de reportes
- Lógica de agregación de datos
- Sistema de colas para generación asíncrona

---

### 5. **ProgressTimeline.tsx** - Línea de Tiempo

**Estado:** 🟡 Implementación básica

**Implementado:**
- Timeline UI
- Eventos básicos

**No Implementado:**
- Eventos en tiempo real desde DB
- Filtrado por tipo de evento
- Detalle expandido de eventos
- Eventos automáticos (ej: cambio de estado)

---

### 6. **Notificaciones en Tiempo Real**

**Estado:** 🔴 No implementado

**Funcionalidad Faltante:**
- Sistema de notificaciones push
- Badges de notificaciones no leídas
- Centro de notificaciones
- Preferencias de notificación por usuario

**Complejidad:** Media

---

### 7. **Solicitudes de Horas Extra**

**Estado:** 🟢 Parcialmente funcional

**Implementado:**
- Formulario de solicitud
- Listado de solicitudes
- Cambio de estado (aprobar/rechazar)

**Faltante:**
- Validación de presupuesto disponible
- Historial completo de solicitudes
- Notificaciones automáticas
- Reportes de horas consumidas vs presupuestadas

---

### 8. **Sistema de Permisos Granular**

**Estado:** 🔴 No implementado

**Actual:**
- Permisos básicos por rol (admin, cliente, analista, abogado)

**Faltante:**
- Permisos específicos por recurso
- Permisos a nivel de caso
- Permisos personalizados por usuario
- Audit log de acciones

---

### 9. **Búsqueda Global**

**Estado:** 🔴 No implementado

**Funcionalidad Esperada:**
- Buscar en todos los casos
- Buscar en tareas
- Buscar en documentos
- Búsqueda full-text
- Filtros avanzados

---

### 10. **Facturación e Integración Contable**

**Estado:** 🔴 No implementado

**Funcionalidad en Roadmap:**
- Generación de facturas
- Integración con sistemas contables
- Tracking de pagos
- Estados de cuenta

---

## Recomendaciones de Arquitectura

### Para Escalar el Sistema

#### 1. **Migración Completa a Supabase**

**Prioridad:** 🔴 Alta

**Acción:**
- Eliminar dependencia de `mockDatabase.ts` en producción
- Asegurar que todos los componentes usan `database.ts`
- Implementar seeding script en Supabase para datos de prueba

**Beneficios:**
- Datos persistentes y consistentes
- Mejor rendimiento
- Realtime capabilities
- Backup automático

---

#### 2. **Implementar Row Level Security (RLS) Completo**

**Prioridad:** 🔴 Alta

**Estado Actual:**
- RLS básico en tabla `profiles`

**Recomendación:**
- Policies para todas las tablas
- Verificar acceso por rol en DB level
- Prevenir acceso no autorizado desde cliente

**Ejemplo de Policy:**
```sql
CREATE POLICY "Clientes solo ven sus casos" ON casos
  FOR SELECT USING (
    cliente_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analista', 'abogado')
    )
  );
```

---

#### 3. **Implementar Sistema de Caché con React Query**

**Prioridad:** 🟡 Media

**Estado Actual:**
- React Query instalado pero uso limitado

**Recomendación:**
- Usar `useQuery` para todas las lecturas
- Implementar `useMutation` para escrituras
- Configurar stale time y cache time apropiados
- Optimistic updates para mejor UX

**Ejemplo:**
```typescript
const { data: casos, isLoading } = useQuery({
  queryKey: ['casos'],
  queryFn: () => dbService.getAllCasos(),
  staleTime: 5 * 60 * 1000, // 5 minutos
})
```

---

#### 4. **Separar Lógica de Negocio en Custom Hooks**

**Prioridad:** 🟡 Media

**Problema Actual:**
- Mucha lógica en componentes
- Difícil de testear

**Solución:**
```typescript
// hooks/useCasos.ts
export function useCasos() {
  const { data, isLoading, error } = useQuery(['casos'], 
    () => dbService.getAllCasos()
  )
  
  const createCaso = useMutation((data) => 
    dbService.createCaso(data)
  )
  
  return { casos: data, isLoading, error, createCaso }
}
```

**Hooks Recomendados:**
- `useCasos()`
- `useTareas()`
- `useEmpresas()`
- `useAuth()`
- `usePermissions()`

---

#### 5. **Implementar Zustand para Estado Global**

**Prioridad:** 🟡 Media

**Zustand ya está instalado pero no usado.**

**Casos de Uso:**
- Estado de usuario actual
- Configuración de UI (tema, idioma)
- Notificaciones globales
- Filtros globales

**Ejemplo:**
```typescript
// stores/authStore.ts
import create from 'zustand'

interface AuthState {
  user: Profile | null
  setUser: (user: Profile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

---

#### 6. **Implementar Logging y Monitoring**

**Prioridad:** 🟡 Media

**Herramientas Recomendadas:**
- **Sentry** para error tracking
- **LogRocket** para session replay
- **Supabase Logs** para backend logs

**Implementación:**
```typescript
// lib/logger.ts
import * as Sentry from "@sentry/react"

export const logger = {
  error: (error: Error, context?: any) => {
    console.error(error)
    Sentry.captureException(error, { extra: context })
  },
  info: (message: string, data?: any) => {
    console.log(message, data)
  }
}
```

---

#### 7. **Implementar Testing Sistemático**

**Prioridad:** 🟡 Media

**Estado Actual:**
- Infraestructura de testing mínima
- 2 tests básicos

**Recomendación:**
- Unit tests para servicios (database.ts, auth.ts)
- Integration tests para componentes principales
- E2E tests para flujos críticos

**Stack Recomendado:**
- **Vitest** (ya compatible con Vite)
- **React Testing Library**
- **Playwright** para E2E

**Cobertura Objetivo:**
- Servicios: 80%+
- Componentes: 60%+
- E2E: Flujos críticos

---

#### 8. **Optimizar Rendimiento**

**Prioridad:** 🟢 Baja (implementar cuando haya problemas)

**Técnicas:**

##### Code Splitting
```typescript
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'))
const ClientPanel = lazy(() => import('./components/client/ClientPanel'))

<Suspense fallback={<Skeleton />}>
  <AdminPanel />
</Suspense>
```

##### Memoization
```typescript
const expensiveComputation = useMemo(() => 
  computeComplexData(data),
  [data]
)

const MemoizedComponent = memo(Component)
```

##### Virtual Scrolling
Para listas largas, usar `react-window` o `react-virtual`

##### Image Optimization
- Lazy loading de imágenes
- Formatos modernos (WebP, AVIF)
- CDN para assets estáticos

---

#### 9. **Implementar CI/CD Pipeline**

**Prioridad:** 🟡 Media

**Pipeline Recomendado:**

```yaml
# .github/workflows/ci.yml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install deps
        run: npm install
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm run test
      - name: Build
        run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

**Beneficios:**
- Calidad de código consistente
- Detección temprana de bugs
- Deployment automático

---

#### 10. **Documentación Técnica Continua**

**Prioridad:** 🟡 Media

**Áreas a Documentar:**
- ✅ Arquitectura general (este documento)
- ⬜ API de servicios (JSDoc)
- ⬜ Storybook para componentes UI
- ⬜ Guía de contribución
- ⬜ Runbook de operaciones
- ⬜ Diagramas de secuencia

**Herramientas:**
- **Storybook** para componentes
- **TypeDoc** para generar docs de API
- **Mermaid** para diagramas en Markdown

---

#### 11. **Implementar Feature Flags**

**Prioridad:** 🟢 Baja

**Propósito:**
- Activar/desactivar features sin deploy
- A/B testing
- Rollout gradual de features

**Herramientas:**
- LaunchDarkly
- Unleash (open source)
- ConfigCat

---

#### 12. **Mejorar Accesibilidad (a11y)**

**Prioridad:** 🟡 Media

**Estado Actual:**
- Radix UI proporciona buena base

**Mejoras:**
- Audit con Lighthouse
- Keyboard navigation completa
- Screen reader testing
- ARIA labels apropiados
- Contraste de colores WCAG AA

---

#### 13. **Implementar Internacionalización (i18n)**

**Prioridad:** 🟢 Baja (si se requiere multi-idioma)

**Librería Recomendada:**
- react-i18next

**Implementación:**
```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('welcome')}</h1>
}
```

---

#### 14. **Seguridad Endurecida**

**Prioridad:** 🔴 Alta

**Checklist:**
- ✅ Environment variables no expuestas
- ⬜ Content Security Policy (CSP)
- ⬜ HTTPS only
- ⬜ Rate limiting en APIs
- ⬜ Input sanitization
- ⬜ SQL injection prevention (RLS ayuda)
- ⬜ XSS prevention
- ⬜ CSRF tokens
- ⬜ Audit logs de acciones sensibles

**Headers de Seguridad:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=()'
    }
  }
})
```

---

#### 15. **Estructura de Microservicios (Futuro)**

**Prioridad:** 🟢 Baja (solo si se escala mucho)

**Cuando Considerar:**
- Más de 100,000 usuarios activos
- Múltiples equipos trabajando
- Necesidad de escalar componentes independientemente

**Posible Estructura:**
```
legality360-frontend (React)
    ↓
legality360-api-gateway
    ↓
    ├── auth-service
    ├── cases-service
    ├── tasks-service
    ├── billing-service
    └── notifications-service
```

---

## Conclusiones

### Fortalezas del Sistema Actual

✅ **Arquitectura Clara**: Separación de responsabilidades bien definida
✅ **Stack Moderno**: React 18, TypeScript, Vite, Supabase
✅ **UI Profesional**: shadcn/ui proporciona componentes de alta calidad
✅ **Tipado Fuerte**: TypeScript en todo el codebase
✅ **Autenticación Robusta**: Supabase Auth con RLS
✅ **Componentes Reutilizables**: Biblioteca de 48+ componentes UI

### Áreas de Mejora Prioritarias

🔴 **Alta Prioridad:**
1. Completar migración a Supabase (eliminar mock)
2. Implementar RLS completo en todas las tablas
3. Fortalecer seguridad (CSP, rate limiting, audit logs)

🟡 **Media Prioridad:**
4. Implementar testing sistemático
5. Optimizar con React Query y custom hooks
6. Implementar CI/CD pipeline
7. Sistema de logging y monitoring

🟢 **Baja Prioridad:**
8. Internacionalización (si se requiere)
9. Optimizaciones de rendimiento avanzadas
10. Feature flags

### Escalabilidad

El sistema está bien arquitectado para crecer. Con las mejoras recomendadas, puede escalar a:
- **Usuarios:** 10,000+ usuarios concurrentes
- **Casos:** 100,000+ casos activos
- **Tareas:** 1,000,000+ tareas
- **Tiempo de respuesta:** < 100ms para queries típicas

### Mantenibilidad

**Score: 8/10**

- ✅ Código bien organizado
- ✅ TypeScript proporciona seguridad de tipos
- ✅ Componentes modulares
- ⚠️ Falta documentación inline (JSDoc)
- ⚠️ Cobertura de tests insuficiente

---

## Glosario

| Término | Definición |
|---------|-----------|
| **BMC** | Business Model Canvas - Marco de 9 bloques para modelar negocios |
| **RLS** | Row Level Security - Seguridad a nivel de fila en PostgreSQL |
| **CRUD** | Create, Read, Update, Delete - Operaciones básicas de base de datos |
| **SPA** | Single Page Application - Aplicación de una sola página |
| **SSR** | Server Side Rendering - Renderizado del lado del servidor |
| **CSP** | Content Security Policy - Política de seguridad de contenido |
| **i18n** | Internationalization - Internacionalización |
| **a11y** | Accessibility - Accesibilidad |

---

**Documento generado:** 2024  
**Versión:** 1.0  
**Autor:** Equipo Legality360  
**Última actualización:** [Fecha actual]

