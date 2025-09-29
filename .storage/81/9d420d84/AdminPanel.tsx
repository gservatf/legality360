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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Users, Building2, Briefcase, UserCheck, Scale, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { authService } from '@/lib/auth'
import { dbService } from '@/lib/database'
import { Profile, Empresa, Caso, ProfileWithTaskCount, CasoWithDetails } from '@/lib/supabase'

interface AdminPanelProps {
  onLogout: () => void
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Data states
  const [users, setUsers] = useState<ProfileWithTaskCount[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [stats, setStats] = useState<any>({})

  // Form states
  const [newEmpresa, setNewEmpresa] = useState('')
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [newCaso, setNewCaso] = useState({
    titulo: '',
    empresa_id: '',
    cliente_id: ''
  })

  const currentUser = authService.getCurrentProfile()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load dashboard stats
      const dashboardStats = await dbService.getDashboardStats()
      setStats(dashboardStats)

      if (activeTab === 'usuarios') {
        const usersData = await dbService.getAllProfilesWithTaskCounts()
        setUsers(usersData)
      } else if (activeTab === 'empresas') {
        const empresasData = await dbService.getAllEmpresas()
        setEmpresas(empresasData)
      } else if (activeTab === 'casos') {
        const casosData = await dbService.getAllCasosWithDetails()
        setCasos(casosData)
        // Also load empresas and users for dropdowns
        const empresasData = await dbService.getAllEmpresas()
        const usersData = await dbService.getAllProfilesWithTaskCounts()
        setEmpresas(empresasData)
        setUsers(usersData.filter(u => u.role === 'cliente'))
      }
    } catch (err) {
      setError('Error al cargar los datos')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
    try {
      setError(null)
      setSuccess(null)

      const result = await dbService.updateProfileRole(userId, newRole)
      
      if (result) {
        setSuccess(`Rol actualizado exitosamente`)
        await loadData()
      } else {
        setError('Error al actualizar el rol')
      }
    } catch (err) {
      setError('Error al actualizar el rol del usuario')
      console.error('Error updating role:', err)
    }
  }

  const handleCreateEmpresa = async () => {
    if (!newEmpresa.trim()) return

    try {
      setError(null)
      const result = await dbService.createEmpresa(newEmpresa.trim())
      
      if (result) {
        setSuccess('Empresa creada exitosamente')
        setNewEmpresa('')
        await loadData()
      } else {
        setError('Error al crear la empresa')
      }
    } catch (err) {
      setError('Error al crear la empresa')
      console.error('Error creating empresa:', err)
    }
  }

  const handleUpdateEmpresa = async () => {
    if (!editingEmpresa || !editingEmpresa.nombre.trim()) return

    try {
      setError(null)
      const result = await dbService.updateEmpresa(editingEmpresa.id, editingEmpresa.nombre.trim())
      
      if (result) {
        setSuccess('Empresa actualizada exitosamente')
        setEditingEmpresa(null)
        await loadData()
      } else {
        setError('Error al actualizar la empresa')
      }
    } catch (err) {
      setError('Error al actualizar la empresa')
      console.error('Error updating empresa:', err)
    }
  }

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta empresa?')) return

    try {
      setError(null)
      const result = await dbService.deleteEmpresa(id)
      
      if (result) {
        setSuccess('Empresa eliminada exitosamente')
        await loadData()
      } else {
        setError('Error al eliminar la empresa')
      }
    } catch (err) {
      setError('Error al eliminar la empresa')
      console.error('Error deleting empresa:', err)
    }
  }

  const handleCreateCaso = async () => {
    if (!newCaso.titulo.trim() || !newCaso.empresa_id || !newCaso.cliente_id) return

    try {
      setError(null)
      const result = await dbService.createCaso(newCaso.empresa_id, newCaso.cliente_id, newCaso.titulo.trim())
      
      if (result) {
        setSuccess('Caso creado exitosamente')
        setNewCaso({ titulo: '', empresa_id: '', cliente_id: '' })
        await loadData()
      } else {
        setError('Error al crear el caso')
      }
    } catch (err) {
      setError('Error al crear el caso')
      console.error('Error creating caso:', err)
    }
  }

  const getRoleBadgeColor = (role: Profile['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'analista':
        return 'bg-purple-100 text-purple-800'
      case 'abogado':
        return 'bg-indigo-100 text-indigo-800'
      case 'cliente':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
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

  if (!authService.canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Scale className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
              <p className="text-gray-600 mb-4">No tienes permisos para acceder al panel de administración.</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Scale className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legality360 - Admin</h1>
                <p className="text-sm text-gray-600">Panel de Administración</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_usuarios || 0}</p>
                  {stats.usuarios_pendientes > 0 && (
                    <p className="text-xs text-yellow-600">{stats.usuarios_pendientes} pendientes</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_empresas || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Casos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_casos || 0}</p>
                  <p className="text-xs text-green-600">{stats.casos_activos || 0} activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tareas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_tareas || 0}</p>
                  <p className="text-xs text-orange-600">{stats.tareas_pendientes || 0} pendientes</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="casos">Casos</TabsTrigger>
            <TabsTrigger value="tareas">Tareas</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Gestión de Usuarios</span>
                </CardTitle>
                <CardDescription>
                  Aprueba usuarios y gestiona roles del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando usuarios...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Tareas Pendientes</TableHead>
                          <TableHead>Fecha Registro</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.full_name || 'Sin nombre'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getRoleBadgeColor(user.role)} capitalize`}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{user.tareas_pendientes || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(user.created_at)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => handleRoleChange(user.id, newRole as Profile['role'])}
                                disabled={user.id === currentUser?.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="cliente">Cliente</SelectItem>
                                  <SelectItem value="analista">Analista</SelectItem>
                                  <SelectItem value="abogado">Abogado</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
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

          {/* Companies Tab */}
          <TabsContent value="empresas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Gestión de Empresas</span>
                    </CardTitle>
                    <CardDescription>
                      Administra las empresas del sistema
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Empresa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Empresa</DialogTitle>
                        <DialogDescription>
                          Ingresa el nombre de la nueva empresa
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nombre">Nombre de la Empresa</Label>
                          <Input
                            id="nombre"
                            value={newEmpresa}
                            onChange={(e) => setNewEmpresa(e.target.value)}
                            placeholder="Ej: Acme Corporation"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateEmpresa} disabled={!newEmpresa.trim()}>
                          Crear Empresa
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
                    <span className="ml-2 text-gray-600">Cargando empresas...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Fecha Creación</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {empresas.map((empresa) => (
                          <TableRow key={empresa.id}>
                            <TableCell className="font-medium">{empresa.nombre}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(empresa.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingEmpresa(empresa)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEmpresa(empresa.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Company Dialog */}
            <Dialog open={!!editingEmpresa} onOpenChange={() => setEditingEmpresa(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Empresa</DialogTitle>
                  <DialogDescription>
                    Modifica el nombre de la empresa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-nombre">Nombre de la Empresa</Label>
                    <Input
                      id="edit-nombre"
                      value={editingEmpresa?.nombre || ''}
                      onChange={(e) => setEditingEmpresa(prev => prev ? {...prev, nombre: e.target.value} : null)}
                      placeholder="Ej: Acme Corporation"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingEmpresa(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateEmpresa} disabled={!editingEmpresa?.nombre?.trim()}>
                    Actualizar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="casos" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Gestión de Casos</span>
                    </CardTitle>
                    <CardDescription>
                      Administra los casos legales del sistema
                    </CardDescription>
                  </div>
                  <Dialog>
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
                          Crea un nuevo caso legal
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="caso-titulo">Título del Caso</Label>
                          <Input
                            id="caso-titulo"
                            value={newCaso.titulo}
                            onChange={(e) => setNewCaso(prev => ({...prev, titulo: e.target.value}))}
                            placeholder="Ej: Contrato de Servicios - Acme Corp"
                          />
                        </div>
                        <div>
                          <Label htmlFor="caso-empresa">Empresa</Label>
                          <Select
                            value={newCaso.empresa_id}
                            onValueChange={(value) => setNewCaso(prev => ({...prev, empresa_id: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {empresas.map((empresa) => (
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
                            value={newCaso.cliente_id}
                            onValueChange={(value) => setNewCaso(prev => ({...prev, cliente_id: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.filter(u => u.role === 'cliente').map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id}>
                                  {cliente.full_name} ({cliente.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleCreateCaso} 
                          disabled={!newCaso.titulo.trim() || !newCaso.empresa_id || !newCaso.cliente_id}
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
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Tareas Globales</span>
                </CardTitle>
                <CardDescription>
                  Vista general de todas las tareas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Vista de Tareas</h3>
                  <p className="text-gray-600">Esta funcionalidad se implementará en la siguiente fase.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}