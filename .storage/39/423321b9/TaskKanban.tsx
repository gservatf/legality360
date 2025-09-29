import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Flag, CheckCircle2, Edit, Plus } from 'lucide-react';
import { Task, TaskEditData } from '@/types/database';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';
import TaskEditModal from './TaskEditModal';
import NewTaskModal from './NewTaskModal';

export default function TaskKanban() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const clientId = authService.getCurrentClientId();
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role || 'cliente';
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case
  const tasks = currentCase ? mockDB.getTasksByCaseId(currentCase.caso_id) : [];

  const taskColumns = [
    { id: 'pendiente', title: 'Pendientes', color: 'bg-gray-50 border-gray-200' },
    { id: 'en proceso', title: 'En Proceso', color: 'bg-blue-50 border-blue-200' },
    { id: 'completada', title: 'Completadas', color: 'bg-green-50 border-green-200' }
  ];

  const getTasksByStatus = (status: Task['estado']) => {
    return tasks.filter(task => task.estado === status);
  };

  const getPriorityColor = (priority: Task['prioridad']) => {
    switch (priority) {
      case 'alta':
        return 'text-red-600 bg-red-100';
      case 'media':
        return 'text-yellow-600 bg-yellow-100';
      case 'baja':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getResponsibleIcon = (responsable_tipo: Task['responsable_tipo']) => {
    switch (responsable_tipo) {
      case 'cliente':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'analista':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'colaborador':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['estado']) => {
    mockDB.updateTaskStatus(taskId, newStatus);
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (taskId: string, taskData: TaskEditData) => {
    mockDB.updateTask(taskId, taskData);
    setIsEditModalOpen(false);
    setSelectedTask(null);
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const handleNewTask = () => {
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const canEditTask = (task: Task) => {
    if (userRole === 'analista') return true;
    if (userRole === 'cliente') {
      return task.responsable_tipo === 'cliente' || task.responsable_tipo === 'colaborador';
    }
    return false;
  };

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Tareas del Proyecto</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsNewTaskModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">Gestión de tareas en formato Kanban</p>
        </CardHeader>
        <CardContent key={refreshKey}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {taskColumns.map(column => {
              const columnTasks = getTasksByStatus(column.id as Task['estado']);
              
              return (
                <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {columnTasks.map(task => (
                      <Card key={task.task_id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm text-gray-900 leading-tight flex-1 pr-2">
                                {task.titulo}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <Badge className={`text-xs ${getPriorityColor(task.prioridad)}`}>
                                  <Flag className="h-3 w-3 mr-1" />
                                  {task.prioridad}
                                </Badge>
                                {canEditTask(task) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTask(task);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {task.descripcion}
                            </p>
                            
                            {task.bmc_block && (
                              <Badge variant="outline" className="text-xs">
                                {task.bmc_block}
                              </Badge>
                            )}
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                {getResponsibleIcon(task.responsable_tipo)}
                                <span className="text-xs text-gray-600">
                                  {task.responsable_nombre}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className={`text-xs ${isOverdue(task.fecha_limite) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                  {formatDate(task.fecha_limite)}
                                </span>
                              </div>
                            </div>
                            
                            {task.estado !== 'completada' && (
                              <div className="flex space-x-2 pt-2">
                                {task.estado === 'pendiente' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskStatusChange(task.task_id, 'en proceso');
                                    }}
                                  >
                                    Iniciar
                                  </Button>
                                )}
                                {task.estado === 'en proceso' && (
                                  <Button 
                                    size="sm" 
                                    className="text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskStatusChange(task.task_id, 'completada');
                                    }}
                                  >
                                    Completar
                                  </Button>
                                )}
                              </div>
                            )}

                            {/* Task metadata */}
                            <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                              <span>Creada por: {task.created_by === 'cliente' ? 'Cliente' : 'Analista'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No hay tareas en esta columna</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        userRole={userRole}
      />

      {/* New Task Modal */}
      {currentCase && (
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onSave={handleNewTask}
          caseId={currentCase.caso_id}
        />
      )}
    </>
  );
}