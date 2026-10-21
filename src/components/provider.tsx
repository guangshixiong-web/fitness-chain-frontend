'use client'

import { useRef, type ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import { makeStore, type AppStore, type AuthUser } from '@/store/store'
import { ToastProvider } from '@/components/ui'

export function Provider({
  children,
  user = null,
}: {
  children: ReactNode
  user?: AuthUser | null
}) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) storeRef.current = makeStore(user)
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ReduxProvider store={storeRef.current}>
        <ToastProvider>{children}</ToastProvider>
      </ReduxProvider>
    </ThemeProvider>
  )
}
