/* oxlint-disable react/only-export-components -- Next.js pages colocate metadata with the component. */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  CircleHelp,
  Dumbbell,
  FileUp,
  Gauge,
  Keyboard,
  ShieldCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '帮助中心',
  description: '悦动健身连锁数据中控台功能与快捷键帮助',
}

const features = [
  { icon: Gauge, title: '经营分析', description: '在经营总览中查看营业额、订单、客单价、门店与服务排行，并按日期、区域和门店筛选。' },
  { icon: Building2, title: '业务数据', description: '维护区域、门店、服务分类和服务资料；订单中心支持按业务条件查询订单。' },
  { icon: Dumbbell, title: '健身业务', description: '管理会员卡办理与状态、私教预约排课、器械巡检记录。' },
  { icon: FileUp, title: '数据接入', description: '通过 CSV 导入业务数据，并在导入记录中追踪处理结果和失败原因。' },
  { icon: ShieldCheck, title: '系统管理', description: '管理员可维护用户、角色权限和数据范围，并通过操作日志审计关键行为。' },
]

export default function HelpPage() {
  return (
    <main className="fitness-grid min-h-screen bg-[#f2f5f2] px-5 py-12 text-stone-900 sm:px-8 dark:bg-stone-950 dark:text-stone-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-brand-gradient hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-emerald-600/25 sm:flex">
              <CircleHelp size={26} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">悦动健身 · 公开帮助</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">帮助中心</h1>
              <p className="mt-3 max-w-2xl text-stone-500">
                快速了解数据中控台的主要能力、常用操作和键盘快捷键。
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-brand-gradient hidden shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 sm:inline-block"
          >
            进入中控台
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="card-hover rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <feature.icon size={20} />
                </span>
                <h2 className="text-lg font-semibold">{feature.title}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-500">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-lg font-semibold">快捷键与使用提示</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
              <p className="flex items-center gap-2 font-medium">
                <Keyboard size={16} className="text-emerald-600 dark:text-emerald-400" /> 快捷搜索
              </p>
              <kbd className="mt-3 inline-block rounded border border-stone-300 bg-white px-2 py-1 text-xs dark:border-stone-600 dark:bg-stone-900">
                Ctrl / ⌘ + K
              </kbd>
              <p className="mt-3 text-sm text-stone-500">
                在已登录页面打开快捷搜索，可按当前权限跳转业务菜单，也可访问帮助与状态页。
              </p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
              <p className="font-medium">筛选与权限</p>
              <p className="mt-2 text-sm text-stone-500">
                页面结果受账号的数据范围约束。筛选条件变化后会自动刷新；如无菜单，请联系管理员检查角色权限。
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between text-sm">
          <Link href="/status" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            查看系统状态 →
          </Link>
          <Link
            href="/login"
            className="bg-brand-gradient rounded-xl px-4 py-2 font-semibold text-white shadow-md shadow-emerald-600/20 sm:hidden"
          >
            进入中控台
          </Link>
        </div>
      </div>
    </main>
  )
}
