import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/app-shell'
import { Provider } from '@/components/provider'
import { loadAuthenticatedUser } from '@/lib/api-server'

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await loadAuthenticatedUser()
  if (!user) redirect('/login')

  return (
    <Provider user={user}>
      <AppShell>{children}</AppShell>
    </Provider>
  )
}
