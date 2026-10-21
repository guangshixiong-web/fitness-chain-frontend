/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import TrainerBookingsView from '@/views/trainer-bookings'

export const metadata: Metadata = { title: '私教预约', description: '悦动健身连锁私教预约管理' }

export default function TrainerBookingsPage() {
  return (
    <PermissionBoundary code="trainer-booking:view">
      <TrainerBookingsView />
    </PermissionBoundary>
  )
}
