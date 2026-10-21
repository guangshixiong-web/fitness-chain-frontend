/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import { UsersView } from '@/views/system'

export const metadata: Metadata = { title: '用户管理', description: '悦动健身连锁用户管理' }

export default function UsersPage() {
  return (
    <PermissionBoundary code="user:view">
      <UsersView />
    </PermissionBoundary>
  )
}
