import Link from 'next/link'
import { Dumbbell, House } from 'lucide-react'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="fitness-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f2f5f2] p-4 text-center dark:bg-stone-950">
      <div className="bg-brand-gradient animate-float flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl shadow-emerald-600/25">
        <Dumbbell size={38} />
      </div>
      <h1 className="text-brand-gradient mt-6 text-7xl font-extrabold tracking-tight">404</h1>
      <p className="mt-3 text-lg font-bold text-stone-800 dark:text-stone-100">这个页面跑去加练了</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-stone-500">
        你访问的页面不存在，可能已被移动。回到中控台，继续掌控每一家门店的经营数据。
      </p>
      <Button asChild className="bg-brand-gradient mt-6 shadow-lg shadow-emerald-600/25">
        <Link href="/dashboard">
          <House size={16} /> 返回首页
        </Link>
      </Button>
    </main>
  )
}
