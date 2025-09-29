import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { Task } from '@/types/database';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  caseId: string;
}

export default function NewTaskModal({ isOpen, onClose, onSave, caseId }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    responsable: '',
    responsable_tipo: 'cliente' as 'cliente' | 'analista' | 'colaborador',
    responsable_nombre: '',
    bmc_block: '',
    prioridad: 'media' as 'baja' | 'media' | 'alta',
    fecha_limite: ''
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const clientId = authService.getCurrentClientId();
  const currentUser = authService.getCurrentUser();
  const collaborators = clientId ? mockDB.getCollaboratorsByClientId(clientId) : [];
  const bmcBlocks = mockDB.getBMCBlockNames();

  const handleResponsableChange = (value: string) => {
    const [tipo, id] = value.split(':');
    let nombre = '';
    
    if (tipo === 'cliente') {
      const client = clientId ? mockDB.getClientById(clientId) : null;
      nombre = client?.nombre || 'Cliente';
    } else if (tipo === 'analista') {
      nombre = 'María González'; // In real app, get from current case
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
    if (formData.titulo && formData.responsable && formData.fecha_limite) {
      const newTask: Task = {
        task_id: `task_${Date.now()}`,
        caso_id: caseId,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        responsable: formData.responsable,
        responsable_tipo: formData.responsable_tipo,
        responsable_nombre: formData.responsable_nombre,
        estado: 'pendiente',
        fecha_limite: formData.fecha_limite,
        fecha_creacion: new Date().toISOString().split('T')[0],
        bmc_block: formData.bmc_block || undefined,
        prioridad: formData.prioridad,
        created_by: currentUser?.role === 'analista' ? 'analista' : 'cliente'
      };

      // Add to mock database
      const tasks = mockDB.getTasks();
      tasks.push(newTask);
      localStorage.setItem('legality360_tasks', JSON.stringify(tasks));

      // Reset form
      setFormData({
        titulo: '',
        descripcion: '',
        responsable: '',
        responsable_tipo: 'cliente',
        responsable_nombre: '',
        bmc_block: '',
        prioridad: 'media',
        fecha_limite: ''
      });
      setSelectedDate(undefined);
      
      onSave();
      onClose();
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isFormValid = formData.titulo && formData.responsable && formData.fecha_limite;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título de la Tarea *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
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
              placeholder="Describa los detalles de la tarea"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsable */}
            <div className="space-y-2">
              <Label>Responsable *</Label>
              <Select
                value={formData.responsable ? `${formData.responsable_tipo}:${formData.responsable}` : ''}
                onValueChange={handleResponsableChange}
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
                value={formData.bmc_block}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bmc_block: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar bloque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin bloque asignado</SelectItem>
                  {bmcBlocks.map(block => (
                    <SelectItem key={block} value={block}>
                      {block}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value) => setFormData(prev => ({ ...prev, prioridad: value as 'baja' | 'media' | 'alta' }))}
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

            {/* Fecha Límite */}
            <div className="space-y-2">
              <Label>Fecha Límite *</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Información</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• Los campos marcados con * son obligatorios</p>
              <p>• La tarea se creará en estado "Pendiente"</p>
              <p>• Puedes asignar la tarea a cualquier miembro del equipo</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div></div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid}>
              <Save className="h-4 w-4 mr-2" />
              Crear Tarea
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}