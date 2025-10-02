import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { CaseProgress } from '@/types/database';

interface ProgressTimelineProps {
  caseTitle: string;
}

export default function ProgressTimeline({ caseTitle }: ProgressTimelineProps) {
  // Mock progress data - in real app this would come from props or API
  const progressStages: CaseProgress[] = [
    {
      stage: 'Contrato firmado',
      status: 'completed',
      date_completed: '2025-09-01',
      description: 'Contrato de servicios Legal 360° firmado y procesado'
    },
    {
      stage: 'Análisis inicial',
      status: 'completed',
      date_completed: '2025-09-15',
      description: 'Evaluación preliminar de riesgos completada'
    },
    {
      stage: 'Análisis de riesgos',
      status: 'in_progress',
      description: 'Análisis detallado del Business Model Canvas en progreso'
    },
    {
      stage: 'Reporte preliminar',
      status: 'pending',
      description: 'Generación de reporte inicial de hallazgos'
    },
    {
      stage: 'Implementación',
      status: 'pending',
      description: 'Implementación de recomendaciones y mejoras'
    },
    {
      stage: 'Reporte final',
      status: 'pending',
      description: 'Entrega de reporte final y cierre del caso'
    }
  ];

  const getStatusIcon = (status: CaseProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'blocked':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CaseProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Progreso del Caso</span>
        </CardTitle>
        <p className="text-sm text-gray-600">{caseTitle}</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {progressStages.map((stage, index) => (
              <div key={index} className="relative flex items-start space-x-4">
                {/* Timeline dot */}
                <div className={`relative z-10 flex-shrink-0 w-3 h-3 rounded-full ${getStatusColor(stage.status)} mt-2`}></div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(stage.status)}
                    <h4 className="text-sm font-medium text-gray-900">{stage.stage}</h4>
                    {stage.date_completed && (
                      <span className="text-xs text-gray-500">
                        {new Date(stage.date_completed).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}