/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import { RolesView } from '@/views/system'

export const metadata: Metadata = { title: '角色权限', description: '悦动健身连锁角色权限管理' }

export default function RolesPage() {
  return (
    <PermissionBoundary code="role:view">
      <RolesView />
    </PermissionBoundary>
  )
}
