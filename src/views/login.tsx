'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  CreditCard,
  Dumbbell,
  Eye,
  EyeOff,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import { api, errorMessage } from '@/lib/api'
import { loadMe, useAppDispatch } from '@/store/store'
import { Button, Card, Input, useToast } from '@/components/ui'

const LOGIN_HERO =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent(
    'Photorealistic modern premium fitness gym interior, neat rows of chrome dumbbells on rack in foreground, dark moody ambiance, emerald green cinematic accent lighting, subtle mirror reflections, athletes strength training blurred in background, high-end sports club, professional commercial photography',
  ) +
  '&image_size=portrait_16_9'

const highlights = [
  { icon: Activity, title: '实时经营洞察', desc: '营收订单一目了然' },
  { icon: CreditCard, title: '会员精细运营', desc: '卡项预约轻松管理' },
  { icon: ScanSearch, title: '器械安全巡检', desc: '设备状态全程追踪' },
]

export default function LoginView() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('YueDong@123456')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await api.post('/auth/login', { username, password })
      await dispatch(loadMe())
      toast({ title: '登录成功', description: '欢迎回来，今天也要全力以练', variant: 'success' })
      router.replace('/dashboard')
      router.refresh()
    } catch (err) {
      toast({ title: '登录失败', description: errorMessage(err), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-[#f2f5f2] dark:bg-stone-950">
      {/* 左侧品牌展示区 */}
      <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-stone-950 p-10 text-white lg:flex xl:w-1/2 xl:p-14">
        <img
          src={LOGIN_HERO}
          alt="现代化健身房"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-stone-950/78 to-teal-950/88" />
        <div className="fitness-stripes absolute inset-0" />

        <div className="relative flex items-center gap-3 animate-fade-up">
          <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-emerald-950/50">
            <Dumbbell size={22} />
          </div>
          <div>
            <p className="text-base font-bold tracking-wide">悦动健身</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">YueDong Fitness</p>
          </div>
        </div>

        <div className="relative animate-fade-up-delay">
          <ShieldCheck size={26} className="text-emerald-400" />
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.25] tracking-tight xl:text-[2.75rem]">
            每一次坚持，
            <br />
            都在塑造<span className="text-emerald-400">更好的自己</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
            连锁数据中控台，让门店经营像训练一样有迹可循 —— 实时掌握营收、会员与器械动态。
          </p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"
              >
                <item.icon size={20} className="text-emerald-400" />
                <p className="mt-2.5 text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-white/55">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">© 2026 悦动健身连锁 · 星火科技提供技术支持</p>
      </section>

      {/* 右侧登录表单 */}
      <section className="fitness-grid relative flex flex-1 items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md p-8 animate-fade-up">
          <div className="mb-8 text-center">
            <div className="bg-brand-gradient mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-emerald-600/25">
              <Dumbbell size={28} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">悦动健身</h1>
            <p className="mt-1 text-sm text-stone-500">连锁数据中控台</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                用户名
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                密码
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-emerald-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="bg-brand-gradient h-12 w-full shadow-lg shadow-emerald-600/25 hover:shadow-emerald-700/35"
              size="lg"
              disabled={loading}
            >
              {loading ? '登录中…' : '登 录'}
            </Button>
          </form>
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs leading-6 text-stone-500 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">演示账号</p>
            <p>admin / YueDong@123456（超级管理员）</p>
            <p>east.manager / YueDong@123456（区域经理）</p>
            <p>store.manager / YueDong@123456（门店店长）</p>
          </div>
        </Card>
      </section>
    </main>
  )
}
