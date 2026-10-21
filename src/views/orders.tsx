'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { api, errorMessage, type PageResult } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Pagination,
  Select,
  Table,
  Td,
  Th,
  useToast,
} from '@/components/ui'

type Order = {
  id: string
  orderNo: string
  storeId: string
  orderedAt: string
  status: string
  originalAmount: number
  discountAmount: number
  paidAmount: number
  store: { name: string; region: { name: string } }
  items: { product: { name: string }; quantity: number; unitPrice: number; subtotal: number }[]
}

export default function OrdersView() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ storeId: '', productId: '', quantity: '1', status: 'COMPLETED' })
  const { toast } = useToast()

  const url = `/orders?keyword=${encodeURIComponent(keyword)}&status=${status}&page=${page}&pageSize=20`
  const { data, loading, error, reload } = useApi<PageResult<Order>>(url)
  const { data: storesData } = useApi<PageResult<{ id: string; name: string }>>('/stores?pageSize=100')
  const { data: servicesData } = useApi<PageResult<{ id: string; name: string }>>('/services?pageSize=100')

  const submit = async () => {
    try {
      await api.post('/orders', {
        storeId: form.storeId,
        productId: form.productId,
        quantity: Number(form.quantity),
        status: form.status,
      })
      setOpen(false)
      toast({ title: '演示订单创建成功', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '创建失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader
        title="订单中心"
        description="查看和管理服务订单"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> 创建演示订单
          </Button>
        }
      />
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-72">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <Input className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索订单号" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELED">已取消</option>
          </Select>
          <Button variant="outline" onClick={reload}>查询</Button>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.items.length ? <EmptyState /> : (
          <>
            <Table>
              <thead><tr><Th>订单号</Th><Th>门店</Th><Th>区域</Th><Th>金额</Th><Th>状态</Th><Th>下单时间</Th></tr></thead>
              <tbody>
                {data.items.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                    <Td className="font-mono text-xs">{order.orderNo}</Td>
                    <Td>{order.store.name}</Td>
                    <Td>{order.store.region.name}</Td>
                    <Td className="font-semibold">¥{order.paidAmount.toFixed(2)}</Td>
                    <Td><Badge tone={order.status === 'COMPLETED' ? 'emerald' : 'red'}>{order.status === 'COMPLETED' ? '已完成' : '已取消'}</Badge></Td>
                    <Td>{new Date(order.orderedAt).toLocaleString('zh-CN')}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={20} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title="创建演示订单" description="选择门店和服务快速生成订单">
        <div className="space-y-4">
          <label>
            <span className="mb-1.5 block text-sm font-medium">门店</span>
            <Select className="w-full" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>
              <option value="">请选择门店</option>
              {storesData?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium">服务</span>
            <Select className="w-full" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">请选择服务</option>
              {servicesData?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="mb-1.5 block text-sm font-medium">数量</span>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">状态</span>
              <Select className="w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="COMPLETED">已完成</option>
                <option value="CANCELED">已取消</option>
              </Select>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit}>创建</Button>
        </div>
      </Dialog>
    </>
  )
}
