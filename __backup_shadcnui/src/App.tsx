import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from '@/components/auth/LoginPage';
import PendingAuthorization from '@/components/auth/PendingAuthorization';
import AdminPanel from '@/components/admin/AdminPanel';
import ProfessionalPanel from '@/components/professional/ProfessionalPanel';
import ClientPanel from '@/components/client/ClientPanel';
import { authService } from '@/lib/auth';
import { Profile } from '@/lib/supabase';

const queryClient = new QueryClient();

// Main App Router Component
const AppRouter = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth service...');
        await authService.initialize();
        
        const user = authService.getCurrentUser();
        const profile = authService.getCurrentProfile();
        
        console.log('Auth initialized - User:', !!user, 'Profile:', profile);
        
        setIsAuthenticated(!!user);
        setUserProfile(profile);
        
        if (user && !profile) {
          console.log('User found but no profile, waiting for profile load...');
          // Wait a bit more for profile to load
          setTimeout(async () => {
            const refreshedProfile = await authService.refreshProfile();
            console.log('Refreshed profile:', refreshedProfile);
            setUserProfile(refreshedProfile);
          }, 1000);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError('Error al inicializar la autenticación');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle role-based redirection
  useEffect(() => {
    if (!userProfile || !isAuthenticated) return;

    console.log('Profile loaded for redirection:', userProfile.role);

    const redirectPath = getRedirectPath(userProfile.role);
    console.log('Redirecting to:', redirectPath);
    
    // Only redirect if we're not already on the correct path
    if (window.location.pathname !== redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [userProfile, isAuthenticated, navigate]);

  const getRedirectPath = (role: Profile['role']): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'analista':
        return '/analista/dashboard';
      case 'abogado':
        return '/abogado/dashboard';
      case 'cliente':
        return '/cliente/dashboard';
      case 'pending':
      default:
        return '/pending';
    }
  };

  const handleLogin = async () => {
    try {
      console.log('Login handler called, waiting for profile...');
      
      // Wait for profile to be loaded
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = authService.getCurrentUser();
        const profile = authService.getCurrentProfile();
        
        console.log(`Login attempt ${attempts + 1} - User:`, !!user, 'Profile:', profile);
        
        if (user && profile) {
          setIsAuthenticated(true);
          setUserProfile(profile);
          setAuthError(null);
          break;
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.warn('Profile loading timeout, forcing refresh...');
        const refreshedProfile = await authService.refreshProfile();
        if (refreshedProfile) {
          setUserProfile(refreshedProfile);
        }
      }
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
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError('Error al cerrar sesión');
    }
  };

  // Show error if auth initialization failed
  if (authError) {
    return (
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
    );
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Legality360</h2>
          <p className="text-gray-600">Cargando sistema legal...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !userProfile) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show pending authorization if user role is pending
  if (userProfile.role === 'pending') {
    return <PendingAuthorization onLogout={handleLogout} />;
  }

  // Main application routes
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          userProfile.role === 'admin' ? (
            <AdminPanel onLogout={handleLogout} />
          ) : (
            <Navigate to={getRedirectPath(userProfile.role)} replace />
          )
        } 
      />
      
      {/* Professional Routes (Analista) */}
      <Route 
        path="/analista/dashboard" 
        element={
          userProfile.role === 'analista' ? (
            <ProfessionalPanel onLogout={handleLogout} />
          ) : (
            <Navigate to={getRedirectPath(userProfile.role)} replace />
          )
        } 
      />
      
      {/* Professional Routes (Abogado) */}
      <Route 
        path="/abogado/dashboard" 
        element={
          userProfile.role === 'abogado' ? (
            <ProfessionalPanel onLogout={handleLogout} />
          ) : (
            <Navigate to={getRedirectPath(userProfile.role)} replace />
          )
        } 
      />
      
      {/* Client Routes */}
      <Route 
        path="/cliente/dashboard" 
        element={
          userProfile.role === 'cliente' ? (
            <ClientPanel onLogout={handleLogout} />
          ) : (
            <Navigate to={getRedirectPath(userProfile.role)} replace />
          )
        } 
      />

      {/* Pending Authorization */}
      <Route 
        path="/pending" 
        element={<PendingAuthorization onLogout={handleLogout} />} 
      />
      
      {/* Legacy routes for backward compatibility */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/professional" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />
      <Route path="/client" element={<Navigate to="/cliente/dashboard" replace />} />
      <Route path="/login" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to={getRedirectPath(userProfile.role)} replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;