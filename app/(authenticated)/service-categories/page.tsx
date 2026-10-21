/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import ManagementPage from '@/views/management'

export const metadata: Metadata = { title: '服务分类', description: '悦动健身连锁服务分类管理' }

export default function ServiceCategoriesPage() {
  return (
    <PermissionBoundary code="service-category:view">
      <ManagementPage kind="service-categories" />
    </PermissionBoundary>
  )
}
