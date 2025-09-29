import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/pages/Dashboard';
import { authService } from '@/lib/auth';
import { Profile } from '@/lib/supabase';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      await authService.initialize();
      const user = authService.getCurrentUser();
      const profile = authService.getCurrentProfile();
      
      setIsAuthenticated(!!user);
      setUserProfile(profile);
    };

    initializeAuth();
  }, []);

  const handleLogin = () => {
    const user = authService.getCurrentUser();
    const profile = authService.getCurrentProfile();
    
    setIsAuthenticated(!!user);
    setUserProfile(profile);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
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

  // Route based on user role
  const getDefaultRoute = () => {
    switch (userProfile.role) {
      case 'admin':
        return '/admin';
      case 'analista':
        return '/analyst';
      case 'cliente':
      case 'colaborador':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            <Route 
              path="/dashboard" 
              element={
                userProfile.role === 'cliente' || userProfile.role === 'colaborador' ? (
                  <Dashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to={getDefaultRoute()} replace />
                )
              } 
            />
            <Route 
              path="/analyst" 
              element={
                userProfile.role === 'analista' || userProfile.role === 'admin' ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Módulo de Analista</h1>
                      <p className="text-gray-600 mb-4">En desarrollo...</p>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <Navigate to={getDefaultRoute()} replace />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                userProfile.role === 'admin' ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Panel de Administrador</h1>
                      <p className="text-gray-600 mb-4">En desarrollo...</p>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <Navigate to={getDefaultRoute()} replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;