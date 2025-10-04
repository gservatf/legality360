import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentProfile } from '@/lib/auth'
import type { UserProfile } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const prof = await getCurrentProfile()

        if (!isMounted) return
        setProfile(prof)

        // Si no hay perfil, redirige al login
        if (!prof) {
          navigate('/login', { replace: true })
          return
        }

        // Si el perfil está pendiente, redirige
        if (prof.role === 'pending') {
          navigate('/pendiente', { replace: true })
          return
        }

        // Redirección según rol
        switch (prof.role) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true })
            break
          case 'cliente':
            navigate('/cliente/dashboard', { replace: true })
            break
          case 'analista':
            navigate('/analista/dashboard', { replace: true })
            break
          case 'abogado':
            navigate('/abogado/dashboard', { replace: true })
            break
        }
      } catch (err: any) {
        console.error('Error en AuthGuard:', err)
        navigate('/login', { replace: true })
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-center">Cargando sesión...</p>
      </div>
    )
  }

  // Si ya hay perfil cargado, renderiza el contenido protegido
  return <>{children}</>
}
