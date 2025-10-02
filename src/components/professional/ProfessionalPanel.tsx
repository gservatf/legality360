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
import { CasoWithDetails, Tarea, Empresa, Profile } from '@/lib/supabase'
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
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [newTarea, setNewTarea] = useState({
    titulo: '',
    descripcion: '',
    caso_id: ''
  })

  // Nuevo estado para el formulario de caso
  const [showNuevoCaso, setShowNuevoCaso] = useState(false)
  const [nuevoCaso, setNuevoCaso] = useState({
    titulo: '',
    empresa_id: '',
    cliente_id: '',
    horas_abogado: '',
    horas_analista: '',
    tarifa_abogado: '',
    tarifa_analista: '',
    bono_exito: ''
  })

  // Nuevo estado para el dialog de solicitud de horas extra
  const [showSolicitarHoras, setShowSolicitarHoras] = useState(false)
  const [solicitudHoras, setSolicitudHoras] = useState<{
    caso_id: string
    horas_abogado: string
    horas_analista: string
  }>({
    caso_id: '',
    horas_abogado: '',
    horas_analista: ''
  })

  // Estado para edición de caso
  const [editCaso, setEditCaso] = useState<null | {
    id: string
    titulo: string
    empresa_id: string
    cliente_id: string
  }>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Agrega estos estados para almacenar las horas consumidas por caso:
  const [horasPorCaso, setHorasPorCaso] = useState<Record<string, { abogado: number, analista: number }>>({})

  useEffect(() => {
    loadCurrentUser()
    loadData()
  }, [activeTab])

  // Cargar empresas y usuarios para el formulario de caso
  useEffect(() => {
    const fetchEmpresasYUsuarios = async () => {
      try {
        const empresasData = await dbService.getAllEmpresas()
        setEmpresas(empresasData)
        const usersData = await dbService.getAllProfiles()
        setUsers(usersData)
      } catch (err) {
        // opcional: manejar error
      }
    }
    fetchEmpresasYUsuarios()
  }, [])

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

  // Función para cargar horas consumidas por caso:
  const loadHorasPorCaso = async (casosList: CasoWithDetails[]) => {
    const horas: Record<string, { abogado: number, analista: number }> = {}
    for (const caso of casosList) {
      const tareas = await dbService.getTareasByCaso(caso.id)
      // Suma horas por rol
      let abogado = 0
      let analista = 0
      for (const tarea of tareas) {
        if (tarea.rol === 'abogado' && tarea.horas) abogado += tarea.horas
        if (tarea.rol === 'analista' && tarea.horas) analista += tarea.horas
      }
      horas[caso.id] = { abogado, analista }
    }
    setHorasPorCaso(horas)
  }

  // Modifica loadData para cargar también las horas consumidas:
  const loadData = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)
      setError(null)

      if (activeTab === 'casos') {
        const casosData = await dbService.getCasosByUser(currentUser.id, currentUser.role)
        setCasos(casosData)
        await loadHorasPorCaso(casosData)
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

  const handleCreateCaso = async () => {
    if (
      !nuevoCaso.titulo.trim() ||
      !nuevoCaso.empresa_id ||
      !nuevoCaso.cliente_id
    ) return

    try {
      setError(null)
      // Envía los campos adicionales a la función de creación
      const result = await dbService.createCaso(
        nuevoCaso.empresa_id,
        nuevoCaso.cliente_id,
        nuevoCaso.titulo.trim(),
        {
          horas_abogado: nuevoCaso.horas_abogado ? Number(nuevoCaso.horas_abogado) : null,
          horas_analista: nuevoCaso.horas_analista ? Number(nuevoCaso.horas_analista) : null,
          tarifa_abogado: nuevoCaso.tarifa_abogado ? Number(nuevoCaso.tarifa_abogado) : null,
          tarifa_analista: nuevoCaso.tarifa_analista ? Number(nuevoCaso.tarifa_analista) : null,
          bono_exito: nuevoCaso.bono_exito || null
        }
      )
      if (result) {
        setSuccess('Caso creado exitosamente')
        setNuevoCaso({
          titulo: '',
          empresa_id: '',
          cliente_id: '',
          horas_abogado: '',
          horas_analista: '',
          tarifa_abogado: '',
          tarifa_analista: '',
          bono_exito: ''
        })
        setShowNuevoCaso(false)
        await loadData()
      } else {
        setError('Error al crear el caso')
      }
    } catch (err) {
      setError('Error al crear el caso')
      console.error('Error creating caso:', err)
    }
  }

  // Handler para solicitar más horas
  const handleSolicitarHoras = async () => {
    if (!solicitudHoras.caso_id || (!solicitudHoras.horas_abogado && !solicitudHoras.horas_analista)) return
    try {
      setError(null)
      // Debes implementar este método en dbService
      const result = await dbService.solicitarHorasExtra({
        caso_id: solicitudHoras.caso_id,
        horas_abogado: solicitudHoras.horas_abogado ? Number(solicitudHoras.horas_abogado) : 0,
        horas_analista: solicitudHoras.horas_analista ? Number(solicitudHoras.horas_analista) : 0,
        estado: 'pendiente',
        solicitante_id: currentUser.id
      })
      if (result) {
        setSuccess('Solicitud enviada y pendiente de aprobación del cliente')
        setShowSolicitarHoras(false)
        setSolicitudHoras({ caso_id: '', horas_abogado: '', horas_analista: '' })
      } else {
        setError('Error al solicitar horas extra')
      }
    } catch (err) {
      setError('Error al solicitar horas extra')
      console.error('Error solicitando horas extra:', err)
    }
  }

  // Handler para abrir el diálogo de edición
  const handleOpenEdit = (caso: any) => {
    setEditCaso({
      id: caso.id,
      titulo: caso.titulo,
      empresa_id: caso.empresa_id,
      cliente_id: caso.cliente_id,
    })
    setShowEditDialog(true)
  }

  // Handler para guardar cambios
  const handleSaveEdit = async () => {
    if (!editCaso) return
    try {
      setError(null)
      await dbService.updateCaso(
        editCaso.id,
        editCaso.empresa_id,
        editCaso.cliente_id,
        editCaso.titulo
      )
      setShowEditDialog(false)
      setEditCaso(null)
      await loadData()
      setSuccess('Caso actualizado correctamente')
    } catch (err) {
      setError('Error al actualizar el caso')
    }
  }

  // Agrega esta función antes del return principal:
  const handleUpdateCasoEstado = async (casoId: string, nuevoEstado: 'activo' | 'cerrado') => {
    try {
      setError(null)
      await dbService.updateCasoEstado(casoId, nuevoEstado)
      await loadData()
      setSuccess('Estado del caso actualizado')
    } catch (err) {
      setError('Error al actualizar el estado del caso')
    }
  }

  // Agrega esta función antes del return principal:
  const handleDeleteCaso = async (casoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este caso? Esta acción no se puede deshacer.')) {
      try {
        setError(null)
        await dbService.deleteCaso(casoId)
        await loadData()
        setSuccess('Caso eliminado correctamente')
      } catch (err) {
        setError('Error al eliminar el caso')
      }
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Casos Asignados</span>
                      <Badge variant="outline" className="ml-2">{casos.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Casos en los que estás trabajando como {getRoleTitle().toLowerCase()}
                    </CardDescription>
                  </div>
                  <Dialog open={showNuevoCaso} onOpenChange={setShowNuevoCaso}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Caso
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Caso</DialogTitle>
                        <DialogDescription>
                          Completa los datos para registrar un nuevo caso.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="caso-titulo">Título del Caso</Label>
                          <Input
                            id="caso-titulo"
                            value={nuevoCaso.titulo}
                            onChange={e => setNuevoCaso(prev => ({ ...prev, titulo: e.target.value }))}
                            placeholder="Ej: Demanda laboral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="caso-empresa">Empresa</Label>
                          <Select
                            value={nuevoCaso.empresa_id}
                            onValueChange={value => setNuevoCaso(prev => ({ ...prev, empresa_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {empresas.map(empresa => (
                                <SelectItem key={empresa.id} value={empresa.id}>
                                  {empresa.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="caso-cliente">Cliente</Label>
                          <Select
                            value={nuevoCaso.cliente_id}
                            onValueChange={value => setNuevoCaso(prev => ({ ...prev, cliente_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.filter(u => u.role === 'cliente').map(cliente => (
                                <SelectItem key={cliente.id} value={cliente.id}>
                                  {cliente.full_name || cliente.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="horas-abogado">Horas presupuestadas de abogado</Label>
                            <Input
                              id="horas-abogado"
                              type="number"
                              min="0"
                              value={nuevoCaso.horas_abogado}
                              onChange={e => setNuevoCaso(prev => ({ ...prev, horas_abogado: e.target.value }))}
                              placeholder="Ej: 10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="horas-analista">Horas presupuestadas de analista</Label>
                            <Input
                              id="horas-analista"
                              type="number"
                              min="0"
                              value={nuevoCaso.horas_analista}
                              onChange={e => setNuevoCaso(prev => ({ ...prev, horas_analista: e.target.value }))}
                              placeholder="Ej: 5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tarifa-abogado">Tarifa por hora de abogado (S/)</Label>
                            <Input
                              id="tarifa-abogado"
                              type="number"
                              min="0"
                              value={nuevoCaso.tarifa_abogado}
                              onChange={e => setNuevoCaso(prev => ({ ...prev, tarifa_abogado: e.target.value }))}
                              placeholder="Ej: 200"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tarifa-analista">Tarifa por hora de analista (S/)</Label>
                            <Input
                              id="tarifa-analista"
                              type="number"
                              min="0"
                              value={nuevoCaso.tarifa_analista}
                              onChange={e => setNuevoCaso(prev => ({ ...prev, tarifa_analista: e.target.value }))}
                              placeholder="Ej: 100"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="bono-exito">Bono de éxito (monto o %)</Label>
                            <Input
                              id="bono-exito"
                              type="text"
                              value={nuevoCaso.bono_exito}
                              onChange={e => setNuevoCaso(prev => ({ ...prev, bono_exito: e.target.value }))}
                              placeholder="Ej: 10% o 5000"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleCreateCaso}
                          disabled={
                            !nuevoCaso.titulo.trim() ||
                            !nuevoCaso.empresa_id ||
                            !nuevoCaso.cliente_id
                          }
                        >
                          Crear Caso
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
                          <TableHead>Fecha de creación</TableHead>
                          <TableHead>Acciones</TableHead>
                          <TableHead>Horas Abogado</TableHead>
                          <TableHead>Horas Analista</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {casos.map((caso) => (
                          <TableRow key={caso.id}>
                            <TableCell className="font-medium">{caso.titulo}</TableCell>
                            <TableCell>{caso.empresa?.nombre || '-'}</TableCell>
                            <TableCell>{caso.cliente?.full_name || caso.cliente?.email || '-'}</TableCell>
                            <TableCell>
                              <Badge className={getEstadoBadgeColor(caso.estado)}>
                                {caso.estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(caso.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(caso)}>
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteCaso(caso.id)}
                                >
                                  Eliminar
                                </Button>
                                <Select
                                  value={caso.estado}
                                  onValueChange={(nuevoEstado) => handleUpdateCasoEstado(caso.id, nuevoEstado as 'activo' | 'cerrado')}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="activo">Activo</SelectItem>
                                    <SelectItem value="cerrado">Cerrado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const consumidas = horasPorCaso[caso.id]?.abogado || 0
                                const presup = Number(caso.horas_abogado) || 0
                                const exceso = presup > 0 && consumidas >= presup
                                return (
                                  <span className={exceso ? 'text-red-600 font-bold' : ''}>
                                    {consumidas} / {presup}
                                    {exceso && <span> (exceso)</span>}
                                  </span>
                                )
                              })()}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const consumidas = horasPorCaso[caso.id]?.analista || 0
                                const presup = Number(caso.horas_analista) || 0
                                const exceso = presup > 0 && consumidas >= presup
                                return (
                                  <span className={exceso ? 'text-red-600 font-bold' : ''}>
                                    {consumidas} / {presup}
                                    {exceso && <span> (exceso)</span>}
                                  </span>
                                )
                              })()}
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
                          disabled={
                            !newTarea.titulo.trim() ||
                            !newTarea.caso_id ||
                            isExcesoHoras(newTarea.caso_id)
                          }
                        >
                          Crear Tarea
                        </Button>
                        {isExcesoHoras(newTarea.caso_id) && (
                          <div className="text-red-600 text-xs mt-2">
                            No puedes crear nuevas tareas: horas consumidas superan las presupuestadas. Solicita aprobación de más horas al cliente.
                          </div>
                        )}
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

        {/* Dialog de edición de caso */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Caso</DialogTitle>
              <DialogDescription>
                Modifica los datos principales del caso.
              </DialogDescription>
            </DialogHeader>
            {editCaso && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-titulo">Título</Label>
                  <Input
                    id="edit-titulo"
                    value={editCaso.titulo}
                    onChange={e => setEditCaso({ ...editCaso, titulo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-empresa">Empresa</Label>
                  <Select
                    value={editCaso.empresa_id}
                    onValueChange={value => setEditCaso({ ...editCaso, empresa_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map(empresa => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-cliente">Cliente</Label>
                  <Select
                    value={editCaso.cliente_id}
                    onValueChange={value => setEditCaso({ ...editCaso, cliente_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'cliente').map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.full_name || cliente.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleSaveEdit}
                disabled={
                  !editCaso?.titulo.trim() ||
                  !editCaso?.empresa_id ||
                  !editCaso?.cliente_id
                }
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}