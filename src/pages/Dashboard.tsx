import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProgressTimeline from '@/components/dashboard/ProgressTimeline';
import RiskMatrix from '@/components/dashboard/RiskMatrix';
import TaskKanban from '@/components/dashboard/TaskKanban';
import ClientAccount from '@/components/dashboard/ClientAccount';
import DriveIntegration from '@/components/dashboard/DriveIntegration';
import Chat from '@/components/dashboard/Chat';
import Reports from '@/components/dashboard/Reports';
import CollaboratorManager from '@/components/dashboard/CollaboratorManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const clientId = authService.getCurrentClientId();
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case

  useEffect(() => {
    // Initialize database when dashboard loads
    mockDB.initializeDatabase();
  }, []);

  if (!currentCase) {
    return (
      <DashboardLayout onLogout={onLogout}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay casos activos</h2>
          <p className="text-gray-600">Contacta a tu analista para iniciar un nuevo proyecto.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={onLogout}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido a tu Portal Legal 360°
          </h1>
          <p className="text-blue-100">
            Monitorea el progreso de tu proyecto: <span className="font-semibold">{currentCase.titulo}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
            <TabsTrigger value="overview" className="text-xs">Resumen</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">Riesgos</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">Tareas</TabsTrigger>
            <TabsTrigger value="team" className="text-xs">Equipo</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">Documentos</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Reportes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressTimeline caseTitle={currentCase.titulo} />
              <div className="space-y-6">
                <ClientAccount />
              </div>
            </div>
            <RiskMatrix />
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-6">
            <RiskMatrix />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <TaskKanban />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <CollaboratorManager />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DriveIntegration />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Chat />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Reports />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}