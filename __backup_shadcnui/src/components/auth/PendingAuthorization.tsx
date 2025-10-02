import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Shield, Mail, Scale } from 'lucide-react'
import { signOut } from '@/lib/auth'

interface PendingAuthorizationProps {
  onLogout: () => void
}

export default function PendingAuthorization({ onLogout }: PendingAuthorizationProps) {
  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Cuenta Pendiente</CardTitle>
          <CardDescription>
            Tu cuenta está siendo revisada por un administrador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Shield className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-gray-700">Tu cuenta ha sido creada exitosamente</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">Recibirás una notificación cuando sea aprobada</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Scale className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Un administrador revisará tu solicitud pronto</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Mientras tanto, puedes cerrar sesión y volver más tarde.
            </p>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}