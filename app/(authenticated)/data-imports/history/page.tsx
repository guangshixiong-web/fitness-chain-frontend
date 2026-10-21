/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import ImportsView from '@/views/imports'

export const metadata: Metadata = { title: '导入记录', description: '悦动健身连锁导入记录' }

export default function ImportHistoryPage() {
  return (
    <PermissionBoundary code="data-import:view">
      <ImportsView />
    </PermissionBoundary>
  )
}
