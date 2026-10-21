/* oxlint-disable react/only-export-components -- Next.js pages colocate route config and metadata. */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity } from 'lucide-react'
import { serverApiFetch } from '@/lib/api-server'

export const revalidate = 60

export const metadata: Metadata = {
  title: '系统状态',
  description: '悦动健身连锁数据中控台服务健康状态',
}

type Health = {
  status?: string
  database?: string
  timestamp?: string
  uptime?: number
}

export default async function StatusPage() {
  const generatedAt = new Date()
  let health: Health | null = null
  let unavailableReason = ''

  try {
    health = await serverApiFetch<Health>('/health', { next: { revalidate: 60 } })
  } catch (error) {
    unavailableReason = error instanceof Error ? error.message : '健康检查暂时不可用'
  }

  const healthy = health?.status === 'ok' || health?.status === 'healthy'
  return (
    <main className="fitness-grid grid min-h-screen place-items-center bg-[#f2f5f2] px-5 py-12 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-10">
        <div className="flex items-center gap-3">
          <span className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-emerald-600/25">
            <Activity size={20} />
          </span>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">悦动健身 · 服务状态</p>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">系统状态</h1>
            <p className="mt-2 text-stone-500">来自前端 Mock API 的公开健康检查。</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${healthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}
          >
            {healthy ? '运行正常' : '状态未知'}
          </span>
        </div>

        {health ? (
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <StatusItem label="API 状态" value={health.status ?? '已响应'} />
            <StatusItem label="数据源" value={health.database ?? '未提供详情'} />
            <StatusItem
              label="服务运行时长"
              value={
                typeof health.uptime === 'number' ? `${Math.floor(health.uptime)} 秒` : '未提供详情'
              }
            />
            <StatusItem
              label="服务时间"
              value={
                health.timestamp ? new Date(health.timestamp).toLocaleString('zh-CN') : '未提供详情'
              }
            />
          </dl>
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-semibold">暂时无法确认服务状态</p>
            <p className="mt-1 text-sm opacity-80">
              {unavailableReason}。这不影响状态页构建，服务恢复后缓存更新会重新检查。
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-stone-200 pt-5 text-xs leading-5 text-stone-500 dark:border-stone-800">
          <p>本页采用 ISR，最多每 60 秒重新验证一次健康检查结果。</p>
          <p>
            本次页面生成时间：{generatedAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
          </p>
        </div>
        <div className="mt-6 flex gap-4 text-sm font-semibold text-emerald-700">
          <Link href="/help" className="hover:underline">
            帮助中心
          </Link>
          <Link href="/login" className="hover:underline">
            进入中控台
          </Link>
        </div>
      </div>
    </main>
  )
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  )
}
