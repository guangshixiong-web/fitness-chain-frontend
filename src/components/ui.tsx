'use client'

/* oxlint-disable react/only-export-components -- 教学项目将小型样式工具与基础组件集中展示。 */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronLeft, ChevronRight, X, LoaderCircle, Inbox, TriangleAlert } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm dark:bg-emerald-700 dark:hover:bg-emerald-800',
        secondary:
          'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-[#1a211d] dark:text-stone-200 dark:hover:bg-[#202924]',
        outline:
          'border border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700/80 dark:bg-[#151a17] dark:hover:bg-[#1b211e]',
        ghost: 'hover:bg-stone-100 dark:hover:bg-[#1b211e]',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: { default: 'h-10 px-4', sm: 'h-8 px-3 text-xs', lg: 'h-12 px-6' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)
export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-stone-200/80 bg-white shadow-[0_4px_20px_rgba(35,68,53,.05)] dark:border-[#222a25] dark:bg-[#131916] dark:shadow-black/40',
        className,
      )}
      {...props}
    />
  )
}
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-[#2a332d] dark:bg-[#0f1512] dark:text-stone-300 dark:placeholder:text-stone-500',
        className,
      )}
      {...props}
    />
  )
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-[#2a332d] dark:bg-[#0f1512] dark:text-stone-300',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'green' | 'red' | 'amber' | 'blue' | 'neutral' | 'emerald'
}) {
  const tones = {
    green:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950 dark:text-emerald-300',
    emerald:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950 dark:text-emerald-300',
    red: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-950 dark:text-red-300',
    amber: 'bg-amber-50 text-amber-800 ring-amber-600/15 dark:bg-amber-950 dark:text-amber-300',
    blue: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-950 dark:text-sky-300',
    neutral: 'bg-stone-100 text-stone-600 ring-stone-500/10 dark:bg-stone-800 dark:text-stone-300',
  }
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  )
}
export const Th = ({ children }: { children: ReactNode }) => (
  <th className="whitespace-nowrap bg-stone-50 px-4 py-3 font-semibold text-stone-600 dark:bg-[#121815] dark:text-stone-300">
    {children}
  </th>
)
export const Td = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('border-t border-stone-100 px-4 py-3 dark:border-[#202823]', className)}>
    {children}
  </td>
)
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131916]">
          <div className="mb-5">
            <DialogPrimitive.Title className="text-xl font-semibold text-stone-900 dark:text-stone-200">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          {children}
          <DialogPrimitive.Close
            aria-label="关闭"
            className="absolute right-4 top-4 rounded-md p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1b211e]"
          >
            <X size={18} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-200">
          {title}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action}
    </div>
  )
}
export function LoadingState() {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-stone-500">
      <LoaderCircle className="animate-spin" size={20} />
      正在加载数据…
    </div>
  )
}
export function EmptyState({ text = '暂无数据' }: { text?: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center text-stone-400">
      <Inbox size={34} />
      <p className="mt-2 text-sm">{text}</p>
    </div>
  )
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center text-red-600">
      <TriangleAlert size={32} />
      <p className="mt-2 text-sm">{message}</p>
      {retry && (
        <Button className="mt-3" variant="outline" size="sm" onClick={retry}>
          重新加载
        </Button>
      )}
    </div>
  )
}

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger
export function DropdownMenuContent({
  children,
  className,
  align = 'end',
}: {
  children: ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={8}
        className={cn(
          'z-50 min-w-48 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-[#2a332d] dark:bg-[#131916]',
          className,
        )}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  )
}
export function DropdownMenuItem({
  children,
  onSelect,
  className,
}: {
  children: ReactNode
  onSelect?: () => void
  className?: string
}) {
  return (
    <DropdownPrimitive.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none focus:bg-stone-100 dark:focus:bg-[#1b211e]',
        className,
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  )
}
export const DropdownMenuSeparator = () => (
  <DropdownPrimitive.Separator className="my-1 h-px bg-stone-200 dark:bg-[#2a332d]" />
)

export const Tabs = TabsPrimitive.Root
export function TabsList({ children }: { children: ReactNode }) {
  return (
    <TabsPrimitive.List className="inline-flex rounded-xl bg-stone-100 p-1 dark:bg-[#121815]">
      {children}
    </TabsPrimitive.List>
  )
}
export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className="rounded-lg px-4 py-2 text-sm text-stone-500 outline-none data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm dark:text-stone-400 dark:data-[state=active]:bg-[#1c241f] dark:data-[state=active]:text-stone-100"
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}
export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  return (
    <TabsPrimitive.Content value={value} className={cn('mt-5 outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  )
}

export function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-[70] max-w-64 rounded-lg bg-stone-900 px-3 py-2 text-xs text-white shadow-xl dark:bg-[#1c241f] dark:text-stone-200"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-stone-900 dark:fill-[#1c241f]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
export function Popover({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          className="z-50 w-72 rounded-xl border border-stone-200 bg-white p-4 text-sm shadow-xl dark:border-[#2a332d] dark:bg-[#131916]"
        >
          {children}
          <PopoverPrimitive.Arrow className="fill-white dark:fill-[#131916]" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/45" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-[#131916]">
          <DialogPrimitive.Title className="text-xl font-semibold">{title}</DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-1 text-sm text-stone-500">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-6">{children}</div>
          <DialogPrimitive.Close
            aria-label="关闭"
            className="absolute right-4 top-4 rounded p-1 hover:bg-stone-100 dark:hover:bg-[#1b211e]"
          >
            <X size={18} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="正在加载"
      className={cn('animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800', className)}
    />
  )
}
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  return (
    <nav aria-label="分页" className="mt-4 flex items-center justify-between gap-3 text-sm">
      <span className="text-stone-500">
        共 {total} 条，第 {page}/{pages} 页
      </span>
      <div className="flex gap-2">
        <Button
          aria-label="上一页"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={15} />
        </Button>
        <Button
          aria-label="下一页"
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={15} />
        </Button>
      </div>
    </nav>
  )
}

type ToastData = { id: number; title: string; description?: string; variant?: 'success' | 'error' }
const ToastContext = createContext<{ toast: (data: Omit<ToastData, 'id'>) => void } | null>(null)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastData[]>([])
  const toast = useCallback(
    (data: Omit<ToastData, 'id'>) => setItems((x) => [...x, { ...data, id: Date.now() }]),
    [],
  )
  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            duration={3500}
            onOpenChange={(open) => {
              if (!open) setItems((x) => x.filter((i) => i.id !== item.id))
            }}
            className={cn(
              'rounded-xl border bg-white p-4 shadow-xl dark:bg-stone-900',
              item.variant === 'error' ? 'border-red-300' : 'border-emerald-300',
            )}
          >
            <ToastPrimitive.Title className="font-medium">{item.title}</ToastPrimitive.Title>
            {item.description && (
              <ToastPrimitive.Description className="mt-1 text-sm text-stone-500">
                {item.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within ToastProvider')
  return value
}
