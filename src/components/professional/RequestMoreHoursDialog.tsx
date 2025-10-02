import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { dbService } from '@/lib/database'

interface RequestMoreHoursDialogProps {
  open: boolean
  onClose: () => void
  casoId: string
  solicitanteId: string // <-- Agrega este prop para el id del usuario actual
}

export default function RequestMoreHoursDialog({ open, onClose, casoId, solicitanteId }: RequestMoreHoursDialogProps) {
  const [horasAbogado, setHorasAbogado] = useState<string>('')
  const [horasAnalista, setHorasAnalista] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!casoId || (!horasAbogado && !horasAnalista)) {
      setError('Debes especificar al menos una cantidad de horas.')
      return
    }

    try {
      setError(null)
      setIsSubmitting(true)

      const result = await dbService.solicitarHorasExtra({
        solicitante_id: solicitanteId,
        caso_id: casoId,
        horas_abogado: horasAbogado ? parseInt(horasAbogado, 10) : 0,
        horas_analista: horasAnalista ? parseInt(horasAnalista, 10) : 0,
        estado: 'pendiente',
      })

      if (result) {
        setSuccess('Solicitud de horas enviada exitosamente.')
        setHorasAbogado('')
        setHorasAnalista('')
        onClose()
      } else {
        setError('Error al enviar la solicitud de horas.')
      }
    } catch (err) {
      setError('Error al enviar la solicitud de horas.')
      console.error('Error requesting more hours:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Más Horas</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="horas-abogado" className="block text-sm font-medium text-gray-700">
              Horas adicionales para abogado
            </label>
            <Input
              id="horas-abogado"
              type="number"
              value={horasAbogado}
              onChange={(e) => setHorasAbogado(e.target.value)}
              placeholder="Ej: 5"
            />
          </div>
          <div>
            <label htmlFor="horas-analista" className="block text-sm font-medium text-gray-700">
              Horas adicionales para analista
            </label>
            <Input
              id="horas-analista"
              type="number"
              value={horasAnalista}
              onChange={(e) => setHorasAnalista(e.target.value)}
              placeholder="Ej: 3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
