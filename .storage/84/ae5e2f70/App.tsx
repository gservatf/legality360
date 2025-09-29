import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/components/auth/LoginPage';
import PendingAuthorization from '@/components/auth/PendingAuthorization';
import AdminPanel from '@/components/admin/AdminPanel';
import ProfessionalPanel from '@/components/professional/ProfessionalPanel';
import ClientPanel from '@/components/client/ClientPanel';
import { authService } from '@/lib/auth';
import { Profile } from '@/lib/supabase';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize auth service
        await authService.initialize();
        
        // Check current authentication status
        const user = authService.getCurrentUser();
        const profile = authService.getCurrentProfile();
        
        setIsAuthenticated(!!user);
        setUserProfile(profile);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError('Error al inicializar la autenticación');
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async () => {
    try {
      // Wait a moment for profile to load after login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = authService.getCurrentUser();
      const profile = authService.getCurrentProfile();
      
      setIsAuthenticated(!!user);
      setUserProfile(profile);
      setAuthError(null);
    } catch (error) {
      console.error('Login handler error:', error);
      setAuthError('Error al procesar el login');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUserProfile(null);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError('Error al cerrar sesión');
    }
  };

  // Show error if auth initialization failed
  if (authError) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error de Autenticación</h2>
              <p className="text-gray-600 mb-4">{authError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Legality360</h2>
              <p className="text-gray-600">Cargando sistema legal...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !userProfile) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <LoginPage onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show pending authorization if user role is pending
  if (userProfile.role === 'pending') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <PendingAuthorization onLogout={handleLogout} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Route based on user role
  const getDefaultRoute = () => {
    switch (userProfile.role) {
      case 'admin':
        return '/admin';
      case 'analista':
      case 'abogado':
        return '/professional';
      case 'cliente':
        return '/client';
      default:
        return '/pending';
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            
            {/* Admin Panel */}
            <Route 
              path="/admin" 
              element={
                userProfile.role === 'admin' ? (
                  <AdminPanel onLogout={handleLogout} />
                ) : (
                  <Navigate to={getDefaultRoute()} replace />
                )
              } 
            />
            
            {/* Professional Panel (Analista/Abogado) */}
            <Route 
              path="/professional" 
              element={
                userProfile.role === 'analista' || userProfile.role === 'abogado' ? (
                  <ProfessionalPanel onLogout={handleLogout} />
                ) : (
                  <Navigate to={getDefaultRoute()} replace />
                )
              } 
            />
            
            {/* Client Panel */}
            <Route 
              path="/client" 
              element={
                userProfile.role === 'cliente' ? (
                  <ClientPanel onLogout={handleLogout} />
                ) : (
                  <Navigate to={getDefaultRoute()} replace />
                )
              } 
            />

            {/* Pending Authorization */}
            <Route 
              path="/pending" 
              element={<PendingAuthorization onLogout={handleLogout} />} 
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;