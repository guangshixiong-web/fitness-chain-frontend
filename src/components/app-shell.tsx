'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Activity,
  BarChart3,
  Boxes,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileClock,
  FileUp,
  Flame,
  Gauge,
  LogOut,
  MapPinned,
  Menu,
  Monitor,
  Moon,
  Package,
  ScanSearch,
  ScrollText,
  Search,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { api } from '@/lib/api'
import { clearAuth, useAppDispatch, useAppSelector } from '@/store/store'
import {
  cn,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from '@/components/ui'

const groups = [
  {
    title: '经营分析',
    items: [
      { label: '经营总览', path: '/dashboard', icon: Gauge, permission: 'dashboard:view' },
      { label: '指标管理', path: '/metrics', icon: BarChart3, permission: 'metric:view' },
    ],
  },
  {
    title: '业务数据',
    items: [
      { label: '区域管理', path: '/regions', icon: MapPinned, permission: 'region:view' },
      { label: '门店管理', path: '/stores', icon: Building2, permission: 'store:view' },
      {
        label: '服务分类',
        path: '/service-categories',
        icon: Boxes,
        permission: 'service-category:view',
      },
      { label: '服务管理', path: '/services', icon: Package, permission: 'service:view' },
      { label: '订单中心', path: '/orders', icon: ClipboardList, permission: 'order:view' },
    ],
  },
  {
    title: '健身业务',
    items: [
      { label: '会员卡管理', path: '/member-cards', icon: CreditCard, permission: 'member-card:view' },
      { label: '私教预约', path: '/trainer-bookings', icon: CalendarCheck, permission: 'trainer-booking:view' },
      { label: '器械巡检', path: '/equipment-inspections', icon: ScanSearch, permission: 'equipment:view' },
    ],
  },
  {
    title: '数据接入',
    items: [
      {
        label: 'CSV数据导入',
        path: '/data-imports',
        icon: FileUp,
        permission: 'data-import:create',
      },
      {
        label: '导入记录',
        path: '/data-imports/history',
        icon: FileClock,
        permission: 'data-import:view',
      },
    ],
  },
  {
    title: '系统管理',
    items: [
      { label: '用户管理', path: '/system/users', icon: UsersRound, permission: 'user:view' },
      { label: '角色权限', path: '/system/roles', icon: ShieldCheck, permission: 'role:view' },
      { label: '操作日志', path: '/system/logs', icon: ScrollText, permission: 'log:view' },
    ],
  },
]
const auxiliaryItems = [
  { label: '帮助中心', path: '/help', icon: CircleHelp },
  { label: '系统状态', path: '/status', icon: Activity },
]

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const user = useAppSelector((state) => state.auth.user)!
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()
  const allowedItems = [
    ...groups
      .flatMap((group) => group.items)
      .filter((item) => user.permissions.includes(item.permission)),
    ...auxiliaryItems,
  ]
  const matchedItems = allowedItems.filter((item) =>
    item.label.toLowerCase().includes(keyword.toLowerCase()),
  )
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      dispatch(clearAuth())
      router.replace('/login')
      router.refresh()
    }
  }

  const navigate = (path: string) => {
    setSearchOpen(false)
    setKeyword('')
    router.push(path)
  }
  return (
    <div className="fitness-grid flex min-h-screen bg-[#f2f5f2] dark:bg-[#0e1412]">
      {sidebarOpen && (
        <button
          aria-label="关闭导航遮罩"
          className="fixed inset-0 z-30 bg-stone-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200/70 bg-white/90 backdrop-blur transition-transform lg:static lg:translate-x-0 dark:border-[#222a25] dark:bg-[#0f1512]/95',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-5 dark:border-[#222a25]">
          <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-emerald-600/25">
            <Dumbbell size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-200">悦动健身</p>
            <p className="text-xs text-stone-400">连锁数据中控台</p>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          {groups.map((group) => {
            const visible = group.items.filter((item) => user.permissions.includes(item.permission))
            if (!visible.length) return null
            return (
              <div key={group.title}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {visible.map((item) => {
                    const active = pathname.startsWith(item.path)
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                          active
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50/40 text-emerald-700 dark:from-emerald-950/60 dark:to-teal-950/20 dark:text-emerald-400'
                            : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-[#151b18]',
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-600" />
                        )}
                        <item.icon size={18} className={active ? 'text-emerald-600 dark:text-emerald-500' : ''} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
        <div className="mx-4 mb-3 overflow-hidden rounded-2xl bg-brand-gradient-dark p-4 text-white relative">
          <div className="fitness-stripes absolute inset-0" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Flame size={18} className="text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-semibold">今天也要全力以“练”</p>
              <p className="mt-0.5 text-xs leading-5 text-white/60">坚持复盘经营数据，比昨天的自己更强一点。</p>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-100 p-4 dark:border-[#222a25]">
          {auxiliaryItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-[#151b18]"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-stone-200/70 bg-white/80 px-4 backdrop-blur dark:border-[#222a25] dark:bg-[#0f1512]/80">
          <button
            aria-label="打开导航"
            className="rounded-lg p-2 hover:bg-stone-100 lg:hidden dark:hover:bg-[#151b18]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <button
            className="flex flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-left text-sm text-stone-400 transition hover:border-stone-300 dark:border-[#2a332d] dark:bg-[#121815] dark:hover:border-[#354137]"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            搜索页面…
            <kbd className="ml-auto hidden rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-400 sm:inline dark:border-[#2a332d] dark:bg-[#0e1412]">
              Ctrl K
            </kbd>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-stone-100 dark:hover:bg-[#151b18]">
                <div className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md shadow-emerald-600/20">
                  <UserRound size={18} />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{user.name}</p>
                  <p className="text-xs text-stone-400">{user.roles[0]?.name || '用户'}</p>
                </div>
                <ChevronDown size={15} className="text-stone-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push('/profile')}>
                <UserRound size={16} /> 个人资料
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setTheme('light')}>
                <Sun size={16} /> 浅色模式
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme('dark')}>
                <Moon size={16} /> 深色模式
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme('system')}>
                <Monitor size={16} /> 跟随系统
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onSelect={() => void logout()}>
                <LogOut size={16} /> 退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen} title="搜索页面" description="输入名称快速跳转">
        <Input autoFocus placeholder="例如：会员卡" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
          {matchedItems.map((item) => (
            <button
              key={item.path}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => navigate(item.path)}
            >
              <item.icon size={17} className="text-emerald-600" />
              {item.label}
              <ChevronRight size={14} className="ml-auto text-stone-300" />
            </button>
          ))}
          {!matchedItems.length && <p className="py-6 text-center text-sm text-stone-400">没有匹配的页面</p>}
        </div>
      </Dialog>
    </div>
  )
}
