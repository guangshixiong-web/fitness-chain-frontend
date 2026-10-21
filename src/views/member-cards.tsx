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

type MemberCard = {
  id: string
  cardNo: string
  memberName: string
  memberPhone: string
  storeId: string
  cardType: string
  totalVisits: number | null
  remainingVisits: number | null
  price: number
  startDate: string
  endDate: string
  status: string
  store: { name: string }
}

const cardTypeMap: Record<string, string> = { TIMES: '次卡', MONTHLY: '月卡', YEARLY: '年卡' }
const statusMap: Record<string, string> = { ACTIVE: '生效中', EXPIRED: '已过期', FROZEN: '已冻结' }

export default function MemberCardsView() {
  const [keyword, setKeyword] = useState('')
  const [cardType, setCardType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MemberCard | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const user = useAppSelector((s) => s.auth.user)!
  const { toast } = useToast()

  const url = `/member-cards?keyword=${encodeURIComponent(keyword)}&cardType=${cardType}&status=${status}&page=${page}&pageSize=20`
  const { data, loading, error, reload } = useApi<PageResult<MemberCard>>(url)
  const { data: storesData } = useApi<PageResult<{ id: string; name: string }>>('/stores?pageSize=100')

  const canCreate = user.permissions.includes('member-card:create')
  const canEdit = user.permissions.includes('member-card:edit')

  const begin = (row?: MemberCard) => {
    setEditing(row || null)
    setForm(
      row
        ? { memberName: row.memberName, memberPhone: row.memberPhone, cardType: row.cardType, totalVisits: String(row.totalVisits || ''), price: String(row.price), startDate: row.startDate, endDate: row.endDate }
        : { memberName: '', memberPhone: '', cardType: 'MONTHLY', totalVisits: '30', price: '580', startDate: new Date().toISOString().slice(0, 10), endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) },
    )
    setOpen(true)
  }

  const submit = async () => {
    try {
      const payload: Record<string, unknown> = {
        memberName: form.memberName,
        memberPhone: form.memberPhone,
        cardType: form.cardType,
        price: Number(form.price),
        startDate: form.startDate,
        endDate: form.endDate,
        ...(form.cardType === 'TIMES' ? { totalVisits: Number(form.totalVisits) } : {}),
      }
      if (editing) await api.patch(`/member-cards/${editing.id}`, payload)
      else await api.post('/member-cards', { ...payload, storeId: form.storeId || storesData?.items[0]?.id })
      setOpen(false)
      toast({ title: editing ? '更新成功' : '办理成功', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '保存失败', description: errorMessage(e), variant: 'error' })
    }
  }

  const freeze = async (row: MemberCard) => {
    try {
      await api.patch(`/member-cards/${row.id}/status`, { status: row.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN' })
      toast({ title: row.status === 'FROZEN' ? '已解冻' : '已冻结', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '操作失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader
        title="会员卡管理"
        description="办理、查询和冻结会员卡"
        action={canCreate ? <Button onClick={() => begin()}><Plus size={16} /> 办理会员卡</Button> : undefined}
      />
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-72">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <Input className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索卡号、姓名或手机号" />
          </div>
          <Select value={cardType} onChange={(e) => setCardType(e.target.value)}>
            <option value="">全部类型</option>
            <option value="TIMES">次卡</option>
            <option value="MONTHLY">月卡</option>
            <option value="YEARLY">年卡</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="ACTIVE">生效中</option>
            <option value="EXPIRED">已过期</option>
            <option value="FROZEN">已冻结</option>
          </Select>
          <Button variant="outline" onClick={reload}>查询</Button>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.items.length ? <EmptyState /> : (
          <>
            <Table>
              <thead><tr><Th>卡号</Th><Th>会员</Th><Th>门店</Th><Th>类型</Th><Th>剩余次数</Th><Th>有效期</Th><Th>金额</Th><Th>状态</Th><Th>操作</Th></tr></thead>
              <tbody>
                {data.items.map((card) => (
                  <tr key={card.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                    <Td className="font-mono text-xs">{card.cardNo}</Td>
                    <Td>
                      <div><p className="font-medium">{card.memberName}</p><p className="text-xs text-stone-400">{card.memberPhone}</p></div>
                    </Td>
                    <Td>{card.store.name}</Td>
                    <Td><Badge tone="blue">{cardTypeMap[card.cardType]}</Badge></Td>
                    <Td>{card.remainingVisits !== null ? `${card.remainingVisits}/${card.totalVisits}` : '-'}</Td>
                    <Td className="text-xs">{card.startDate} ~ {card.endDate}</Td>
                    <Td>¥{card.price.toLocaleString()}</Td>
                    <Td>
                      <Badge tone={card.status === 'ACTIVE' ? 'emerald' : card.status === 'EXPIRED' ? 'neutral' : 'amber'}>
                        {statusMap[card.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        {canEdit && <Button size="sm" variant="outline" onClick={() => begin(card)}>编辑</Button>}
                        {canEdit && card.status !== 'EXPIRED' && (
                          <Button size="sm" variant="ghost" onClick={() => freeze(card)}>
                            {card.status === 'FROZEN' ? '解冻' : '冻结'}
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={20} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={editing ? '编辑会员卡' : '办理会员卡'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-sm font-medium">会员姓名</span><Input value={form.memberName || ''} onChange={(e) => setForm({ ...form, memberName: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">手机号</span><Input value={form.memberPhone || ''} onChange={(e) => setForm({ ...form, memberPhone: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">卡类型</span>
            <Select className="w-full" value={form.cardType || 'MONTHLY'} onChange={(e) => setForm({ ...form, cardType: e.target.value })}>
              <option value="TIMES">次卡</option>
              <option value="MONTHLY">月卡</option>
              <option value="YEARLY">年卡</option>
            </Select>
          </label>
          {form.cardType === 'TIMES' && (
            <label><span className="mb-1.5 block text-sm font-medium">总次数</span><Input type="number" value={form.totalVisits || '30'} onChange={(e) => setForm({ ...form, totalVisits: e.target.value })} /></label>
          )}
          <label><span className="mb-1.5 block text-sm font-medium">金额</span><Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">开始日期</span><Input type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">结束日期</span><Input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
          {!editing && (
            <label><span className="mb-1.5 block text-sm font-medium">所属门店</span>
              <Select className="w-full" value={form.storeId || ''} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>
                <option value="">请选择门店</option>
                {storesData?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </label>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit}>{editing ? '保存' : '办理'}</Button>
        </div>
      </Dialog>
    </>
  )
}
