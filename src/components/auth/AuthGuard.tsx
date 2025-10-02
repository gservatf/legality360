'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import type { UserProfile } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const prof = await getCurrentProfile()
        setProfile(prof)

        if (!prof) {
          router.push('/login')
          return
        }

        if (prof.role === 'pending') {
          router.push('/pendiente')
          return
        }

        // Redirección según rol
        if (prof.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (prof.role === 'cliente') {
          router.push('/cliente/dashboard')
        } else if (prof.role === 'analista') {
          router.push('/analista/dashboard')
        } else if (prof.role === 'abogado') {
          router.push('/abogado/dashboard')
        }
      } catch (err: any) {
        if (err.message === 'PENDING_ACCOUNT') {
          router.push('/pendiente')
        } else {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Cargando...</p>
  }

  return <>{children}</>
}
