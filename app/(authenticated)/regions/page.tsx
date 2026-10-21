/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import ManagementPage from '@/views/management'

export const metadata: Metadata = { title: '区域管理', description: '悦动健身连锁区域管理' }

export default function RegionsPage() {
  return (
    <PermissionBoundary code="region:view">
      <ManagementPage kind="regions" />
    </PermissionBoundary>
  )
}
