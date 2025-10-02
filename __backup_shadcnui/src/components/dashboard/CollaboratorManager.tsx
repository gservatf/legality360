import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Mail, UserCheck } from 'lucide-react';
import { ClientCollaborator } from '@/types/database';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

export default function CollaboratorManager() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    nombre: '',
    correo: '',
    rol: 'colaborador' as 'colaborador' | 'administrador_cliente'
  });

  const clientId = authService.getCurrentClientId();
  const collaborators = clientId ? mockDB.getCollaboratorsByClientId(clientId) : [];

  const handleAddCollaborator = () => {
    if (clientId && newCollaborator.nombre && newCollaborator.correo) {
      mockDB.addCollaborator({
        client_id: clientId,
        nombre: newCollaborator.nombre,
        correo: newCollaborator.correo,
        rol: newCollaborator.rol
      });
      
      setNewCollaborator({
        nombre: '',
        correo: '',
        rol: 'colaborador'
      });
      setIsAddModalOpen(false);
      
      // In a real app, this would trigger a re-render
      window.location.reload();
    }
  };

  const getRoleBadge = (rol: string) => {
    return rol === 'administrador_cliente' ? (
      <Badge className="bg-blue-100 text-blue-800 text-xs">Administrador</Badge>
    ) : (
      <Badge variant="outline" className="text-xs">Colaborador</Badge>
    );
  };

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Colaboradores del Equipo</span>
            </div>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Colaborador
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">Gestiona los colaboradores que pueden ser asignados a tareas</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {collaborators.map(collaborator => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{collaborator.nombre}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Mail className="h-3 w-3" />
                      <span>{collaborator.correo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleBadge(collaborator.rol)}
                </div>
              </div>
            ))}
            
            {collaborators.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay colaboradores registrados</p>
                <p className="text-xs text-gray-400 mt-1">Agrega colaboradores para asignarles tareas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Collaborator Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Colaborador</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={newCollaborator.nombre}
                onChange={(e) => setNewCollaborator(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                value={newCollaborator.correo}
                onChange={(e) => setNewCollaborator(prev => ({ ...prev, correo: e.target.value }))}
                placeholder="juan.perez@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={newCollaborator.rol}
                onValueChange={(value) => setNewCollaborator(prev => ({ ...prev, rol: value as 'colaborador' | 'administrador_cliente' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="administrador_cliente">Administrador del Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Colaborador:</strong> Puede ser asignado a tareas y ver información del proyecto.<br/>
                <strong>Administrador:</strong> Tiene permisos adicionales para gestionar el equipo.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddCollaborator}
              disabled={!newCollaborator.nombre || !newCollaborator.correo}
            >
              Agregar Colaborador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}