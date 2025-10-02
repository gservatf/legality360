import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';

export default function CollaboratorManager() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Colaboradores del Equipo</span>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">Gestiona los colaboradores que pueden ser asignados a tareas</p>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Funcionalidad en desarrollo</p>
          <p className="text-sm text-gray-500">
            La gestión de colaboradores estará disponible próximamente cuando se implemente la tabla correspondiente en Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
