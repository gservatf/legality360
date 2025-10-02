import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, User } from 'lucide-react';
import { mockDB } from '@/lib/mockDatabase';
import { authService } from '@/lib/auth';

export default function Chat() {
  const [newMessage, setNewMessage] = useState('');
  const clientId = authService.getCurrentClientId();
  const cases = clientId ? mockDB.getCasesByClientId(clientId) : [];
  const currentCase = cases[0]; // For demo, use first case
  const messages = currentCase ? mockDB.getChatMessagesByCaseId(currentCase.caso_id) : [];

  const handleSendMessage = () => {
    if (newMessage.trim() && currentCase) {
      mockDB.addChatMessage({
        caso_id: currentCase.caso_id,
        sender: 'cliente',
        sender_name: authService.getCurrentUser()?.nombre || 'Cliente',
        mensaje: newMessage.trim(),
        fecha_envio: new Date().toISOString(),
        leido: false
      });
      setNewMessage('');
      // In a real app, this would trigger a re-render
      window.location.reload();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime()
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <span>Chat con Analista</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comunicación directa con {currentCase?.analista_asignado || 'tu analista asignado'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Container */}
        <div className="h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-4">
          {sortedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay mensajes aún</p>
                <p className="text-xs text-gray-400 mt-1">Inicia la conversación con tu analista</p>
              </div>
            </div>
          ) : (
            sortedMessages.map(message => (
              <div 
                key={message.message_id} 
                className={`flex ${message.sender === 'cliente' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'cliente' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={message.sender === 'cliente' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                      {message.sender === 'cliente' ? 'C' : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'cliente' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium ${
                        message.sender === 'cliente' ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.sender_name}
                      </span>
                      <span className={`text-xs ${
                        message.sender === 'cliente' ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {formatMessageTime(message.fecha_envio)}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      message.sender === 'cliente' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.mensaje}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3" />
            <span>Analista: {currentCase?.analista_asignado || 'No asignado'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>En línea</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}