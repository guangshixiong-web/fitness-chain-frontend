'use client'

import Image from 'next/image'
import { Plus, Power, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
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
} from '../components/ui'
import { useApi } from '../hooks/use-api'
import { api, errorMessage, type PageResult } from '../lib/api'
import { useAppSelector } from '../store/store'

type Entity = Record<string, any>
type Kind = 'regions' | 'stores' | 'service-categories' | 'services'
const configs: Record<
  Kind,
  {
    title: string
    description: string
    endpoint: string
    permission: string
    columns: { key: string; label: string; render?: (row: Entity) => React.ReactNode }[]
  }
> = {
  regions: {
    title: '区域管理',
    description: '维护连锁经营区域及启用状态',
    endpoint: '/regions',
    permission: 'region:create',
    columns: [
      { key: 'code', label: '区域编码' },
      { key: 'name', label: '区域名称' },
      { key: 'stores', label: '门店数量', render: (r) => `${r._count?.stores || 0} 家` },
    ],
  },
  stores: {
    title: '门店管理',
    description: '统一维护门店档案、区域归属和经营状态',
    endpoint: '/stores',
    permission: 'store:create',
    columns: [
      { key: 'code', label: '门店编号' },
      { key: 'name', label: '门店名称' },
      { key: 'region', label: '所属区域', render: (r) => r.region?.name },
      { key: 'address', label: '地址' },
      {
        key: 'openedAt',
        label: '开业日期',
        render: (r) => new Date(r.openedAt).toLocaleDateString(),
      },
    ],
  },
  'service-categories': {
    title: '服务分类',
    description: '维护团课、私教、会员卡和SPA等分类',
    endpoint: '/service-categories',
    permission: 'service-category:edit',
    columns: [
      { key: 'code', label: '分类编码' },
      { key: 'name', label: '分类名称' },
      { key: 'sort', label: '排序' },
      { key: 'products', label: '服务数量', render: (r) => `${r._count?.products || 0} 个` },
    ],
  },
  services: {
    title: '服务管理',
    description: '维护服务价格、成本、分类和上下架状态',
    endpoint: '/services',
    permission: 'service:create',
    columns: [
      {
        key: 'imageUrl',
        label: '图片',
        render: (r) => (
          <ProductThumbnail name={String(r.name)} imageUrl={r.imageUrl as string | null} />
        ),
      },
      { key: 'code', label: '服务编号' },
      { key: 'name', label: '服务名称' },
      { key: 'category', label: '分类', render: (r) => r.category?.name },
      { key: 'price', label: '售价', render: (r) => `¥${Number(r.price).toFixed(2)}` },
      { key: 'costPrice', label: '成本', render: (r) => `¥${Number(r.costPrice).toFixed(2)}` },
    ],
  },
}
export default function ManagementPage({ kind }: { kind: Kind }) {
  const config = configs[kind]
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const paged = kind === 'stores' || kind === 'services'
  const url =
    config.endpoint +
    `?keyword=${encodeURIComponent(keyword)}${paged ? `&page=${page}&pageSize=20` : ''}`
  const result = useApi<Entity[] | PageResult<Entity>>(url)
  const user = useAppSelector((s) => s.auth.user)!
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Entity>({})
  const [editing, setEditing] = useState<Entity | null>(null)
  const [submitError, setSubmitError] = useState('')
  const { toast } = useToast()
  const regions = useApi<Entity[]>('/regions')
  const categories = useApi<Entity[]>('/service-categories')
  const items = useMemo(
    () => (Array.isArray(result.data) ? result.data : result.data?.items || []),
    [result.data],
  )
  const canCreate = user.permissions.includes(config.permission)
  const begin = (row?: Entity) => {
    setEditing(row || null)
    setSubmitError('')
    setForm(
      row
        ? {
            ...row,
            regionId: row.regionId,
            categoryId: row.categoryId,
            openedAt: String(row.openedAt || '').slice(0, 10),
          }
        : kind === 'stores'
          ? { enabled: true, openedAt: new Date().toISOString().slice(0, 10) }
          : kind === 'services'
            ? { enabled: true, price: 0, costPrice: 0 }
            : kind === 'service-categories'
              ? { enabled: true, sort: 0 }
              : { enabled: true },
    )
    setOpen(true)
  }
  const submit = async () => {
    setSubmitError('')
    if (
      !form.code?.trim() ||
      !form.name?.trim() ||
      (kind === 'stores' && (!form.regionId || !form.address || !form.openedAt)) ||
      (kind === 'services' &&
        (!form.categoryId || Number(form.price) < 0 || Number(form.costPrice) < 0))
    ) {
      setSubmitError('请填写所有必填字段，价格与成本不能为负数')
      return
    }
    try {
      const endpoint = config.endpoint
      const payload = {
        ...form,
        ...(['services'].includes(kind)
          ? { price: Number(form.price), costPrice: Number(form.costPrice) }
          : {}),
        ...(kind === 'service-categories' ? { sort: Number(form.sort) } : {}),
      }
      if (editing) await api.patch(`${endpoint}/${editing.id}`, payload)
      else await api.post(endpoint, payload)
      setOpen(false)
      toast({ title: '保存成功', variant: 'success' })
      await result.reload()
    } catch (e) {
      const message = errorMessage(e)
      setSubmitError(message)
      toast({ title: '保存失败', description: message, variant: 'error' })
    }
  }
  const toggle = async (row: Entity) => {
    const endpoint = config.endpoint
    try {
      if (kind === 'regions' || kind === 'stores' || kind === 'services')
        await api.patch(`${endpoint}/${row.id}/status`, { enabled: !row.enabled })
      else await api.patch(`${endpoint}/${row.id}`, { enabled: !row.enabled })
      toast({ title: `已${row.enabled ? '停用' : '启用'}`, variant: 'success' })
      await result.reload()
    } catch (e) {
      toast({ title: '状态更新失败', description: errorMessage(e), variant: 'error' })
    }
  }
  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          canCreate ? (
            <Button onClick={() => begin()}>
              <Plus size={16} />
              新增{config.title.replace('管理', '')}
            </Button>
          ) : undefined
        }
      />
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-72">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <Input
              className="pl-9"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(1)
              }}
              placeholder="搜索编码或名称"
            />
          </div>
          <Button variant="outline" onClick={result.reload}>
            查询
          </Button>
        </div>
        {result.loading ? (
          <LoadingState />
        ) : result.error ? (
          <ErrorState message={result.error} retry={result.reload} />
        ) : !items.length ? (
          <EmptyState />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  {config.columns.map((c) => (
                    <Th key={c.key}>{c.label}</Th>
                  ))}
                  <Th>状态</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                    {config.columns.map((c) => (
                      <Td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '-')}</Td>
                    ))}
                    <Td>
                      <Badge tone={row.enabled ? 'emerald' : 'neutral'}>
                        {row.enabled ? '启用' : '停用'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => begin(row)}>
                          编辑
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggle(row)}>
                          <Power size={14} />
                          {row.enabled ? '停用' : '启用'}
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {paged && !Array.isArray(result.data) && result.data && (
              <Pagination
                page={page}
                pageSize={20}
                total={result.data.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={`${editing ? '编辑' : '新增'}${config.title.replace('管理', '')}`}
        description="编码、名称及业务关联字段为必填项"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields(kind).map((field) => (
            <label key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
              <span className="mb-1.5 block text-sm font-medium">{field.label}</span>
              {field.type === 'select' ? (
                <Select
                  className="w-full"
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                >
                  <option value="">请选择</option>
                  {(field.key === 'regionId' ? regions.data || [] : categories.data || []).map(
                    (o: Entity) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ),
                  )}
                </Select>
              ) : (
                <Input
                  type={field.type || 'text'}
                  value={form[field.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        {submitError && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {submitError}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={submit}>保存</Button>
        </div>
      </Dialog>
    </>
  )
}
function fields(kind: Kind) {
  if (kind === 'regions')
    return [
      { key: 'code', label: '区域编码' },
      { key: 'name', label: '区域名称' },
    ]
  if (kind === 'stores')
    return [
      { key: 'code', label: '门店编号' },
      { key: 'name', label: '门店名称' },
      { key: 'regionId', label: '所属区域', type: 'select' },
      { key: 'phone', label: '联系电话' },
      { key: 'address', label: '门店地址', full: true },
      { key: 'openedAt', label: '开业日期', type: 'date' },
    ]
  if (kind === 'service-categories')
    return [
      { key: 'code', label: '分类编码' },
      { key: 'name', label: '分类名称' },
      { key: 'sort', label: '排序', type: 'number' },
    ]
  return [
    { key: 'code', label: '服务编号' },
    { key: 'name', label: '服务名称' },
    { key: 'categoryId', label: '服务分类', type: 'select' },
    { key: 'price', label: '售价', type: 'number' },
    { key: 'costPrice', label: '成本价', type: 'number' },
    { key: 'imageUrl', label: '图片URL', full: true },
  ]
}

function ProductThumbnail({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const [failed, setFailed] = useState(false)
  let supported = false
  if (imageUrl) {
    try {
      const url = new URL(imageUrl)
      supported = url.protocol === 'https:' && url.hostname === 'images.unsplash.com'
    } catch {
      supported = false
    }
  }
  if (!supported || failed)
    return (
      <div
        aria-label={`${name}暂无图片`}
        className="grid h-12 w-12 place-items-center rounded-lg bg-stone-100 text-[10px] text-stone-400 dark:bg-stone-800"
      >
        暂无图
      </div>
    )
  return (
    <Image
      src={imageUrl!}
      alt={`${name}服务图`}
      width={48}
      height={48}
      className="h-12 w-12 rounded-lg object-cover"
      sizes="48px"
      onError={() => setFailed(true)}
    />
  )
}
