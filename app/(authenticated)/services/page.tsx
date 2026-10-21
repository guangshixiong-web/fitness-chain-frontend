/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import ManagementPage from '@/views/management'

export const metadata: Metadata = { title: '服务管理', description: '悦动健身连锁服务管理' }

export default function ServicesPage() {
  return (
    <PermissionBoundary code="service:view">
      <ManagementPage kind="services" />
    </PermissionBoundary>
  )
}
