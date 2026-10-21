/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import MemberCardsView from '@/views/member-cards'

export const metadata: Metadata = { title: '会员卡管理', description: '悦动健身连锁会员卡管理' }

export default function MemberCardsPage() {
  return (
    <PermissionBoundary code="member-card:view">
      <MemberCardsView />
    </PermissionBoundary>
  )
}
