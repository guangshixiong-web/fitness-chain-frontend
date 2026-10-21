/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import { LogsView } from '@/views/system'

export const metadata: Metadata = { title: '操作日志', description: '悦动健身连锁操作日志' }

export default function LogsPage() {
  return (
    <PermissionBoundary code="log:view">
      <LogsView />
    </PermissionBoundary>
  )
}
