import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { dbService } from '@/lib/database'
import { Empresa } from '@/lib/supabase'

export default function EmpresasTab({ stats, setError, setSuccess }: any) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [newEmpresa, setNewEmpresa] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setEmpresas(await dbService.getAllEmpresas())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Empresas</CardTitle>
        <CardDescription>
          {stats.total_empresas} empresas registradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Nombre de la nueva empresa"
            value={newEmpresa}
            onChange={(e) => setNewEmpresa(e.target.value)}
          />
          <Button
            onClick={async () => {
              if (!newEmpresa.trim()) return
              const ok = await dbService.createEmpresa(newEmpresa.trim())
              if (ok) {
                setSuccess(`Empresa "${newEmpresa}" creada correctamente`)
                setNewEmpresa('')
                load()
              } else {
                setError('Error al crear empresa')
              }
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>

        {empresas.length === 0 ? (
          <p className="text-gray-500">No hay empresas registradas</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.nombre}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" /> Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Empresa</DialogTitle>
                          <DialogDescription>Cambia el nombre de la empresa</DialogDescription>
                        </DialogHeader>
                        <Input
                          defaultValue={e.nombre}
                          onChange={(ev) => (e.nombre = ev.target.value)}
                        />
                        <DialogFooter>
                          <Button
                            onClick={async () => {
                              const ok = await dbService.updateEmpresa(e.id, e.nombre)
                              if (ok) {
                                setSuccess(`Empresa actualizada a "${e.nombre}"`)
                                load()
                              } else {
                                setError('Error al actualizar empresa')
                              }
                            }}
                          >
                            Guardar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const ok = await dbService.deleteEmpresa(e.id)
                        if (ok) {
                          setSuccess(`Empresa "${e.nombre}" eliminada`)
                          load()
                        } else {
                          setError('Error al eliminar empresa')
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
