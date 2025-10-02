import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Briefcase, CheckCircle, Clock, AlertCircle, Plus, Users } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { dbService } from '@/lib/database'
import { CasoWithDetails, Tarea } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface ProfessionalPanelProps {
  onLogout: () => void
}

export default function ProfessionalPanel({ onLogout }: ProfessionalPanelProps) {
  const [activeTab, setActiveTab] = useState('casos')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Data states
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [newTarea, setNewTarea] = useState({
    titulo: '',
    descripcion: '',
    caso_id: ''
  })

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

  const loadData = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)
      setError(null)

      if (activeTab === 'casos') {
        // Load cases assigned to this professional
        const casosData = await dbService.getCasosByUser(currentUser.id, currentUser.role)
        setCasos(casosData)
      } else if (activeTab === 'tareas') {
        // Load tasks assigned to this professional
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

  const handleCreateTarea = async () => {
    if (!newTarea.titulo.trim() || !newTarea.caso_id) return

    try {
      setError(null)
      const result = await dbService.createTarea(
        newTarea.caso_id,
        currentUser.id,
        newTarea.titulo.trim(),
        newTarea.descripcion.trim() || undefined
      )
      
      if (result) {
        setSuccess('Tarea creada exitosamente')
        setNewTarea({ titulo: '', descripcion: '', caso_id: '' })
        await loadData()
      } else {
        setError('Error al crear la tarea')
      }
    } catch (err) {
      setError('Error al crear la tarea')
      console.error('Error creating tarea:', err)
    }
  }

  const handleUpdateTareaEstado = async (tareaId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada') => {
    try {
      setError(null)
      const result = await dbService.updateTareaEstado(tareaId, nuevoEstado)
      
      if (result) {
        setSuccess(`Tarea marcada como ${nuevoEstado}`)
        await loadData()
      } else {
        setError('Error al actualizar el estado de la tarea')
      }
    } catch (err) {
      setError('Error al actualizar el estado de la tarea')
      console.error('Error updating tarea estado:', err)
    }
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
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

  const getRoleTitle = () => {
    switch (currentUser?.role) {
      case 'analista':
        return 'Analista Legal'
      case 'abogado':
        return 'Abogado'
      default:
        return 'Profesional'
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center p-1">
                <img 
                  src="/workspace/uploads/icono legality.png" 
                  alt="Legality360" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legality360 - {getRoleTitle()}</h1>
                <p className="text-sm text-gray-600">Panel Profesional</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.full_name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <span>Casos Asignados</span>
                </CardTitle>
                <CardDescription>
                  Casos en los que estás trabajando como {getRoleTitle().toLowerCase()}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay casos asignados</h3>
                    <p className="text-gray-600">Aún no tienes casos asignados. Contacta al administrador.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Tareas</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {casos.map((caso) => (
                          <TableRow key={caso.id}>
                            <TableCell className="font-medium">{caso.titulo}</TableCell>
                            <TableCell>{caso.empresa?.nombre}</TableCell>
                            <TableCell>
                              {caso.cliente?.full_name || 'Sin asignar'}
                            </TableCell>
                            <TableCell>
                              <Badge className={getEstadoBadgeColor(caso.estado)}>
                                {caso.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <span className="text-gray-600">{caso.tareas_count || 0} total</span>
                                {(caso.tareas_pendientes || 0) > 0 && (
                                  <span className="text-orange-600 ml-2">
                                    {caso.tareas_pendientes} pendientes
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(caso.created_at)}
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

          {/* Tasks Tab */}
          <TabsContent value="tareas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Mis Tareas</span>
                    </CardTitle>
                    <CardDescription>
                      Tareas asignadas a ti
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Tarea
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Tarea</DialogTitle>
                        <DialogDescription>
                          Crea una nueva tarea para uno de tus casos
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tarea-titulo">Título de la Tarea</Label>
                          <Input
                            id="tarea-titulo"
                            value={newTarea.titulo}
                            onChange={(e) => setNewTarea(prev => ({...prev, titulo: e.target.value}))}
                            placeholder="Ej: Revisar documentos del contrato"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tarea-caso">Caso</Label>
                          <Select
                            value={newTarea.caso_id}
                            onValueChange={(value) => setNewTarea(prev => ({...prev, caso_id: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un caso" />
                            </SelectTrigger>
                            <SelectContent>
                              {casos.map((caso) => (
                                <SelectItem key={caso.id} value={caso.id}>
                                  {caso.titulo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tarea-descripcion">Descripción (Opcional)</Label>
                          <Textarea
                            id="tarea-descripcion"
                            value={newTarea.descripcion}
                            onChange={(e) => setNewTarea(prev => ({...prev, descripcion: e.target.value}))}
                            placeholder="Describe los detalles de la tarea..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleCreateTarea} 
                          disabled={!newTarea.titulo.trim() || !newTarea.caso_id}
                        >
                          Crear Tarea
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
                    <p className="text-gray-600">Aún no tienes tareas asignadas. Crea una nueva tarea.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Caso</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tareas.map((tarea) => (
                          <TableRow key={tarea.id}>
                            <TableCell className="font-medium">{tarea.titulo}</TableCell>
                            <TableCell>{tarea.caso?.titulo}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {tarea.descripcion || 'Sin descripción'}
                            </TableCell>
                            <TableCell>
                              <Badge className={getEstadoBadgeColor(tarea.estado)}>
                                {tarea.estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(tarea.created_at)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={tarea.estado}
                                onValueChange={(newEstado) => handleUpdateTareaEstado(tarea.id, newEstado as any)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                                  <SelectItem value="completada">Completada</SelectItem>
                                </SelectContent>
                              </Select>
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