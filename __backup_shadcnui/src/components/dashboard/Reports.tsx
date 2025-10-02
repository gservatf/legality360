import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState('');
  const clientId = authService.getCurrentClientId();
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case
  const reports = currentCase ? mockDB.getReportsByCaseId(currentCase.caso_id) : [];

  const reportTypes = [
    { value: 'riesgos', label: 'Reporte de Riesgos' },
    { value: 'progreso', label: 'Reporte de Progreso' },
    { value: 'completo', label: 'Reporte Completo' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'listo':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generando':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'listo':
        return <Badge className="bg-green-100 text-green-800 text-xs">Listo</Badge>;
      case 'generando':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Generando</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleGenerateReport = () => {
    if (selectedReportType) {
      // In a real app, this would trigger report generation
      alert(`Generando reporte: ${reportTypes.find(t => t.value === selectedReportType)?.label}`);
    }
  };

  const handleDownloadReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank');
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <span>Reportes del Proyecto</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Genera y descarga reportes personalizados</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Generation */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-medium text-gray-900 mb-4">Generar Nuevo Reporte</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Reporte
              </label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Reporte de Riesgos:</strong> Análisis detallado de riesgos por bloque BMC</p>
              <p><strong>Reporte de Progreso:</strong> Estado actual del proyecto y timeline</p>
              <p><strong>Reporte Completo:</strong> Análisis integral con recomendaciones</p>
            </div>
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={!selectedReportType}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>

        {/* Existing Reports */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Reportes Disponibles</h4>
          
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.report_id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(report.estado)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{report.titulo}</h5>
                      {getStatusBadge(report.estado)}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(report.fecha_generacion)}</span>
                      </div>
                      <span className="capitalize">Tipo: {report.tipo}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {report.estado === 'listo' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadReport(report.drive_url)}
                      className="text-xs h-8"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Descargar
                    </Button>
                  )}
                  {report.estado === 'generando' && (
                    <div className="flex items-center space-x-2 text-xs text-yellow-600">
                      <Clock className="h-3 w-3 animate-spin" />
                      <span>Procesando...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay reportes generados aún</p>
                <p className="text-xs text-gray-400 mt-1">Genera tu primer reporte usando el formulario anterior</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-sm text-gray-900 mb-2">Información de Reportes</h5>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Todos los reportes incluyen el logo oficial de LEGALITY 360°</p>
            <p>• Formato de numeración: LG-XX-CORP-DD-MES-AAAA</p>
            <p>• Los reportes se almacenan automáticamente en Google Drive</p>
            <p>• Incluyen disclaimer legal y términos de confidencialidad</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}