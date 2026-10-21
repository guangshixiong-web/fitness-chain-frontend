/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import ManagementPage from '@/views/management'

export const metadata: Metadata = { title: '门店管理', description: '悦动健身连锁门店管理' }

export default function StoresPage() {
  return (
    <PermissionBoundary code="store:view">
      <ManagementPage kind="stores" />
    </PermissionBoundary>
  )
}
