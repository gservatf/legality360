import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import LoginPage from '@/components/auth/LoginPage'
import PendingAuthorization from '@/components/auth/PendingAuthorization'
import AdminPanel from '@/components/admin/AdminPanel'
import ProfessionalPanel from '@/components/professional/ProfessionalPanel'
import ClientPanel from '@/components/client/ClientPanel'
import { authService } from '@/lib/auth'
import type { Profile } from '@/lib/supabase'
import { PrivateRoute } from '@/components/PrivateRoute'
import React from 'react'

const queryClient = new QueryClient()

// ----------------------------------------
// Main App Router
// ----------------------------------------
const AppRouter = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  // -------------------
  // Init auth
  // -------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getCurrentSession()
        const user = session ? await authService.getCurrentUser() : null
        const profile = user ? await authService.getCurrentProfile() : null

        setIsAuthenticated(!!user)
        setUserProfile(profile)
      } catch (err: any) {
        console.error('Auth init error:', err)
        setAuthError(err?.message || 'Error inicializando autenticación')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // -------------------
  // Redirection logic
  // -------------------
  useEffect(() => {
    if (!userProfile || !isAuthenticated) return
    const redirectPath = getRedirectPath(userProfile.role)

    if (!location.pathname.startsWith(redirectPath)) {
      navigate(redirectPath, { replace: true })
    }
  }, [userProfile, isAuthenticated, navigate, location.pathname])

  const getRedirectPath = (role: Profile['role']): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'analista':
        return '/analista/dashboard'
      case 'abogado':
        return '/abogado/dashboard'
      case 'cliente':
        return '/cliente/dashboard'
      case 'pending':
      default:
        return '/pending'
    }
  }

  // -------------------
  // Login + Logout
  // -------------------
  const handleLogin = async () => {
    try {
      const session = await authService.getCurrentSession()
      const user = session ? await authService.getCurrentUser() : null
      const profile = user ? await authService.getCurrentProfile() : null

      if (user && profile) {
        setIsAuthenticated(true)
        setUserProfile(profile)
        setAuthError(null)
      } else {
        throw new Error('Perfil no disponible aún, intenta nuevamente.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setAuthError(err?.message || 'Error en login')
    }
  }

  const handleLogout = async () => {
    await authService.signOut()
    setIsAuthenticated(false)
    setUserProfile(null)
    setAuthError(null)
    navigate('/login', { replace: true })
  }

  // -------------------
  // Render states
  // -------------------
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-6 rounded shadow-md text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
          <p className="mb-4 text-gray-600">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Legality360</h2>
          <p className="text-gray-600">Cargando sistema legal...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !userProfile) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (userProfile.role === 'pending') {
    return <PendingAuthorization onLogout={handleLogout} />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
            allowedRoles={['admin']}
            redirectPath={getRedirectPath(userProfile.role)}
          >
            <AdminPanel onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* Analista */}
      <Route
        path="/analista/dashboard"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
            allowedRoles={['analista']}
            redirectPath={getRedirectPath(userProfile.role)}
          >
            <ProfessionalPanel onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* Abogado */}
      <Route
        path="/abogado/dashboard"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
            allowedRoles={['abogado']}
            redirectPath={getRedirectPath(userProfile.role)}
          >
            <ProfessionalPanel onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* Cliente */}
      <Route
        path="/cliente/dashboard"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
            allowedRoles={['cliente']}
            redirectPath={getRedirectPath(userProfile.role)}
          >
            <ClientPanel onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* Pending */}
      <Route path="/pending" element={<PendingAuthorization onLogout={handleLogout} />} />

      {/* Legacy */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/professional" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />
      <Route path="/client" element={<Navigate to="/cliente/dashboard" replace />} />
      <Route path="/login" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />
    </Routes>
  )
}

// ----------------------------------------
// Main App
// ----------------------------------------
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
