/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { Provider } from '@/components/provider'
import LoginView from '@/views/login'

export const metadata: Metadata = {
  title: '登录',
  description: '登录悦动健身连锁数据中控台',
}

export default function LoginPage() {
  return (
    <Provider>
      <LoginView />
    </Provider>
  )
}
