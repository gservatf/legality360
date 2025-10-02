import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, FileText, CreditCard, Calendar, ExternalLink } from 'lucide-react';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

export default function ClientAccount() {
  const clientId = authService.getCurrentClientId();
  const client = clientId ? mockDB.getClientById(clientId) : null;
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case

  if (!client) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'en revisión':
        return <Badge className="bg-yellow-100 text-yellow-800">En Revisión</Badge>;
      case 'completado':
        return <Badge className="bg-blue-100 text-blue-800">Completado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Information */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Información del Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{client.nombre}</h3>
            {getStatusBadge(client.estado)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600">{client.correo}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-700">Teléfono:</span>
              <span className="text-gray-600">{client.telefono}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-700">Cliente desde:</span>
              <span className="text-gray-600">{formatDate(client.created_at)}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ver Contrato de Servicios
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Services */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span>Servicios Activos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentCase && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{currentCase.titulo}</h4>
                {getStatusBadge(currentCase.estado)}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{currentCase.descripcion}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Inicio:</span>
                  <span className="text-gray-600">{formatDate(currentCase.fecha_inicio)}</span>
                </div>
                {currentCase.fecha_estimada_fin && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Fin estimado:</span>
                    <span className="text-gray-600">{formatDate(currentCase.fecha_estimada_fin)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Analista asignado:</span>
                  <span className="text-gray-600">{currentCase.analista_asignado}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Plan de Servicios</h4>
            <p className="text-sm text-gray-600 mb-3">Legal 360° - Análisis Integral</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Incluye:</span>
              <Badge variant="outline" className="text-xs">Activo</Badge>
            </div>
            <ul className="text-xs text-gray-600 mt-2 space-y-1">
              <li>• Análisis Business Model Canvas</li>
              <li>• Evaluación de riesgos legales</li>
              <li>• Recomendaciones personalizadas</li>
              <li>• Soporte de analista especializado</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}