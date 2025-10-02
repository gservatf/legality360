import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import type { Caso, Profile } from '@/lib/types'

interface Mensaje {
  id: string
  caso_id: string
  sender: string
  sender_name: string
  mensaje: string
  fecha_envio: string
  leido: boolean
}

export default function Chat() {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [currentCase, setCurrentCase] = useState<Caso | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)

  // Inicializar usuario y caso
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentProfile()
        setCurrentUser(user)

        if (user) {
          const { data: casos, error } = await supabase
            .from('casos')
            .select('*')
            .eq('cliente_id', user.id)
            .limit(1)

          if (error) {
            console.error('Error cargando casos:', error)
            return
          }

          if (casos && casos.length > 0) {
            setCurrentCase(casos[0])
          }
        }
      } catch (err) {
        console.error('Error inicializando chat:', err)
      }
    }
    init()
  }, [])

  // Cargar mensajes del caso actual
  useEffect(() => {
    if (!currentCase) return

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('caso_id', currentCase.id)
        .order('fecha_envio', { ascending: true })

      if (error) {
        console.error('Error cargando mensajes:', error)
        return
      }

      setMessages(data ?? [])
    }

    loadMessages()
  }, [currentCase])

  // Suscripción realtime (INSERT y UPDATE)
  useEffect(() => {
    if (!currentCase) return

    const channel = supabase
      .channel('mensajes-stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mensajes', filter: `caso_id=eq.${currentCase.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Mensaje])
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((m) => (m.id === (payload.new as Mensaje).id ? (payload.new as Mensaje) : m))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentCase])

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentCase || !currentUser) return

    const { error } = await supabase.from('mensajes').insert([
      {
        caso_id: currentCase.id,
        sender: currentUser.role || 'cliente',
        sender_name: currentUser.full_name || 'Usuario',
        mensaje: newMessage.trim(),
        fecha_envio: new Date().toISOString(),
        leido: false,
      },
    ])

    if (error) {
      console.error('Error enviando mensaje:', error)
      return
    }

    setNewMessage('')
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
        {/* Lista de mensajes */}
        <div className="h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay mensajes aún</p>
                <p className="text-xs text-gray-400 mt-1">Inicia la conversación con tu analista</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === (currentUser?.role || 'cliente')
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                    message.sender === (currentUser?.role || 'cliente')
                      ? 'flex-row-reverse space-x-reverse'
                      : ''
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={
                        message.sender === 'cliente'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }
                    >
                      {message.sender === 'cliente' ? 'C' : 'A'}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === (currentUser?.role || 'cliente')
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          message.sender === (currentUser?.role || 'cliente')
                            ? 'text-blue-100'
                            : 'text-gray-600'
                        }`}
                      >
                        {message.sender_name}
                      </span>
                      <span
                        className={`text-xs ${
                          message.sender === (currentUser?.role || 'cliente')
                            ? 'text-blue-200'
                            : 'text-gray-400'
                        }`}
                      >
                        {formatMessageTime(message.fecha_envio)}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        message.sender === (currentUser?.role || 'cliente')
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {message.mensaje}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input y enviar */}
        <div className="flex space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer */}
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
  )
}
