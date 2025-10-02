import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { dbService } from '@/lib/database';
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
    fecha_limite: ''
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClientId = async () => {
      const profile = await authService.getCurrentProfile();
      if (profile) {
        setClientId(profile.id);
        // Set current user as default responsible
        setFormData(prev => ({ ...prev, responsable: profile.id }));
      }
    };
    loadClientId();
  }, []);

  // Collaborators and BMC blocks - TODO: Implement in Supabase
  const collaborators: any[] = []; // TODO: Fetch from Supabase when implemented
  const bmcBlocks: string[] = []; // TODO: Fetch from Supabase when implemented

  const handleResponsableChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsable: value
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

  const handleSave = async () => {
    if (formData.titulo && formData.responsable && caseId) {
      setLoading(true);
      try {
        // Create task in Supabase
        const success = await dbService.createTarea(
          caseId,
          formData.responsable,
          formData.titulo,
          formData.descripcion
        );

        if (success) {
          // Reset form
          setFormData({
            titulo: '',
            descripcion: '',
            responsable: clientId || '',
            fecha_limite: ''
          });
          setSelectedDate(undefined);
          
          onSave();
          onClose();
        } else {
          alert('Error al crear la tarea. Por favor intente nuevamente.');
        }
      } catch (error) {
        console.error('Error creating task:', error);
        alert('Error al crear la tarea. Por favor intente nuevamente.');
      } finally {
        setLoading(false);
      }
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

          {/* Responsable - Simplified for now */}
          <div className="space-y-2">
            <Label>Responsable</Label>
            <p className="text-sm text-gray-600">
              La tarea será asignada a tu perfil por defecto
            </p>
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
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading || !formData.titulo || !formData.responsable}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}