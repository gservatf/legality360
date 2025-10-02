import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export default function RiskMatrix() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span>Matriz de Riesgos - Business Model Canvas</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Evaluación de riesgos legales por bloque del modelo de negocio
        </p>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Funcionalidad en desarrollo</p>
          <p className="text-sm text-gray-500">
            La matriz de riesgos BMC estará disponible próximamente cuando se implemente la tabla correspondiente en Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
