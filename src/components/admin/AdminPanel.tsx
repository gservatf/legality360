import { useState, useEffect } from 'react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Loader2, Users, Building2, Briefcase, Plus,
  Edit, Trash2, CheckCircle, AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { dbService } from '@/lib/database'
import {
  Profile, Empresa, Caso, Tarea,
  ProfileWithTaskCount, CasoWithDetails
} from '@/lib/supabase'

// Constantes centralizadas
const ROLES: Profile['role'][] = ['admin', 'analista', 'abogado', 'cliente', 'pending']
const TAREA_ESTADOS = ['pendiente', 'en_progreso', 'completada'] as const
const CASO_ESTADOS = ['activo', 'cerrado'] as const

interface AdminPanelProps {
  onLogout: () => void
}

interface DashboardStats {
  total_usuarios: number
  usuarios_pendientes: number
  total_empresas: number
  total_casos: number
  casos_activos: number
  total_tareas: number
  tareas_pendientes: number
  mis_tareas_pendientes: number
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  

  const [users, setUsers] = useState<ProfileWithTaskCount[]>([])
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [newEmpresa, setNewEmpresa] = useState('')
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_usuarios: 0,
    usuarios_pendientes: 0,
    total_empresas: 0,
    total_casos: 0,
    casos_activos: 0,
    total_tareas: 0,
    tareas_pendientes: 0,
    mis_tareas_pendientes: 0
  })

  // Estados para selects y entradas
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('')
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [newTituloCaso, setNewTituloCaso] = useState<string>('')
  const [selectedCasoId, setSelectedCasoId] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [newTituloTarea, setNewTituloTarea] = useState<string>('')
    total_usuarios: 0,
    usuarios_pendientes: 0,
    total_empresas: 0,
    total_casos: 0,
    casos_activos: 0,
    total_tareas: 0,
    tareas_pendientes: 0,
    mis_tareas_pendientes: 0
  })

  // Limpieza automática de mensajes
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  useEffect(() => {
    loadCurrentUser()
    loadData()
  }, [activeTab])

  const loadCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setCurrentUser(profile)
      }
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const canAccessAdminPanel = () => currentUser?.role === 'admin'

  const loadData = async () => {
    try {
      setIsLoading(true)
      const dashboardStats = await dbService.getDashboardStats()
      setStats(dashboardStats)

      switch (activeTab) {
        case 'usuarios':
          setUsers(await dbService.getAllProfilesWithTaskCounts())
          setPendingUsers(await dbService.getPendingUsers())
          break
        case 'empresas':
          setEmpresas(await dbService.getAllEmpresas())
          break
        case 'casos':
          setCasos(await dbService.getAllCasosWithDetails())
          setEmpresas(await dbService.getAllEmpresas())
          setUsers((await dbService.getAllProfiles()).filter(u => u.role === 'cliente'))
          break
        case 'tareas':
          setTareas(await dbService.getTareasByUser(currentUser?.id || ''))
          setCasos(await dbService.getAllCasosWithDetails())
          setUsers(await dbService.getAllProfiles())
          break
      }
    } catch (err) {
      setError('Error al cargar los datos')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

  if (!canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">No tienes permisos para acceder al panel de administración.</p>
            <Button onClick={onLogout} variant="outline">Cerrar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
          <Button onClick={onLogout} variant="destructive">Cerrar Sesión</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando datos...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="usuarios"><Users className="h-4 w-4 mr-1" />Usuarios</TabsTrigger>
            <TabsTrigger value="empresas"><Building2 className="h-4 w-4 mr-1" />Empresas</TabsTrigger>
            <TabsTrigger value="casos"><Briefcase className="h-4 w-4 mr-1" />Casos</TabsTrigger>
            <TabsTrigger value="tareas"><CheckCircle className="h-4 w-4 mr-1" />Tareas</TabsTrigger>
          </TabsList>

         <TabsContent value="usuarios">
  <Card>
    <CardHeader>
      <CardTitle>Gestión de Usuarios</CardTitle>
      <CardDescription>
        {stats.total_usuarios} usuarios en total — {stats.usuarios_pendientes} pendientes de aprobación
      </CardDescription>
    </CardHeader>
    <CardContent>
      <h3 className="font-semibold mb-2">Usuarios Pendientes</h3>
      {pendingUsers.length === 0 ? (
        <p className="text-gray-500 mb-4">No hay usuarios pendientes</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.full_name || 'Sin nombre'}</TableCell>
                <TableCell>
                  <Select
                    onValueChange={async (role) => {
                      const ok = await dbService.updateProfileRole(u.id, role as Profile['role'])
                      if (ok) {
                        setSuccess(`Usuario ${u.email} aprobado como ${role}`)
                        loadData()
                      } else {
                        setError('Error al actualizar el rol')
                      }
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Asignar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.filter((r) => r !== 'pending').map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <h3 className="font-semibold mt-6 mb-2">Todos los Usuarios</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Tareas Pendientes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.full_name}</TableCell>
              <TableCell>
                <Badge>{u.role}</Badge>
              </TableCell>
              <TableCell>{u.tareas_pendientes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>


          <TabsContent value="empresas">
  <Card>
    <CardHeader>
      <CardTitle>Gestión de Empresas</CardTitle>
      <CardDescription>
        {stats.total_empresas} empresas registradas
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Nombre de la nueva empresa"
          value={newEmpresa}
          onChange={(e) => setNewEmpresa(e.target.value)}
        />
        <Button
          onClick={async () => {
            if (!newEmpresa.trim()) return
            const ok = await dbService.createEmpresa(newEmpresa.trim())
            if (ok) {
              setSuccess(`Empresa "${newEmpresa}" creada correctamente`)
              setNewEmpresa('')
              loadData()
            } else {
              setError('Error al crear empresa')
            }
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Agregar
        </Button>
      </div>

      {empresas.length === 0 ? (
        <p className="text-gray-500">No hay empresas registradas</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.nombre}</TableCell>
                <TableCell className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Empresa</DialogTitle>
                        <DialogDescription>
                          Cambia el nombre de la empresa
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        defaultValue={e.nombre}
                        onChange={(ev) => (e.nombre = ev.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          onClick={async () => {
                            const ok = await dbService.updateEmpresa(e.id, e.nombre)
                            if (ok) {
                              setSuccess(`Empresa actualizada a "${e.nombre}"`)
                              loadData()
                            } else {
                              setError('Error al actualizar empresa')
                            }
                          }}
                        >
                          Guardar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      const ok = await dbService.deleteEmpresa(e.id)
                      if (ok) {
                        setSuccess(`Empresa "${e.nombre}" eliminada`)
                        loadData()
                      } else {
                        setError('Error al eliminar empresa')
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
</TabsContent>



        <TabsContent value="casos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Casos</CardTitle>
              <CardDescription>
                {stats.total_casos} casos en total — {stats.casos_activos} activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Crear Caso */}
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <Label>Empresa</Label>
                  <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Cliente</Label>
                  <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'cliente').map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Título</Label>
                  <Input
                    placeholder="Ej: Demanda laboral"
                    value={newTituloCaso}
                    onChange={(e) => setNewTituloCaso(e.target.value)}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!selectedEmpresaId || !selectedClienteId || !newTituloCaso.trim()) {
                      setError('Selecciona empresa, cliente y título antes de crear el caso')
                      return
                    }
                    const ok = await dbService.createCaso(selectedEmpresaId, selectedClienteId, newTituloCaso.trim())
                    if (ok) {
                      setSuccess('Caso creado correctamente')
                      setNewTituloCaso('')
                      setSelectedEmpresaId('')
                      setSelectedClienteId('')
                      loadData()
                    } else {
                      setError('Error al crear el caso')
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Crear Caso
                </Button>
              </div>
              {/* Listado de Casos */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tareas Pendientes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {casos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.titulo}</TableCell>
                      <TableCell>{c.empresa?.nombre}</TableCell>
                      <TableCell>{c.cliente?.full_name || c.cliente?.email}</TableCell>
                      <TableCell>
                        <Badge variant={c.estado === 'activo' ? 'default' : 'secondary'}>
                          {c.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.tareas_pendientes}</TableCell>
                      <TableCell>
                        {c.estado === 'activo' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const ok = await dbService.updateCasoEstado(c.id, 'cerrado')
                              if (ok) {
                                setSuccess('Caso cerrado')
                                loadData()
                              } else {
                                setError('Error al cerrar caso')
                              }
                            }}
                          >
                            Cerrar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

  <Card>
    <CardHeader>
      <CardTitle>Gestión de Casos</CardTitle>
      <CardDescription>
        {stats.total_casos} casos en total — {stats.casos_activos} activos
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Crear Caso */}
      <div className="flex items-end gap-4 mb-6">
        <div className="flex-1">
          <Label>Empresa</Label>
          <Select onValueChange={(empresaId) => setEmpresas(
            empresas.map(e => e.id === empresaId ? { ...e, selected: true } : { ...e, selected: false })
          )}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona empresa" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Cliente</Label>
          <Select onValueChange={(clienteId) => setUsers(
            users.map(u => u.id === clienteId ? { ...u, selected: true } : { ...u, selected: false })
          )}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona cliente" />
            </SelectTrigger>
            <SelectContent>
              {users.filter(u => u.role === 'cliente').map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Título</Label>
          <Input
            placeholder="Ej: Demanda laboral"
            onChange={(e) => setCasos(prev => [...prev.slice(0, -1), { ...prev[prev.length - 1], titulo: e.target.value }])}
          />
        </div>

        <Button
          onClick={async () => {
            const empresaSel = empresas.find(e => (e as any).selected)
            const clienteSel = users.find(u => (u as any).selected)

            if (!empresaSel || !clienteSel) {
              setError('Selecciona empresa y cliente antes de crear el caso')
              return
            }

            const ok = await dbService.createCaso(empresaSel.id, clienteSel.id, casos[casos.length - 1]?.titulo || 'Nuevo caso')
            if (ok) {
              setSuccess('Caso creado correctamente')
              loadData()
            } else {
              setError('Error al crear el caso')
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Crear Caso
        </Button>
      </div>

      {/* Listado de Casos */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tareas Pendientes</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {casos.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.titulo}</TableCell>
              <TableCell>{c.empresa?.nombre}</TableCell>
              <TableCell>{c.cliente?.full_name || c.cliente?.email}</TableCell>
              <TableCell>
                <Badge variant={c.estado === 'activo' ? 'default' : 'secondary'}>
                  {c.estado}
                </Badge>
              </TableCell>
              <TableCell>{c.tareas_pendientes}</TableCell>
              <TableCell>
                {c.estado === 'activo' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const ok = await dbService.updateTareaEstado(c.id, 'cerrado' as any)
                      if (ok) {
                        setSuccess('Caso cerrado')
                        loadData()
                      } else {
                        setError('Error al cerrar caso')
                      }
                    }}
                  >
                    Cerrar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>



        <TabsContent value="tareas">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Tareas</CardTitle>
              <CardDescription>
                {stats.total_tareas} tareas en total — {stats.tareas_pendientes} pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Crear Tarea */}
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <Label>Caso</Label>
                  <Select value={selectedCasoId} onValueChange={setSelectedCasoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona caso" />
                    </SelectTrigger>
                    <SelectContent>
                      {casos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Asignado a</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Título</Label>
                  <Input
                    placeholder="Ej: Redactar demanda"
                    value={newTituloTarea}
                    onChange={(e) => setNewTituloTarea(e.target.value)}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!selectedCasoId || !selectedUserId || !newTituloTarea.trim()) {
                      setError('Selecciona un caso, usuario y título antes de crear la tarea')
                      return
                    }
                    const ok = await dbService.createTarea(selectedCasoId, selectedUserId, newTituloTarea.trim())
                    if (ok) {
                      setSuccess('Tarea creada correctamente')
                      setNewTituloTarea('')
                      setSelectedCasoId('')
                      setSelectedUserId('')
                      loadData()
                    } else {
                      setError('Error al crear la tarea')
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Crear Tarea
                </Button>
              </div>
              {/* Listado de Tareas */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Caso</TableHead>
                    <TableHead>Asignado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tareas.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.titulo}</TableCell>
                      <TableCell>{t.caso?.titulo || 'Sin caso'}</TableCell>
                      <TableCell>{t.asignado?.full_name || t.asignado_a}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.estado === 'pendiente'
                              ? 'destructive'
                              : t.estado === 'en_progreso'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {t.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.fecha_limite ? formatDate(t.fecha_limite) : '-'}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={t.estado}
                          onValueChange={async (nuevoEstado) => {
                            const ok = await dbService.updateTareaEstado(t.id, nuevoEstado)
                            if (ok) {
                              setSuccess(`Tarea actualizada a ${nuevoEstado}`)
                              loadData()
                            } else {
                              setError('Error al actualizar tarea')
                            }
                          }}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Cambiar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {TAREA_ESTADOS.map((e) => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
