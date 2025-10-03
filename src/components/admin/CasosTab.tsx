import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, BadgeCheck } from 'lucide-react'
import { dbService } from '@/lib/database'
import { CasoWithDetails, Empresa, Profile } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'

export default function CasosTab({ stats, setError, setSuccess }: any) {
  const [casos, setCasos] = useState<CasoWithDetails[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [clientes, setClientes] = useState<Profile[]>([])
  const [newTituloCaso, setNewTituloCaso] = useState('')
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('')
  const [selectedClienteId, setSelectedClienteId] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setCasos(await dbService.getAllCasosWithDetails())
    setEmpresas(await dbService.getAllEmpresas())
    setClientes((await dbService.getAllProfiles()).filter(u => u.role === 'cliente'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Casos</CardTitle>
        <CardDescription>
          {stats.total_casos} casos en total — {stats.casos_activos} activos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label>Empresa</Label>
            <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
              <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Cliente</Label>
            <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
              <SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Título</Label>
            <Input
              placeholder="Ej: Demanda laboral"
              value={newTituloCaso}
              onChange={(e) => setNewTituloCaso(e.target.value)}
            />
          </div>
          <Button
            onClick={async () => {
              if (!selectedEmpresaId || !selectedClienteId || !newTituloCaso.trim()) {
                setError('Selecciona empresa, cliente y título antes de crear el caso')
                return
              }
              const ok = await dbService.createCaso(selectedEmpresaId, selectedClienteId, newTituloCaso.trim())
              if (ok) {
                setSuccess('Caso creado correctamente')
                setNewTituloCaso('')
                setSelectedEmpresaId('')
                setSelectedClienteId('')
                load()
              } else {
                setError('Error al crear el caso')
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Crear Caso
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tareas Pendientes</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casos.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.titulo}</TableCell>
                <TableCell>{c.empresa?.nombre}</TableCell>
                <TableCell>{c.cliente?.full_name || c.cliente?.email}</TableCell>
                <TableCell>
                  <Badge variant={c.estado === 'activo' ? 'default' : 'secondary'}>{c.estado}</Badge>
                </TableCell>
                <TableCell>{c.tareas_pendientes}</TableCell>
                <TableCell>
                  {c.estado === 'activo' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSuccess('Aquí implementar cerrar caso con dbService.updateCasoEstado')}
                    >
                      Cerrar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
