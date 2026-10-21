'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/store'

export function PermissionBoundary({ code, children }: { code: string; children: ReactNode }) {
  const router = useRouter()
  const allowed = useAppSelector((state) => state.auth.user?.permissions.includes(code) ?? false)

  useEffect(() => {
    if (!allowed) router.replace('/dashboard')
  }, [allowed, router])

  return allowed ? children : null
}
