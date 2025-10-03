import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Users, Building2, Briefcase, CheckCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { dbService } from '@/lib/database'
import { Profile } from '@/lib/supabase'

import UsuariosTab from './UsuariosTab'
import EmpresasTab from './EmpresasTab'
import CasosTab from './CasosTab'
import TareasTab from './TareasTab'

interface AdminPanelProps {
  onLogout: () => void
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    loadCurrentUser()
    loadStats()
  }, [activeTab])

  const loadCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setCurrentUser(profile)
    }
  }

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const dashboardStats = await dbService.getDashboardStats()
      setStats(dashboardStats)
    } catch (err) {
      setError('Error al cargar estadísticas')
    } finally {
      setIsLoading(false)
    }
  }

  const canAccessAdminPanel = () => currentUser?.role === 'admin'

  if (!canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder al panel de administración.
            </p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="usuarios"><Users className="h-4 w-4 mr-1" />Usuarios</TabsTrigger>
            <TabsTrigger value="empresas"><Building2 className="h-4 w-4 mr-1" />Empresas</TabsTrigger>
            <TabsTrigger value="casos"><Briefcase className="h-4 w-4 mr-1" />Casos</TabsTrigger>
            <TabsTrigger value="tareas"><CheckCircle className="h-4 w-4 mr-1" />Tareas</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios">
            <UsuariosTab stats={stats} setError={setError} setSuccess={setSuccess} />
          </TabsContent>
          <TabsContent value="empresas">
            <EmpresasTab stats={stats} setError={setError} setSuccess={setSuccess} />
          </TabsContent>
          <TabsContent value="casos">
            <CasosTab stats={stats} setError={setError} setSuccess={setSuccess} />
          </TabsContent>
          <TabsContent value="tareas">
            <TareasTab stats={stats} setError={setError} setSuccess={setSuccess} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
