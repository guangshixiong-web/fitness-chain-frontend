'use client'

import { Dumbbell, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body className="fitness-grid flex min-h-screen items-center justify-center bg-[#f2f5f2] p-4">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl shadow-stone-900/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-lg shadow-rose-500/30">
            <TriangleAlert size={30} />
          </div>
          <h1 className="mt-5 text-xl font-bold text-stone-800">训练计划暂时中断</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            系统出现异常，就像训练中需要短暂调整呼吸。请重新加载，继续你的经营复盘。
          </p>
          <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-400">{error.message}</p>
          <Button className="bg-brand-gradient mt-6 w-full shadow-lg shadow-emerald-600/25" onClick={reset}>
            <Dumbbell size={16} /> 重新加载
          </Button>
        </div>
      </body>
    </html>
  )
}
