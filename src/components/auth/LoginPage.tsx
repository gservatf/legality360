import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate();

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Register form
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const { user, profile, error: loginError } = await authService.signIn(loginData.email, loginData.password)
      
      if (loginError || !user) {
        setError('Credenciales inválidas')
      } else {
        setSuccess('Inicio de sesión exitoso')
        setTimeout(() => {
          onLogin()
        }, 1000)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      await authService.signInWithGoogle()
      // Supabase will redirect, so no further action needed here
    } catch (err: any) {
      console.error('Google login error:', err)
      setError(err.message || 'Error al iniciar sesión con Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const { fullName, email, password, confirmPassword } = registerData

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // 1. Registrar usuario en Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message || 'No se pudo registrar el usuario');
        setIsLoading(false);
        return;
      }

      // 2. Obtener sesión activa (puede ser null si requiere confirmación de email)
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        // Si no hay sesión, probablemente requiere confirmación de email
        setSuccess('Tu cuenta ha sido creada. Revisa tu correo para confirmar tu email antes de iniciar sesión.');
        setRegisterData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setIsLoading(false);
        return;
      }

      // 3. Insertar perfil en la tabla "profiles" con el id del usuario autenticado
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: sessionUser.id,
          email: sessionUser.email,
          full_name: fullName,
          role: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        setError(profileError.message || 'No se pudo crear el perfil');
        setIsLoading(false);
        return;
      }

      // 4. Mensaje de éxito y redirección
      setSuccess('Tu cuenta ha sido creada y está pendiente de autorización');
      setRegisterData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
  <div className="flex justify-center mb-4">
    <div className="w-20 h-20 flex items-center justify-center">
      <img 
        src="/legality-logo.png" 
        alt="Legality360" 
        className="w-full h-full object-contain"
      />
    </div>
  </div>
  <CardTitle className="text-2xl font-bold text-gray-900">Legality360</CardTitle>
  <CardDescription>
    Sistema de Gestión Legal
  </CardDescription>
</CardHeader>

        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
              
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">O continúa con</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-fullname">Nombre completo</Label>
                  <Input
                    id="register-fullname"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Al registrarte, tu cuenta estará pendiente de aprobación por un administrador.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}