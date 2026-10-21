'use client'

import { useState } from 'react'
import { Plus, ScanSearch, Search } from 'lucide-react'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@/components/ui'

type Equipment = {
  id: string
  name: string
  model: string
  storeId: string
  location: string
  lastInspectedAt: string | null
  status: string
  store: { id: string; name: string } | null
}
type Inspection = {
  id: string
  equipmentId: string
  inspectedAt: string
  inspectorId: string
  status: string
  notes: string
  equipment: { id: string; name: string; model: string; location: string } | null
  inspector: { id: string; name: string } | null
}

const eqStatusMap: Record<string, string> = { NORMAL: '正常', WARNING: '关注', MAINTENANCE: '维修中' }
const inspStatusMap: Record<string, string> = { PASS: '通过', FAIL: '不合格', REPAIR_NEEDED: '需维修' }

export default function EquipmentInspectionsView() {
  const [tab, setTab] = useState('equipment')
  return (
    <>
      <PageHeader title="器械巡检" description="管理健身器械档案与巡检记录" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="equipment">器械档案</TabsTrigger>
          <TabsTrigger value="inspections">巡检记录</TabsTrigger>
        </TabsList>
        <TabsContent value="equipment"><EquipmentTab /></TabsContent>
        <TabsContent value="inspections"><InspectionsTab /></TabsContent>
      </Tabs>
    </>
  )
}

function EquipmentTab() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const [inspOpen, setInspOpen] = useState(false)
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [inspForm, setInspForm] = useState({ status: 'PASS', notes: '' })
  const user = useAppSelector((s) => s.auth.user)!
  const { toast } = useToast()

  const { data, loading, error, reload } = useApi<Equipment[]>(`/equipment?keyword=${encodeURIComponent(keyword)}&status=${status}`)
  const { data: storesData } = useApi<PageResult<{ id: string; name: string }>>('/stores?pageSize=100')

  const canEdit = user.permissions.includes('equipment:edit')
  const canInspect = user.permissions.includes('equipment-inspection:create')

  const begin = (row?: Equipment) => {
    setForm(row ? { name: row.name, model: row.model, location: row.location, storeId: row.storeId } : { name: '', model: '', location: '', storeId: '' })
    setSelectedEq(row || null)
    setOpen(true)
  }

  const submit = async () => {
    try {
      if (selectedEq) await api.patch(`/equipment/${selectedEq.id}`, form)
      else await api.post('/equipment', form)
      setOpen(false)
      toast({ title: '保存成功', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '保存失败', description: errorMessage(e), variant: 'error' })
    }
  }

  const submitInspection = async () => {
    if (!selectedEq) return
    try {
      await api.post('/equipment-inspections', { equipmentId: selectedEq.id, status: inspForm.status, notes: inspForm.notes })
      setInspOpen(false)
      setInspForm({ status: 'PASS', notes: '' })
      toast({ title: '巡检记录已提交', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '提交失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-72">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
          <Input className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索器械名称、型号或位置" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          <option value="NORMAL">正常</option>
          <option value="WARNING">关注</option>
          <option value="MAINTENANCE">维修中</option>
        </Select>
        <Button variant="outline" onClick={reload}>查询</Button>
        {canEdit && <Button onClick={() => begin()}><Plus size={16} /> 新增器械</Button>}
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.length ? <EmptyState /> : (
        <Table>
          <thead><tr><Th>器械名称</Th><Th>型号</Th><Th>门店</Th><Th>位置</Th><Th>上次巡检</Th><Th>状态</Th><Th>操作</Th></tr></thead>
          <tbody>
            {data.map((eq) => (
              <tr key={eq.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                <Td className="font-medium">{eq.name}</Td>
                <Td className="text-xs">{eq.model}</Td>
                <Td>{eq.store?.name || '-'}</Td>
                <Td>{eq.location}</Td>
                <Td className="text-xs">{eq.lastInspectedAt ? new Date(eq.lastInspectedAt).toLocaleDateString('zh-CN') : '-'}</Td>
                <Td>
                  <Badge tone={eq.status === 'NORMAL' ? 'emerald' : eq.status === 'WARNING' ? 'amber' : 'red'}>
                    {eqStatusMap[eq.status]}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {canEdit && <Button size="sm" variant="outline" onClick={() => begin(eq)}>编辑</Button>}
                    {canInspect && <Button size="sm" variant="ghost" onClick={() => { setSelectedEq(eq); setInspOpen(true) }}><ScanSearch size={14} /> 巡检</Button>}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Dialog open={open} onOpenChange={setOpen} title={selectedEq ? '编辑器械' : '新增器械'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-sm font-medium">器械名称</span><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">型号</span><Input value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">位置</span><Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">所属门店</span>
            <Select className="w-full" value={form.storeId || ''} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>
              <option value="">请选择门店</option>
              {storesData?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit}>保存</Button>
        </div>
      </Dialog>
      <Dialog open={inspOpen} onOpenChange={setInspOpen} title={`巡检 - ${selectedEq?.name}`} description={`${selectedEq?.model} · ${selectedEq?.location}`}>
        <div className="space-y-4">
          <label><span className="mb-1.5 block text-sm font-medium">巡检结果</span>
            <Select className="w-full" value={inspForm.status} onChange={(e) => setInspForm({ ...inspForm, status: e.target.value })}>
              <option value="PASS">通过</option>
              <option value="FAIL">不合格</option>
              <option value="REPAIR_NEEDED">需维修</option>
            </Select>
          </label>
          <label><span className="mb-1.5 block text-sm font-medium">备注</span><Input value={inspForm.notes} onChange={(e) => setInspForm({ ...inspForm, notes: e.target.value })} placeholder="记录巡检发现的问题" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setInspOpen(false)}>取消</Button>
          <Button onClick={submitInspection}>提交巡检</Button>
        </div>
      </Dialog>
    </Card>
  )
}

function InspectionsTab() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useApi<PageResult<Inspection>>(`/equipment-inspections?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=20`)

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-72">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
          <Input className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索器械或巡检人" />
        </div>
        <Button variant="outline" onClick={reload}>查询</Button>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.items.length ? <EmptyState /> : (
        <>
          <Table>
            <thead><tr><Th>器械</Th><Th>位置</Th><Th>巡检人</Th><Th>巡检时间</Th><Th>结果</Th><Th>备注</Th></tr></thead>
            <tbody>
              {data.items.map((insp) => (
                <tr key={insp.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                  <Td>
                    <div><p className="font-medium">{insp.equipment?.name || '-'}</p><p className="text-xs text-stone-400">{insp.equipment?.model}</p></div>
                  </Td>
                  <Td>{insp.equipment?.location || '-'}</Td>
                  <Td>{insp.inspector?.name || '-'}</Td>
                  <Td className="text-xs">{new Date(insp.inspectedAt).toLocaleString('zh-CN')}</Td>
                  <Td>
                    <Badge tone={insp.status === 'PASS' ? 'emerald' : insp.status === 'FAIL' ? 'red' : 'amber'}>
                      {inspStatusMap[insp.status]}
                    </Badge>
                  </Td>
                  <Td className="max-w-48 truncate text-xs">{insp.notes || '-'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} pageSize={20} total={data.total} onPageChange={setPage} />
        </>
      )}
    </Card>
  )
}
