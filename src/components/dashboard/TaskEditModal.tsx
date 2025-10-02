import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X, Link, ExternalLink } from 'lucide-react';
import { Task, TaskEditData } from '@/types/database';
import { dashboardDataService } from '@/lib/dashboardAdapter';
import { authService } from '@/lib/auth';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, taskData: TaskEditData) => void;
  userRole: 'cliente' | 'analista';
}

export default function TaskEditModal({ task, isOpen, onClose, onSave, userRole }: TaskEditModalProps) {
  const [formData, setFormData] = useState<TaskEditData>({
    titulo: '',
    descripcion: '',
    responsable: '',
    responsable_tipo: 'cliente',
    responsable_nombre: '',
    bmc_block: '',
    estado: 'pendiente',
    prioridad: 'media',
    fecha_limite: ''
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);

  // Collaborators and BMC blocks - TODO: Implement in Supabase
  const collaborators: any[] = []; // TODO: Fetch from Supabase when implemented
  const bmcBlocks: string[] = []; // TODO: Fetch from Supabase when implemented

  useEffect(() => {
    const loadClientId = async () => {
      const profile = await authService.getCurrentProfile();
      if (profile) {
        setClientId(profile.id);
      }
    };
    loadClientId();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo,
        descripcion: task.descripcion,
        responsable: task.responsable,
        responsable_tipo: task.responsable_tipo,
        responsable_nombre: task.responsable_nombre,
        bmc_block: task.bmc_block || 'none',
        estado: task.estado,
        prioridad: task.prioridad,
        fecha_limite: task.fecha_limite
      });
      setSelectedDate(task.fecha_limite ? new Date(task.fecha_limite) : undefined);
      
      // Load saved drive link for this task
      const savedDriveLink = localStorage.getItem(`task_drive_${task.task_id}`);
      setDriveLink(savedDriveLink || '');
    }
  }, [task]);

  const handleResponsableChange = async (value: string) => {
    const [tipo, id] = value.split(':');
    let nombre = '';
    
    if (tipo === 'cliente') {
      const profile = await dashboardDataService.getProfileById(clientId || '');
      nombre = profile?.full_name || 'Cliente';
    } else if (tipo === 'analista') {
      nombre = 'María González'; // TODO: Get from case assignment
    } else if (tipo === 'colaborador') {
      const collaborator = collaborators.find(c => c.id === id);
      nombre = collaborator?.nombre || 'Colaborador';
    }

    setFormData(prev => ({
      ...prev,
      responsable: id,
      responsable_tipo: tipo as 'cliente' | 'analista' | 'colaborador',
      responsable_nombre: nombre
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setFormData(prev => ({
        ...prev,
        fecha_limite: formattedDate
      }));
    }
    setIsCalendarOpen(false);
  };

  const handleSave = () => {
    if (task) {
      const saveData = {
        ...formData,
        bmc_block: formData.bmc_block === 'none' ? undefined : formData.bmc_block
      };
      
      // Save drive link separately
      if (driveLink) {
        localStorage.setItem(`task_drive_${task.task_id}`, driveLink);
      }
      
      onSave(task.task_id, saveData);
      onClose();
    }
  };

  // Updated permission logic: Both client and analyst can edit all tasks
  const canEditTask = () => {
    if (!task) return false;
    
    // Analysts can edit all tasks
    if (userRole === 'analista') return true;
    
    // Clients can edit all tasks in their cases
    if (userRole === 'cliente') return true;
    
    return false;
  };

  const canDeleteTask = () => {
    if (!task) return false;
    
    // Analysts can delete all tasks
    if (userRole === 'analista') return true;
    
    // Clients can delete tasks they created
    if (userRole === 'cliente') {
      return task.created_by === 'cliente';
    }
    
    return false;
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openDriveLink = () => {
    if (driveLink) {
      window.open(driveLink, '_blank');
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Editar Tarea</span>
            {!canEditTask() && (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Solo lectura</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título de la Tarea</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              disabled={!canEditTask()}
              placeholder="Ingrese el título de la tarea"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              disabled={!canEditTask()}
              placeholder="Describa los detalles de la tarea"
              rows={3}
            />
          </div>

          {/* Google Drive Link */}
          <div className="space-y-2">
            <Label htmlFor="driveLink">Enlace de Google Drive</Label>
            <div className="flex space-x-2">
              <Input
                id="driveLink"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                disabled={!canEditTask()}
                placeholder="https://drive.google.com/..."
              />
              {driveLink && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openDriveLink}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsable */}
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select
                value={`${formData.responsable_tipo}:${formData.responsable}`}
                onValueChange={handleResponsableChange}
                disabled={!canEditTask()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={`cliente:${clientId}`}>
                    Cliente Principal
                  </SelectItem>
                  <SelectItem value="analista:user_002">
                    Analista (María González)
                  </SelectItem>
                  {collaborators.map(collaborator => (
                    <SelectItem key={collaborator.id} value={`colaborador:${collaborator.id}`}>
                      {collaborator.nombre} ({collaborator.rol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bloque BMC */}
            <div className="space-y-2">
              <Label>Bloque del BMC</Label>
              <Select
                value={formData.bmc_block || 'none'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bmc_block: value }))}
                disabled={!canEditTask()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar bloque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin bloque asignado</SelectItem>
                  {bmcBlocks.map(block => (
                    <SelectItem key={block} value={block}>
                      {block}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value as Task['estado'] }))}
                disabled={!canEditTask()}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en proceso">En Proceso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value) => setFormData(prev => ({ ...prev, prioridad: value as Task['prioridad'] }))}
                disabled={!canEditTask()}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha Límite */}
          <div className="space-y-2">
            <Label>Fecha Límite</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={!canEditTask()}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    formatDateForDisplay(selectedDate)
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Task Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Información de la Tarea</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Creada por:</span> {task.created_by === 'cliente' ? 'Cliente' : 'Analista'}
              </div>
              <div>
                <span className="font-medium">Fecha de creación:</span> {new Date(task.fecha_creacion).toLocaleDateString('es-ES')}
              </div>
              <div>
                <span className="font-medium">Responsable actual:</span> {task.responsable_nombre}
              </div>
              <div>
                <span className="font-medium">ID de tarea:</span> {task.task_id}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {canDeleteTask() && (
              <Button variant="destructive" size="sm">
                Eliminar Tarea
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            {canEditTask() && (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}