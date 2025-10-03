import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { dbService } from '@/lib/database'
import { Profile, ProfileWithTaskCount } from '@/lib/supabase'

const ROLES: Profile['role'][] = ['admin', 'analista', 'abogado', 'cliente']

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
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.full_name || 'Sin nombre'}</TableCell>
                  <TableCell>
                    <Select
                      onValueChange={async (selectedRole) => {
                        const ok = await dbService.updateProfileRole(u.id, selectedRole as Profile['role'])
                        if (ok) {
                          setSuccess('Rol asignado correctamente')
                          loadUsuarios()
                        } else {
                          setError('No se pudo actualizar el rol')
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Asignar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
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
