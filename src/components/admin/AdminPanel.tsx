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
import { Loader2, Users, Building2, Briefcase, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { dbService } from '@/lib/database'
import { Profile, Empresa, Caso, ProfileWithTaskCount, CasoWithDetails } from '@/lib/supabase'

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

  // Data states
  const [users, setUsers] = useState<ProfileWithTaskCount[]>([])
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
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

  // Form states
  const [newEmpresa, setNewEmpresa] = useState('')
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [newCaso, setNewCaso] = useState({
    titulo: '',
    empresa_id: '',
    cliente_id: ''
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

  const canAccessAdminPanel = () => {
    return currentUser?.role === 'admin'
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load dashboard stats
      const dashboardStats = await dbService.getDashboardStats()
      setStats(dashboardStats)

      if (activeTab === 'usuarios') {
        // Load all users for admin
        const allUsers = await dbService.getAllProfiles()
        setUsers(allUsers)
        
        // Load pending users separately
        const pending = await dbService.getPendingUsers()
        setPendingUsers(pending)
      } else if (activeTab === 'empresas') {
        const empresasData = await dbService.getAllEmpresas()
        setEmpresas(empresasData)
      } else if (activeTab === 'casos') {
        const casosData = await dbService.getAllCasosWithDetails()
        setCasos(casosData)
        // Also load empresas and users for dropdowns
        const empresasData = await dbService.getAllEmpresas()
        const usersData = await dbService.getAllProfiles()
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

  // Actualiza el rol del usuario y actualiza solo el array de users en memoria
  const updateUserRole = async (userId: string, role: Profile['role']) => {
    try {
      setError(null)
      setSuccess(null)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (!updateError) {
        setSuccess(`Rol actualizado exitosamente a ${role}`)
        // Actualiza solo el usuario en el array de users
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, role } : u
          )
        )
        // Si el usuario estaba en pendingUsers y ya no es 'pending', lo quitamos de pendingUsers
        if (role !== 'pending') {
          setPendingUsers(prev => prev.filter(u => u.id !== userId))
        }
        return true
      } else {
        setError('Error al actualizar el rol')
        return false
      }
    } catch (err) {
      setError('Error al actualizar el rol del usuario')
      console.error('Error updating role:', err)
      return false
    }
  }

  // Cambia el rol del usuario en Supabase y refresca la lista
  const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
    await updateUserRole(userId, newRole)
  }

  const handleApproveUser = async (userId: string, approvedRole: 'cliente' | 'analista' | 'abogado') => {
    const result = await updateUserRole(userId, approvedRole)
    if (result) {
      setSuccess(`Usuario aprobado como ${approvedRole}`)
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

  if (!canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <img 
                src="/logo.png" 
                alt="Legality360" 
                className="h-12 w-12 mx-auto mb-4"
              />
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center p-1">
                <img 
                  src="/logo.png" 
                  alt="Legality360" 
                  className="w-full h-full object-contain"
                />
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
            <TabsTrigger value="usuarios">
              Usuarios
              {stats.usuarios_pendientes > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                  {stats.usuarios_pendientes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="casos">Casos</TabsTrigger>
            <TabsTrigger value="tareas">Tareas</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="usuarios" className="space-y-6">
            {/* Pending Users Section */}
            {pendingUsers.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-800">
                    <UserCheck className="h-5 w-5" />
                    <span>Usuarios Pendientes de Aprobación</span>
                    <Badge className="bg-yellow-500 text-white">
                      {pendingUsers.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Estos usuarios necesitan aprobación para acceder al sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Registrado el {formatDate(user.created_at)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user.id, 'cliente')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Aprobar como Cliente
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user.id, 'analista')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Aprobar como Analista
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user.id, 'abogado')}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Aprobar como Abogado
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Users Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Todos los Usuarios</span>
                </CardTitle>
                <CardDescription>
                  Gestión completa de usuarios del sistema
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
                              <select
                                className="border rounded px-2 py-1"
                                value={user.role}
                                onChange={async (e) => {
                                  const newRole = e.target.value as Profile['role'];
                                  await handleRoleChange(user.id, newRole);
                                }}
                                disabled={user.id === currentUser?.id}
                              >
                                <option value="admin">Admin</option>
                                <option value="analista">Analista</option>
                                <option value="abogado">Abogado</option>
                                <option value="cliente">Cliente</option>
                                <option value="pending">Pendiente</option>
                              </select>
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

          {/* Other tabs content would go here */}
          <TabsContent value="empresas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Gestión de Empresas
                  <Badge variant="secondary">{empresas.length}</Badge>
                </CardTitle>
                <CardDescription>Administra las empresas del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formulario para crear empresa */}
                <form
                  className="flex items-center gap-2 mb-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newEmpresa.trim()) return;
                    await handleCreateEmpresa();
                  }}
                >
                  <Input
                    type="text"
                    placeholder="Nombre de la empresa"
                    value={newEmpresa}
                    onChange={e => setNewEmpresa(e.target.value)}
                  />
                  <Button type="submit">Crear Empresa</Button>
                </form>

                {/* Lista de empresas */}
                {empresas.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No hay empresas registradas.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Fecha de creación</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {empresas.map((empresa) => (
                          <TableRow key={empresa.id}>
                            <TableCell>{empresa.nombre}</TableCell>
                            <TableCell>
                              {empresa.created_at
                                ? formatDate(empresa.created_at)
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog
                                  open={editingEmpresa?.id === empresa.id}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setEditingEmpresa(empresa)
                                    } else {
                                      setEditingEmpresa(null)
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Edit className="w-4 h-4 mr-1" /> Editar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Editar Empresa</DialogTitle>
                                      <DialogDescription>
                                        Cambia el nombre de la empresa y guarda los cambios.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Label htmlFor="nombre-empresa">Nombre</Label>
                                      <Input
                                        id="nombre-empresa"
                                        type="text"
                                        value={editingEmpresa?.nombre || ''}
                                        onChange={e =>
                                          setEditingEmpresa(
                                            editingEmpresa
                                              ? { ...editingEmpresa, nombre: e.target.value }
                                              : null
                                          )
                                        }
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingEmpresa(null)}
                                        type="button"
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        onClick={async () => {
                                          await handleUpdateEmpresa()
                                        }}
                                        disabled={!editingEmpresa?.nombre.trim()}
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
                                    await handleDeleteEmpresa(empresa.id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
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
          </TabsContent>

          <TabsContent value="casos">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Casos</CardTitle>
                <CardDescription>Administra los casos legales del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Funcionalidad de casos pendiente de implementar</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tareas">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Tareas</CardTitle>
                <CardDescription>Vista general de todas las tareas del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">Funcionalidad de tareas pendiente de implementar</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}