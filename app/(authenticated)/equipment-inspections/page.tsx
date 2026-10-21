/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import EquipmentInspectionsView from '@/views/equipment-inspections'

export const metadata: Metadata = { title: '器械巡检', description: '悦动健身连锁器械巡检管理' }

export default function EquipmentInspectionsPage() {
  return (
    <PermissionBoundary code="equipment:view">
      <EquipmentInspectionsView />
    </PermissionBoundary>
  )
}
