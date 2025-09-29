import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Briefcase, CheckCircle, Clock, AlertCircle, Users, Scale, MessageCircle } from 'lucide-react'
import { authService } from '@/lib/auth'
import { dbService } from '@/lib/database'
import { CasoWithDetails, Tarea } from '@/lib/supabase'

interface ClientPanelProps {
  onLogout: () => void
}

export default function ClientPanel({ onLogout }: ClientPanelProps) {
  const [activeTab, setActiveTab] = useState('casos')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Data states
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [stats, setStats] = useState<any>({})

  // Comment state
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)
  const [comment, setComment] = useState('')

  const currentUser = authService.getCurrentProfile()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)
      setError(null)

      // Load dashboard stats
      const dashboardStats = await dbService.getDashboardStats(currentUser.id)
      setStats(dashboardStats)

      if (activeTab === 'casos') {
        const casosData = await dbService.getCasosByUser(currentUser.id, 'cliente')
        setCasos(casosData)
      } else if (activeTab === 'tareas') {
        const tareasData = await dbService.getTareasByUser(currentUser.id)
        setTareas(tareasData)
      }
    } catch (err) {
      setError('Error al cargar los datos')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!selectedTarea || !comment.trim()) return

    try {
      setError(null)
      // In a real implementation, you would save the comment to a comments table
      // For now, we'll just show a success message
      setSuccess('Comentario agregado exitosamente')
      setComment('')
      setSelectedTarea(null)
    } catch (err) {
      setError('Error al agregar el comentario')
      console.error('Error adding comment:', err)
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800'
      case 'completada':
        return 'bg-green-100 text-green-800'
      case 'activo':
        return 'bg-green-100 text-green-800'
      case 'cerrado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!authService.canAccessClientPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Scale className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
              <p className="text-gray-600 mb-4">No tienes permisos para acceder a este panel.</p>
              <Button onClick={onLogout} variant="outline">
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Scale className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legality360 - Cliente</h1>
                <p className="text-sm text-gray-600">Portal del Cliente</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.full_name}</p>
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
                    {casos.filter(c => c.estado === 'activo').length} activos
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="casos">Mis Casos</TabsTrigger>
            <TabsTrigger value="tareas">Mis Tareas</TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="casos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Casos Activos</span>
                </CardTitle>
                <CardDescription>
                  Tus casos legales y el equipo asignado
                </CardDescription>
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
                              <p className="text-sm text-gray-600">
                                Empresa: {caso.empresa?.nombre}
                              </p>
                            </div>
                            <Badge className={getEstadoBadgeColor(caso.estado)}>
                              {caso.estado}
                            </Badge>
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
                                )) || (
                                  <p className="text-sm text-gray-500">Sin equipo asignado</p>
                                )}
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
                                  <p className="text-orange-600">
                                    Pendientes: {caso.tareas_pendientes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Creado el {formatDate(caso.created_at)}
                            </p>
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
                <CardDescription>
                  Tareas asignadas a ti - puedes comentar y ver el progreso
                </CardDescription>
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
                                {tarea.estado.replace('_', ' ')}
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
                                    <DialogDescription>
                                      Tarea: {selectedTarea?.titulo}
                                    </DialogDescription>
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
                                        setComment('')
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      onClick={handleAddComment}
                                      disabled={!comment.trim()}
                                    >
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
        </Tabs>
      </div>
    </div>
  )
}