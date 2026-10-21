'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { api, errorMessage, type PageResult } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import { useAppSelector } from '@/store/store'
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

type TrainerBooking = {
  id: string
  bookingNo: string
  memberName: string
  memberPhone: string
  trainerId: string
  storeId: string
  sessionDate: string
  timeSlot: string
  status: string
  notes: string
  trainer: { id: string; name: string; specialty: string } | null
  store: { name: string }
}

const statusMap: Record<string, string> = { PENDING: '待确认', CONFIRMED: '已确认', COMPLETED: '已完成', CANCELLED: '已取消' }

export default function TrainerBookingsView() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TrainerBooking | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const user = useAppSelector((s) => s.auth.user)!
  const { toast } = useToast()

  const url = `/trainer-bookings?keyword=${encodeURIComponent(keyword)}&status=${status}&page=${page}&pageSize=20`
  const { data, loading, error, reload } = useApi<PageResult<TrainerBooking>>(url)
  const { data: storesData } = useApi<PageResult<{ id: string; name: string }>>('/stores?pageSize=100')
  const { data: trainersData } = useApi<{ id: string; name: string; specialty: string }[]>('/trainers')

  const canCreate = user.permissions.includes('trainer-booking:create')
  const canEdit = user.permissions.includes('trainer-booking:edit')

  const begin = (row?: TrainerBooking) => {
    setEditing(row || null)
    setForm(
      row
        ? { memberName: row.memberName, memberPhone: row.memberPhone, trainerId: row.trainerId, sessionDate: row.sessionDate, timeSlot: row.timeSlot, notes: row.notes }
        : { memberName: '', memberPhone: '', trainerId: '', sessionDate: new Date().toISOString().slice(0, 10), timeSlot: '09:00-10:00', notes: '' },
    )
    setOpen(true)
  }

  const submit = async () => {
    try {
      const payload = { memberName: form.memberName, memberPhone: form.memberPhone, trainerId: form.trainerId, sessionDate: form.sessionDate, timeSlot: form.timeSlot, notes: form.notes }
      if (editing) await api.patch(`/trainer-bookings/${editing.id}`, payload)
      else await api.post('/trainer-bookings', { ...payload, storeId: form.storeId || storesData?.items[0]?.id })
      setOpen(false)
      toast({ title: editing ? '更新成功' : '预约成功', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '保存失败', description: errorMessage(e), variant: 'error' })
    }
  }

  const updateStatus = async (row: TrainerBooking, newStatus: string) => {
    try {
      await api.patch(`/trainer-bookings/${row.id}`, { status: newStatus })
      toast({ title: '状态已更新', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '操作失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader
        title="私教预约"
        description="管理会员私教课程预约"
        action={canCreate ? <Button onClick={() => begin()}><Plus size={16} /> 新增预约</Button> : undefined}
      />
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-72">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <Input className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索预约号或会员" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="PENDING">待确认</option>
            <option value="CONFIRMED">已确认</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </Select>
          <Button variant="outline" onClick={reload}>查询</Button>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.items.length ? <EmptyState /> : (
          <>
            <Table>
              <thead><tr><Th>预约号</Th><Th>会员</Th><Th>教练</Th><Th>门店</Th><Th>日期</Th><Th>时段</Th><Th>状态</Th><Th>备注</Th><Th>操作</Th></tr></thead>
              <tbody>
                {data.items.map((bk) => (
                  <tr key={bk.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                    <Td className="font-mono text-xs">{bk.bookingNo}</Td>
                    <Td>
                      <div><p className="font-medium">{bk.memberName}</p><p className="text-xs text-stone-400">{bk.memberPhone}</p></div>
                    </Td>
                    <Td>
                      {bk.trainer ? (
                        <div><p className="font-medium">{bk.trainer.name}</p><p className="text-xs text-stone-400">{bk.trainer.specialty}</p></div>
                      ) : '-'}
                    </Td>
                    <Td>{bk.store.name}</Td>
                    <Td>{bk.sessionDate}</Td>
                    <Td>{bk.timeSlot}</Td>
                    <Td>
                      <Badge tone={bk.status === 'COMPLETED' ? 'emerald' : bk.status === 'CONFIRMED' ? 'blue' : bk.status === 'CANCELLED' ? 'red' : 'amber'}>
                        {statusMap[bk.status]}
                      </Badge>
                    </Td>
                    <Td className="max-w-32 truncate text-xs">{bk.notes || '-'}</Td>
                    <Td>
                      {canEdit && bk.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => updateStatus(bk, 'CONFIRMED')}>确认</Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(bk, 'CANCELLED')}>取消</Button>
                        </div>
                      )}
                      {canEdit && bk.status === 'CONFIRMED' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(bk, 'COMPLETED')}>完成</Button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={20} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={editing ? '编辑预约' : '新增预约'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-sm font-medium">会员姓名</span><Input value={form.memberName || ''} onChange={(e) => setForm({ ...form, memberName: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">手机号</span><Input value={form.memberPhone || ''} onChange={(e) => setForm({ ...form, memberPhone: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">教练</span>
            <Select className="w-full" value={form.trainerId || ''} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
              <option value="">请选择教练</option>
              {trainersData?.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.specialty}</option>)}
            </Select>
          </label>
          <label><span className="mb-1.5 block text-sm font-medium">预约日期</span><Input type="date" value={form.sessionDate || ''} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">时段</span>
            <Select className="w-full" value={form.timeSlot || '09:00-10:00'} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}>
              <option value="09:00-10:00">09:00-10:00</option>
              <option value="10:00-11:00">10:00-11:00</option>
              <option value="14:00-15:00">14:00-15:00</option>
              <option value="16:00-17:00">16:00-17:00</option>
              <option value="19:00-20:00">19:00-20:00</option>
            </Select>
          </label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">备注</span><Input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit}>{editing ? '保存' : '预约'}</Button>
        </div>
      </Dialog>
    </>
  )
}
