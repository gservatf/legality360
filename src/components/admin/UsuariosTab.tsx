import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { dbService } from '@/lib/database'
import { Profile, ProfileWithTaskCount } from '@/lib/supabase'

const ROLES: Profile['role'][] = ['admin', 'analista', 'abogado', 'cliente']

// -----------------------------
// Componente fila de usuario pendiente
// -----------------------------
function PendingUserRow({ u, loadUsuarios, setSuccess, setError }: {
  u: Profile,
  loadUsuarios: () => Promise<void>,
  setSuccess: (msg: string) => void,
  setError: (msg: string) => void
}) {
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedRole) return
    setSaving(true)
    try {
      const ok = await dbService.updateProfileRole(u.id, selectedRole as Profile['role'])
      if (ok) {
        setSuccess('Rol actualizado correctamente')
        setSelectedRole(undefined)
        loadUsuarios()
      } else {
        setError('Error al actualizar el rol')
      }
    } catch {
      setError('Error al actualizar el rol')
    } finally {
      setSaving(false)
    }
  }

  return (
    <TableRow key={u.id}>
      <TableCell>{u.email}</TableCell>
      <TableCell>{u.full_name || 'Sin nombre'}</TableCell>
      <TableCell className="flex gap-2 items-center">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Asignar rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!selectedRole || saving}
          onClick={handleSave}
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  )
}

// -----------------------------
// Componente principal
// -----------------------------
export default function UsuariosTab({ stats, setError, setSuccess }: any) {
  const [users, setUsers] = useState<ProfileWithTaskCount[]>([])
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])

  const loadUsuarios = async () => {
    setUsers(await dbService.getAllProfilesWithTaskCounts())
    setPendingUsers(await dbService.getPendingUsers())
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>
          {stats.total_usuarios} usuarios en total — {stats.usuarios_pendientes} pendientes de aprobación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Usuarios Pendientes</h3>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-500 mb-4">No hay usuarios pendientes</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((u) => (
                <PendingUserRow
                  key={u.id}
                  u={u}
                  loadUsuarios={loadUsuarios}
                  setSuccess={setSuccess}
                  setError={setError}
                />
              ))}
            </TableBody>
          </Table>
        )}

        <h3 className="font-semibold mt-6 mb-2">Todos los Usuarios</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tareas Pendientes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.full_name}</TableCell>
                <TableCell><Badge>{u.role}</Badge></TableCell>
                <TableCell>{u.tareas_pendientes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
