import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User, Link, Calendar } from 'lucide-react';
import { Task } from '@/types/database';
import { authService } from '@/lib/auth';

interface TaskChatMessage {
  id: string;
  task_id: string;
  sender: 'cliente' | 'analista' | 'colaborador';
  sender_name: string;
  message: string;
  timestamp: string;
  type: 'message' | 'status_change' | 'file_upload';
}

interface TaskChatModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'cliente' | 'analista';
}

export default function TaskChatModal({ task, isOpen, onClose, userRole }: TaskChatModalProps) {
  const [messages, setMessages] = useState<TaskChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [showDriveLinkInput, setShowDriveLinkInput] = useState(false);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (task) {
      // Load existing messages for this task
      const savedMessages = localStorage.getItem(`task_chat_${task.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with some demo messages
        const demoMessages: TaskChatMessage[] = [
          {
            id: 'msg_1',
            id: task.id,
            sender: 'analista',
            sender_name: 'María González',
            message: 'He creado esta tarea para que puedas subir el contrato. Por favor, súbelo a la carpeta de Drive correspondiente.',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            type: 'message'
          },
          {
            id: 'msg_2',
            id: task.id,
            sender: 'cliente',
            sender_name: 'Inversiones Andinas S.A.C.',
            message: 'Perfecto, estaré subiendo el documento esta semana. ¿Hay algún formato específico que prefieras?',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            type: 'message'
          }
        ];
        setMessages(demoMessages);
        localStorage.setItem(`task_chat_${task.id}`, JSON.stringify(demoMessages));
      }
    }
  }, [task]);

  const handleSendMessage = () => {
    if (newMessage.trim() && task && currentUser) {
      const message: TaskChatMessage = {
        id: `msg_${Date.now()}`,
        id: task.id,
        sender: userRole,
        sender_name: currentUser.nombre,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      localStorage.setItem(`task_chat_${task.id}`, JSON.stringify(updatedMessages));
      setNewMessage('');
    }
  };

  const handleAddDriveLink = () => {
    if (driveLink.trim() && task && currentUser) {
      const message: TaskChatMessage = {
        id: `msg_${Date.now()}`,
        id: task.id,
        sender: userRole,
        sender_name: currentUser.nombre,
        message: `He compartido un archivo: ${driveLink}`,
        timestamp: new Date().toISOString(),
        type: 'file_upload'
      };

      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      localStorage.setItem(`task_chat_${task.id}`, JSON.stringify(updatedMessages));
      setDriveLink('');
      setShowDriveLinkInput(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
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

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span>Chat: {task.titulo}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Task Info */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Fecha límite: {new Date(task.fecha_limite).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Estado:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                task.estado === 'completada' ? 'bg-green-100 text-green-800' :
                task.estado === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === userRole ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === userRole 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {getSenderIcon(message.sender)}
                    <span className={`text-xs font-medium ${
                      message.sender === userRole ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.sender_name}
                    </span>
                    <span className={`text-xs ${
                      message.sender === userRole ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {message.type === 'file_upload' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Link className="h-4 w-4" />
                      <span className="text-sm font-medium">Archivo compartido</span>
                    </div>
                  )}
                  
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Drive Link Input */}
        {showDriveLinkInput && (
          <div className="flex space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <Input
              placeholder="Pega aquí el enlace de Google Drive..."
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDriveLink()}
            />
            <Button onClick={handleAddDriveLink} size="sm">
              <Link className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDriveLinkInput(false)} 
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Message Input */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDriveLinkInput(!showDriveLinkInput)}
            title="Compartir enlace de Drive"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}