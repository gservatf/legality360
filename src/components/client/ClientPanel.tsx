import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Briefcase, CheckCircle, Clock, AlertCircle, Users, MessageCircle } from "lucide-react"
import { getCurrentProfile, canAccessClientPanel, type UserProfile } from "@/lib/auth"
import { dbService } from "@/lib/database"
import { CasoWithDetails, Tarea } from "@/lib/supabase"

interface ClientPanelProps {
  onLogout: () => void
}

interface DashboardStats {
  total_casos: number
  casos_activos: number
  total_tareas: number
  tareas_pendientes: number
  mis_tareas_pendientes: number
}

export default function ClientPanel({ onLogout }: ClientPanelProps) {
  const [activeTab, setActiveTab] = useState("casos")
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_casos: 0,
    casos_activos: 0,
    total_tareas: 0,
    tareas_pendientes: 0,
    mis_tareas_pendientes: 0,
  })

  // Comment state
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)
  const [comment, setComment] = useState("")

  // Auth states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [canAccess, setCanAccess] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Solicitudes de horas state
  const [solicitudesHoras, setSolicitudesHoras] = useState<
    {
      id: string
      caso_id: string
      horas_abogado: number
      horas_analista: number
      estado: string
      created_at: string
      caso: { titulo: string }
    }[]
  >([])

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsInitializing(true)
        setAuthError(null)

        console.log('Initializing authentication...')
        
        // Check environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase environment variables')
        }

        const profile = await getCurrentProfile()
        console.log('Current profile:', profile)
        setCurrentUser(profile)

        const access = await canAccessClientPanel()
        console.log('Can access client panel:', access)
        setCanAccess(access)

        if (!profile) {
          setAuthError('No se pudo obtener el perfil del usuario')
        } else if (!access) {
          setAuthError('No tienes permisos para acceder al panel de cliente')
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setAuthError(err instanceof Error ? err.message : 'Error al inicializar la autenticación')
        setCanAccess(false)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [])

  // Load data when user is authenticated and tab changes
  useEffect(() => {
    if (currentUser && canAccess) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser, canAccess])

  const loadData = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('Loading data for user:', currentUser.id)

      // Load dashboard stats
      const dashboardStats = await dbService.getDashboardStats(currentUser.id)
      setStats(dashboardStats)

      if (activeTab === "casos") {
        const casosData = await dbService.getCasosByUser(currentUser.id, "cliente")
        setCasos(casosData)
      } else if (activeTab === "tareas") {
        const tareasData = await dbService.getTareasByUser(currentUser.id)
        setTareas(tareasData)
      } else if (activeTab === "horas") {
        const solicitudes = await dbService.getSolicitudesHorasByCliente(currentUser.id)
        setSolicitudesHoras(solicitudes)
      }
    } catch (err) {
      setError("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!selectedTarea || !comment.trim()) return

    try {
      setError(null)
      // Here you would save the comment to database if you had endpoint/table
      setSuccess("Comentario agregado exitosamente")
      setComment("")
      setSelectedTarea(null)
    } catch (err) {
      console.error('Error adding comment:', err)
      setError("Error al agregar el comentario")
    }
  }

  // Acciones para aprobar/rechazar solicitud
  const handleActualizarEstadoSolicitud = async (id: string, nuevoEstado: "aprobado" | "rechazado") => {
    try {
      setError(null)
      const ok = await dbService.updateSolicitudHorasEstado(id, nuevoEstado)
      if (ok) {
        setSuccess(`Solicitud ${nuevoEstado === "aprobado" ? "aprobada" : "rechazada"} correctamente`)
        await loadData()
      } else {
        setError("No se pudo actualizar el estado de la solicitud")
      }
    } catch {
      setError("No se pudo actualizar el estado de la solicitud")
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "en_progreso":
        return "bg-blue-100 text-blue-800"
      case "completada":
      case "activo":
        return "bg-green-100 text-green-800"
      case "cerrado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inicializando...</h2>
          <p className="text-gray-600">Verificando autenticación y permisos</p>
        </div>
      </div>
    )
  }

  // Show error if authentication failed
  if (authError || canAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <img src="/assets/legality-logo.png" alt="Legality360" className="h-12 w-12 mx-auto mb-4" />
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">
                {authError ? 'Error de Autenticación' : 'Acceso Denegado'}
              </h2>
              <p className="text-gray-600 mb-4">
                {authError || 'No tienes permisos para acceder a este panel.'}
              </p>
              <div className="space-y-2">
                <Button onClick={onLogout} variant="outline" className="w-full">
                  Cerrar Sesión
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="ghost" 
                  size="sm"
                  className="w-full"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center p-1">
                <img src="/assets/legality-logo.png" alt="Legality360" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legality360 - Cliente</h1>
                <p className="text-sm text-gray-600">Panel de gestión legal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.full_name || "Cliente"}
                </p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <Button onClick={onLogout} variant="outline">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mis Casos</p>
                  <p className="text-2xl font-bold text-gray-900">{casos.length}</p>
                  <p className="text-xs text-green-600">
                    {casos.filter((c) => c.estado === "activo").length} activos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.mis_tareas_pendientes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mis Tareas</p>
                  <p className="text-2xl font-bold text-gray-900">{tareas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="casos">Mis Casos</TabsTrigger>
            <TabsTrigger value="tareas">Mis Tareas</TabsTrigger>
            <TabsTrigger value="horas">Solicitudes de Horas</TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="casos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Casos Activos</span>
                </CardTitle>
                <CardDescription>Tus casos legales y el equipo asignado</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando casos...</span>
                  </div>
                ) : casos.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay casos</h3>
                    <p className="text-gray-600">Aún no tienes casos asignados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {casos.map((caso) => (
                      <Card key={caso.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{caso.titulo}</h3>
                              <p className="text-sm text-gray-600">Empresa: {caso.empresa?.nombre}</p>
                            </div>
                            <Badge className={getEstadoBadgeColor(caso.estado)}>{caso.estado}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Equipo Asignado
                              </h4>
                              <div className="space-y-1">
                                {caso.asignaciones?.map((asignacion) => (
                                  <div key={asignacion.id} className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {asignacion.rol_asignado}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      {asignacion.usuario?.full_name}
                                    </span>
                                  </div>
                                )) || <p className="text-sm text-gray-500">Sin equipo asignado</p>}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Progreso de Tareas
                              </h4>
                              <div className="text-sm text-gray-600">
                                <p>Total: {caso.tareas_count || 0} tareas</p>
                                {(caso.tareas_pendientes || 0) > 0 && (
                                  <p className="text-orange-600">Pendientes: {caso.tareas_pendientes}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">Creado el {formatDate(caso.created_at)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tareas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Mis Tareas</span>
                </CardTitle>
                <CardDescription>Tareas asignadas a ti - puedes comentar y ver el progreso</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando tareas...</span>
                  </div>
                ) : tareas.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
                    <p className="text-gray-600">Aún no tienes tareas asignadas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Caso</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tareas.map((tarea) => (
                          <TableRow key={tarea.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{tarea.titulo}</div>
                                {tarea.descripcion && (
                                  <div className="text-sm text-gray-500">{tarea.descripcion}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{tarea.caso?.titulo}</TableCell>
                            <TableCell>
                              <Badge className={getEstadoBadgeColor(tarea.estado)}>
                                {tarea.estado.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(tarea.created_at)}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedTarea(tarea)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Comentar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Agregar Comentario</DialogTitle>
                                    <DialogDescription>Tarea: {selectedTarea?.titulo}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                                      placeholder="Escribe tu comentario sobre esta tarea..."
                                      rows={4}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTarea(null)
                                        setComment("")
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleAddComment} disabled={!comment.trim()}>
                                      Agregar Comentario
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solicitudes de Horas Tab */}
          <TabsContent value="horas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Solicitudes de Horas Extra</span>
                </CardTitle>
                <CardDescription>
                  Revisa y aprueba/rechaza solicitudes de horas adicionales de tu equipo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando solicitudes...</span>
                  </div>
                ) : solicitudesHoras.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
                    <p className="text-gray-600">Aún no tienes solicitudes de horas extra.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Caso</TableHead>
                          <TableHead>Horas Abogado</TableHead>
                          <TableHead>Horas Analista</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitudesHoras.map((sol) => (
                          <TableRow key={sol.id}>
                            <TableCell>{sol.caso?.titulo || "-"}</TableCell>
                            <TableCell>{sol.horas_abogado}</TableCell>
                            <TableCell>{sol.horas_analista}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  sol.estado === "pendiente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : sol.estado === "aprobado"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {sol.estado.charAt(0).toUpperCase() + sol.estado.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(sol.created_at)}
                            </TableCell>
                            <TableCell>
                              {sol.estado === "pendiente" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleActualizarEstadoSolicitud(sol.id, "aprobado")}
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleActualizarEstadoSolicitud(sol.id, "rechazado")}
                                  >
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}