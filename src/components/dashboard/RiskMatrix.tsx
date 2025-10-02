import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BMCBlock } from '@/types/database';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

export default function RiskMatrix() {
  const clientId = authService.getCurrentClientId();
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case
  const bmcBlocks = currentCase ? mockDB.getBMCBlocksByCaseId(currentCase.id) : [];

  const bmcBlockNames = [
    'Key Partners', 'Key Activities', 'Value Proposition', 'Customer Relationships', 'Customer Segments',
    'Key Resources', 'Channels', 'Cost Structure', 'Revenue Streams'
  ];

  const getRiskIcon = (level: BMCBlock['risk_level']) => {
    switch (level) {
      case 'green':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'yellow':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'red':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRiskBadgeVariant = (level: BMCBlock['risk_level']) => {
    switch (level) {
      case 'green':
        return 'default';
      case 'yellow':
        return 'secondary';
      case 'red':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBlockData = (blockName: string) => {
    return bmcBlocks.find(block => block.block_name === blockName) || {
      block_name: blockName as BMCBlock['block_name'],
      risk_level: 'yellow' as BMCBlock['risk_level'],
      risk_description: 'Pendiente de análisis',
      recommendation: 'En evaluación'
    };
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Análisis de Riesgos - Business Model Canvas</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Matriz de riesgos por bloque del modelo de negocio</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {bmcBlockNames.map((blockName, index) => {
            const blockData = getBlockData(blockName);
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm text-gray-900 leading-tight">{blockName}</h4>
                    {getRiskIcon(blockData.risk_level)}
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant={getRiskBadgeVariant(blockData.risk_level)} className="text-xs">
                      {blockData.risk_level === 'green' ? 'Bajo Riesgo' : 
                       blockData.risk_level === 'yellow' ? 'Riesgo Medio' : 'Alto Riesgo'}
                    </Badge>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {blockData.risk_description}
                    </p>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-blue-600 font-medium">Recomendación:</p>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {blockData.recommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Bajo Riesgo</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600">Riesgo Medio</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-gray-600">Alto Riesgo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}