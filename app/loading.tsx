import { Dumbbell } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fitness-grid flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f2f5f2] dark:bg-stone-950">
      <div className="bg-brand-gradient animate-breathe flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl shadow-emerald-600/25">
        <Dumbbell size={30} />
      </div>
      <p className="text-sm font-medium text-stone-500">悦动健身中控台加载中…</p>
    </div>
  )
}
