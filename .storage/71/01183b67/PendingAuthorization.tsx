import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Shield, Mail } from 'lucide-react'
import { authService } from '@/lib/auth'

interface PendingAuthorizationProps {
  onLogout: () => void
}

export default function PendingAuthorization({ onLogout }: PendingAuthorizationProps) {
  const currentUser = authService.getCurrentProfile()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acceso Pendiente
          </CardTitle>
          <CardDescription>
            Tu cuenta está esperando autorización del administrador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Cuenta Creada Exitosamente
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Tu cuenta ha sido creada pero necesita ser autorizada por un administrador antes de poder acceder al sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span><strong>Email:</strong> {currentUser?.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span><strong>Estado:</strong> Pendiente de autorización</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Próximos Pasos:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Un administrador revisará tu solicitud</li>
              <li>• Recibirás una notificación cuando sea aprobada</li>
              <li>• Podrás acceder al sistema una vez autorizado</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Verificar Estado
            </Button>
            <Button 
              onClick={onLogout}
              className="flex-1"
            >
              Cerrar Sesión
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda? Contacta al administrador del sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}