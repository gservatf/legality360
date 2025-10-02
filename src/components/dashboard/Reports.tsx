import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

export default function Reports() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-green-600" />
          <span>Reportes del Proyecto</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Accede a todos los reportes generados para tu proyecto
        </p>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Funcionalidad en desarrollo</p>
          <p className="text-sm text-gray-500">
            Los reportes estarán disponibles próximamente cuando se implemente la tabla correspondiente en Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
