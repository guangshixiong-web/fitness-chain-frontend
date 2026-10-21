/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import ImportsView from '@/views/imports'

export const metadata: Metadata = { title: '数据导入', description: '悦动健身连锁CSV数据导入' }

export default function DataImportsPage() {
  return (
    <PermissionBoundary code="data-import:create">
      <ImportsView />
    </PermissionBoundary>
  )
}
