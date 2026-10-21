/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import { PermissionBoundary } from '@/components/permission-boundary'
import DashboardView from '@/views/dashboard'
import { serverApiFetch } from '@/lib/api-server'

export const metadata: Metadata = { title: '经营总览', description: '悦动健身连锁经营总览' }

type Overview = { revenue: number; orderCount: number; averageOrderValue: number; activeStores: number; serviceSales: number; activeCards: number; growthRate: number }
type Charts = { trend: { date: string; revenue: number; orders: number }[]; storeRanking: { name: string; value: number }[]; productRanking: { name: string; value: number }[]; categoryShare: { name: string; value: number }[]; hourly: { name: string; value: number }[] }

export default async function DashboardPage() {
  const [overviewResult, chartsResult] = await Promise.allSettled([
    serverApiFetch<Overview>('/metrics/overview'),
    serverApiFetch<Charts>('/metrics/charts'),
  ])
  return (
    <PermissionBoundary code="dashboard:view">
      <DashboardView
        initialOverview={overviewResult.status === 'fulfilled' ? overviewResult.value : null}
        initialCharts={chartsResult.status === 'fulfilled' ? chartsResult.value : null}
      />
    </PermissionBoundary>
  )
}
