'use client'

import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Download,
  MapPinned,
  Package,
  PieChart as PieChartIcon,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { useAppSelector } from '@/store/store'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApi } from '@/hooks/use-api'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Select,
  useToast,
} from '@/components/ui'

type Overview = {
  revenue: number
  orderCount: number
  averageOrderValue: number
  activeStores: number
  serviceSales: number
  activeCards: number
  growthRate: number
}
type Charts = {
  trend: { date: string; revenue: number; orders: number }[]
  storeRanking: { name: string; value: number }[]
  productRanking: { name: string; value: number }[]
  categoryShare: { name: string; value: number }[]
  hourly: { name: string; value: number }[]
}

const COLORS = ['#059669', '#0d9488', '#0284c7', '#7c3aed', '#db2777', '#ea580c', '#65a30d', '#dc2626']

const DASHBOARD_BANNER =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent(
    'Wide cinematic photo of a modern fitness club, athletic people training with kettlebells dumbbells and treadmills, energetic motion blur, dark interior with emerald green lighting accents, professional commercial photography, high contrast',
  ) +
  '&image_size=landscape_16_9'

function greetingOf(hour: number) {
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export default function DashboardView({
  initialOverview,
  initialCharts,
}: {
  initialOverview: Overview | null
  initialCharts: Charts | null
}) {
  const [params, setParams] = useState({ startDate: '', endDate: '', regionId: '', storeId: '' })
  const { toast } = useToast()
  const user = useAppSelector((s) => s.auth.user)
  const now = new Date()
  const greeting = greetingOf(now.getHours())
  const todayText = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString()
  const suffix = queryString ? `?${queryString}` : ''

  const { data: overview, loading: ovLoading, error: ovError, reload: reloadOv } = useApi<Overview>(
    `/metrics/overview${suffix}`,
    initialOverview,
  )
  const { data: charts, loading: chLoading, error: chError, reload: reloadCh } = useApi<Charts>(
    `/metrics/charts${suffix}`,
    initialCharts,
  )

  const { data: regions } = useApi<{ id: string; name: string }[]>('/regions')
  const { data: storesData } = useApi<{ items: { id: string; name: string }[] }>('/stores?pageSize=100')
  const stores = storesData?.items || []

  const exportCsv = () => {
    if (!charts) return
    const rows = charts.trend.map((t) => `${t.date},${t.revenue},${t.orders}`)
    const csv = 'date,revenue,orders\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: '导出成功', description: '趋势数据已导出为 CSV', variant: 'success' })
  }

  if (ovError || chError) {
    return (
      <div>
        <PageHeader title="经营总览" description="查看连锁门店经营数据" />
        <ErrorState message={ovError || chError} retry={() => { void reloadOv(); void reloadCh() }} />
      </div>
    )
  }

  const loading = ovLoading || chLoading

  return (
    <div>
      <PageHeader
        title="经营总览"
        description="实时掌握连锁门店经营动态"
        action={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!charts}>
            <Download size={16} /> 导出趋势
          </Button>
        }
      />

      <section className="relative mb-6 overflow-hidden rounded-3xl bg-stone-950 text-white animate-fade-up">
        <img
          src={DASHBOARD_BANNER}
          alt="悦动健身连锁俱乐部"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/70 to-teal-900/30" />
        <div className="fitness-stripes absolute inset-0" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              {greeting}，{user?.name ?? '教练'}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              今天也是全力以“练”的一天
            </h2>
            <p className="mt-2 text-sm text-white/70">{todayText} · 连锁门店经营数据实时更新中</p>
          </div>
          {overview && (
            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/65">当前营业额</p>
                <p className="tnum mt-1 text-2xl font-bold">¥{overview.revenue.toLocaleString('zh-CN')}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/65">环比增长</p>
                <p
                  className={`tnum mt-1 flex items-center gap-1 text-2xl font-bold ${
                    overview.growthRate >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {overview.growthRate >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  {Math.abs(overview.growthRate)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Card className="mb-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input type="date" value={params.startDate} onChange={(e) => setParams((p) => ({ ...p, startDate: e.target.value }))} />
          <Input type="date" value={params.endDate} onChange={(e) => setParams((p) => ({ ...p, endDate: e.target.value }))} />
          <Select value={params.regionId} onChange={(e) => setParams((p) => ({ ...p, regionId: e.target.value, storeId: '' }))}>
            <option value="">全部区域</option>
            {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <Select value={params.storeId} onChange={(e) => setParams((p) => ({ ...p, storeId: e.target.value }))}>
            <option value="">全部门店</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Button className="bg-brand-gradient shadow-md shadow-emerald-600/20" onClick={() => { void reloadOv(); void reloadCh() }} disabled={loading}>
            {loading ? '加载中…' : '查询'}
          </Button>
        </div>
      </Card>

      {loading && !overview ? (
        <LoadingState />
      ) : overview ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="营业额" value={overview.revenue} prefix="¥" trend={overview.growthRate} icon={TrendingUp} tone="emerald" />
            <StatCard title="订单量" value={overview.orderCount} icon={ShoppingCart} tone="sky" />
            <StatCard title="客单价" value={overview.averageOrderValue} prefix="¥" icon={ArrowUpRight} tone="violet" />
            <StatCard title="活跃门店" value={overview.activeStores} icon={MapPinned} tone="amber" />
            <StatCard title="服务销量" value={overview.serviceSales} icon={Package} tone="rose" />
            <StatCard title="活跃会员" value={overview.activeCards} icon={CreditCard} tone="fuchsia" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="card-hover p-5">
              <ChartTitle icon={TrendingUp} title="营收趋势" tone="emerald" />
              {charts?.trend.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={charts.trend}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip contentStyle={{ borderRadius: 12, border: '1px solid #d7ebe0' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#revenueFill)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState text="暂无趋势数据" />}
            </Card>

            <Card className="card-hover p-5">
              <ChartTitle icon={ShoppingCart} title="订单趋势" tone="sky" />
              {charts?.trend.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={charts.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip contentStyle={{ borderRadius: 12, border: '1px solid #dbeafe' }} />
                    <Line type="monotone" dataKey="orders" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyState text="暂无订单数据" />}
            </Card>

            <Card className="card-hover p-5">
              <ChartTitle icon={MapPinned} title="门店排行" tone="amber" />
              {charts?.storeRanking.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={charts.storeRanking} layout="vertical">
                    <defs>
                      <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
                    <ChartTooltip contentStyle={{ borderRadius: 12, border: '1px solid #d7ebe0' }} />
                    <Bar dataKey="value" fill="url(#barFill)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState text="暂无门店数据" />}
            </Card>

            <Card className="card-hover p-5">
              <ChartTitle icon={PieChartIcon} title="服务分类占比" tone="violet" />
              {charts?.categoryShare.length ? (
                <>
                  <ResponsiveContainer width="100%" height={224}>
                    <PieChart>
                      <Pie data={charts.categoryShare} cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={4} dataKey="value">
                        {charts.categoryShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <ChartTooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {charts.categoryShare.map((item, i) => (
                      <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {item.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : <EmptyState text="暂无分类数据" />}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

const toneMap = {
  emerald: 'from-emerald-400 to-teal-600 shadow-emerald-500/30',
  sky: 'from-sky-400 to-blue-600 shadow-sky-500/30',
  violet: 'from-violet-400 to-purple-600 shadow-violet-500/30',
  amber: 'from-amber-400 to-orange-500 shadow-amber-500/30',
  rose: 'from-rose-400 to-red-600 shadow-rose-500/30',
  fuchsia: 'from-fuchsia-400 to-pink-600 shadow-fuchsia-500/30',
} as const

type Tone = keyof typeof toneMap

function ChartTitle({ icon: Icon, title, tone }: { icon: React.ElementType; title: string; tone: Tone }) {
  const iconTone = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400',
  }[tone]
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconTone}`}>
        <Icon size={17} />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  )
}

function StatCard({
  title,
  value,
  prefix = '',
  trend,
  icon: Icon,
  tone,
}: {
  title: string
  value: number
  prefix?: string
  trend?: number
  icon: React.ElementType
  tone: Tone
}) {
  const isPositive = trend !== undefined && trend >= 0
  return (
    <Card className="card-hover group p-4">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${toneMap[tone]}`}
        >
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <Badge tone={isPositive ? 'emerald' : 'red'}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">{title}</p>
      <p className="tnum mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString('zh-CN') : value}
      </p>
    </Card>
  )
}
