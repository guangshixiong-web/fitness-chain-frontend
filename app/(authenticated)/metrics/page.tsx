/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import MetricsView from '@/views/metrics'

export const metadata: Metadata = { title: '指标管理', description: '悦动健身连锁指标管理' }

export default function MetricsPage() {
  return (
    <PermissionBoundary code="metric:view">
      <MetricsView />
    </PermissionBoundary>
  )
}
