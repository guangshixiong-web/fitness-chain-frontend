/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import ProfileView from '@/views/profile'

export const metadata: Metadata = { title: '个人资料', description: '悦动健身连锁个人资料' }

export default function ProfilePage() {
  return <ProfileView />
}
