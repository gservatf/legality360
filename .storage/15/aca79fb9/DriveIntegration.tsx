import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, FileText, Download, ExternalLink, Calendar } from 'lucide-react';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

export default function DriveIntegration() {
  const clientId = authService.getCurrentClientId();
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case
  const documents = currentCase ? mockDB.getDocumentsByCaseId(currentCase.caso_id) : [];

  const handleOpenDriveFolder = () => {
    if (currentCase?.carpeta_drive_url) {
      window.open(currentCase.carpeta_drive_url, '_blank');
    }
  };

  const handleOpenDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contrato':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'reporte':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'evaluacion':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'contrato':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Contrato</Badge>;
      case 'reporte':
        return <Badge className="bg-green-100 text-green-800 text-xs">Reporte</Badge>;
      case 'evaluacion':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Evaluación</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5 text-orange-600" />
          <span>Documentos del Proyecto</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Acceso a documentos almacenados en Google Drive</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Drive Folder Access */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FolderOpen className="h-6 w-6 text-orange-600" />
              <div>
                <h4 className="font-medium text-gray-900">Carpeta Principal del Caso</h4>
                <p className="text-sm text-gray-600">Acceso completo a todos los documentos</p>
              </div>
            </div>
            <Button onClick={handleOpenDriveFolder} className="bg-orange-600 hover:bg-orange-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Drive
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Button variant="outline" size="sm" className="text-xs h-8">
              <FolderOpen className="h-3 w-3 mr-1" />
              Contratos
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <FolderOpen className="h-3 w-3 mr-1" />
              Reportes
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <FolderOpen className="h-3 w-3 mr-1" />
              Evaluaciones
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <FolderOpen className="h-3 w-3 mr-1" />
              Otros
            </Button>
          </div>
        </div>

        {/* Document Registry */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Registro de Documentos</h4>
          <div className="space-y-3">
            {documents.map(document => (
              <div key={document.document_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3 flex-1">
                  {getDocumentTypeIcon(document.tipo)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{document.nombre}</h5>
                      {getDocumentTypeBadge(document.tipo)}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(document.fecha_subida)}</span>
                      </div>
                      <span className="capitalize">Subido por: {document.subido_por}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDocument(document.drive_url)}
                    className="text-xs h-8"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    <Download className="h-3 w-3 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            ))}
            
            {documents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay documentos registrados aún</p>
                <p className="text-xs text-gray-400 mt-1">Los documentos aparecerán aquí cuando sean subidos</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h5 className="font-medium text-sm text-gray-900 mb-3">Acciones Rápidas</h5>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Descargar Todo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}