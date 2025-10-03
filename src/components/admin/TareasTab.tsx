import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { dbService } from '@/lib/database'
import { Tarea, CasoWithDetails, Profile } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'

const TAREA_ESTADOS = ['pendiente', 'en_progreso', 'completada'] as const

export default function TareasTab({ stats, setError, setSuccess }: any) {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [usuarios, setUsuarios] = useState<Profile[]>([])

  const [selectedCasoId, setSelectedCasoId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newTituloTarea, setNewTituloTarea] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setCasos(await dbService.getAllCasosWithDetails())
    setUsuarios(await dbService.getAllProfiles())
    setTareas(await dbService.getTareasByUser('')) // todas las tareas
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Tareas</CardTitle>
        <CardDescription>
          {stats.total_tareas} tareas en total — {stats.tareas_pendientes} pendientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label>Caso</Label>
            <Select value={selectedCasoId} onValueChange={setSelectedCasoId}>
              <SelectTrigger><SelectValue placeholder="Selecciona caso" /></SelectTrigger>
              <SelectContent>
                {casos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Asignado a</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger>
              <SelectContent>
                {usuarios.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Título</Label>
            <Input
              placeholder="Ej: Redactar demanda"
              value={newTituloTarea}
              onChange={(e) => setNewTituloTarea(e.target.value)}
            />
          </div>
          <Button
            onClick={async () => {
              if (!selectedCasoId || !selectedUserId || !newTituloTarea.trim()) {
                setError('Selecciona caso, usuario y título antes de crear tarea')
                return
              }
              const ok = await dbService.createTarea(selectedCasoId, selectedUserId, newTituloTarea.trim())
              if (ok) {
                setSuccess('Tarea creada correctamente')
                setNewTituloTarea('')
                setSelectedCasoId('')
                setSelectedUserId('')
                load()
              } else {
                setError('Error al crear tarea')
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Crear Tarea
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Caso</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tareas.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.titulo}</TableCell>
                <TableCell>{t.caso?.titulo || '-'}</TableCell>
                <TableCell>{t.asignado_a}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={t.estado}
                    onValueChange={async (nuevoEstado) => {
                      const ok = await dbService.updateTareaEstado(t.id, nuevoEstado as any)
                      if (ok) {
                        setSuccess(`Tarea actualizada a ${nuevoEstado}`)
                        load()
                      } else {
                        setError('Error al actualizar tarea')
                      }
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAREA_ESTADOS.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
