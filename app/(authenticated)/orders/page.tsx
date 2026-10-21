/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import OrdersView from '@/views/orders'

export const metadata: Metadata = { title: '订单中心', description: '悦动健身连锁订单管理' }

export default function OrdersPage() {
  return (
    <PermissionBoundary code="order:view">
      <OrdersView />
    </PermissionBoundary>
  )
}
