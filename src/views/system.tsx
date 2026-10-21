'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import { Badge, Button, Card, Dialog, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select, Table, Td, Th, useToast } from '@/components/ui'

type UserRow = {
  id: string
  username: string
  name: string
  email: string
  phone: string
  enabled: boolean
  region: { name: string } | null
  store: { name: string } | null
  roles: { role: { name: string } }[]
}
type RoleRow = {
  id: string
  code: string
  name: string
  description: string
  dataScope: string
  permissions: { permissionId: string; permission: { code: string; name: string } }[]
  _count: { users: number }
}
type LogRow = {
  id: string
  createdAt: string
  module: string
  action: string
  success: boolean
  ip: string
  user: { name: string; username: string } | null
}
type PermissionRow = { id: string; code: string; name: string; type: string }

export function UsersView() {
  const { data, loading, error, reload } = useApi<UserRow[]>('/system/users')
  const { data: regions } = useApi<{ id: string; name: string }[]>('/regions')
  const { data: storesData } = useApi<{ items: { id: string; name: string }[] }>('/stores?pageSize=100')
  const { data: roles } = useApi<RoleRow[]>('/system/roles')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const begin = (row?: UserRow) => {
    setEditing(row || null)
    setForm(row ? { name: row.name, email: row.email, phone: row.phone, regionId: '', storeId: '', roleId: '' } : { username: '', password: '', name: '', email: '', phone: '', regionId: '', storeId: '', roleId: '' })
    setOpen(true)
  }

  const submit = async () => {
    try {
      if (editing) await api.patch(`/system/users/${editing.id}`, form)
      else await api.post('/system/users', form)
      setOpen(false)
      toast({ title: '保存成功', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '保存失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader title="用户管理" description="管理系统用户及权限分配" action={<Button onClick={() => begin()}><Plus size={16} /> 新增用户</Button>} />
      <Card className="p-5">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>用户名</Th><Th>姓名</Th><Th>邮箱</Th><Th>角色</Th><Th>区域</Th><Th>门店</Th><Th>状态</Th><Th>操作</Th></tr></thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                  <Td className="font-mono text-xs">{u.username}</Td>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.roles.map((r) => r.role.name).join('、')}</Td>
                  <Td>{u.region?.name || '-'}</Td>
                  <Td>{u.store?.name || '-'}</Td>
                  <Td><Badge tone={u.enabled ? 'emerald' : 'neutral'}>{u.enabled ? '启用' : '停用'}</Badge></Td>
                  <Td><Button size="sm" variant="outline" onClick={() => begin(u)}>编辑</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={editing ? '编辑用户' : '新增用户'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!editing && <label><span className="mb-1.5 block text-sm font-medium">用户名</span><Input value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>}
          {!editing && <label><span className="mb-1.5 block text-sm font-medium">初始密码</span><Input type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>}
          <label><span className="mb-1.5 block text-sm font-medium">姓名</span><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">邮箱</span><Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">电话</span><Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">角色</span><Select className="w-full" value={form.roleId || ''} onChange={(e) => setForm({ ...form, roleId: e.target.value })}><option value="">请选择</option>{roles?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></label>
          <label><span className="mb-1.5 block text-sm font-medium">区域</span><Select className="w-full" value={form.regionId || ''} onChange={(e) => setForm({ ...form, regionId: e.target.value })}><option value="">请选择</option>{regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></label>
          <label><span className="mb-1.5 block text-sm font-medium">门店</span><Select className="w-full" value={form.storeId || ''} onChange={(e) => setForm({ ...form, storeId: e.target.value })}><option value="">请选择</option>{storesData?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setOpen(false)}>取消</Button><Button onClick={submit}>保存</Button></div>
      </Dialog>
    </>
  )
}

export function RolesView() {
  const { data, loading, error, reload } = useApi<RoleRow[]>('/system/roles')
  const { data: permissions } = useApi<PermissionRow[]>('/system/permissions')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<RoleRow | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const { toast } = useToast()

  const begin = (row?: RoleRow) => {
    setEditing(row || null)
    setForm(row ? { code: row.code, name: row.name, description: row.description, dataScope: row.dataScope, permissionIds: row.permissions.map((p) => p.permissionId) } : { code: '', name: '', description: '', dataScope: 'ALL', permissionIds: [] })
    setOpen(true)
  }

  const submit = async () => {
    try {
      if (editing) await api.patch(`/system/roles/${editing.id}`, form)
      else await api.post('/system/roles', form)
      setOpen(false)
      toast({ title: '保存成功', variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '保存失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader title="角色权限" description="配置角色及其菜单、按钮和数据权限" action={<Button onClick={() => begin()}><Plus size={16} /> 新增角色</Button>} />
      <Card className="p-5">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.length ? <EmptyState /> : (
          <div className="space-y-4">
            {data.map((role) => (
              <div key={role.id} className="rounded-xl border border-stone-200 p-4 dark:border-stone-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{role.name} <span className="ml-2 text-xs font-normal text-stone-400">{role.code}</span></p>
                    <p className="mt-1 text-sm text-stone-500">{role.description}</p>
                    <p className="mt-2 text-xs text-stone-400">数据范围：{role.dataScope} · 用户数：{role._count.users}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => begin(role)}>编辑</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 12).map((p) => <Badge key={p.permissionId} tone="neutral">{p.permission.name}</Badge>)}
                  {role.permissions.length > 12 && <Badge tone="neutral">+{role.permissions.length - 12}</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={editing ? '编辑角色' : '新增角色'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label><span className="mb-1.5 block text-sm font-medium">角色编码</span><Input value={String(form.code || '')} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
            <label><span className="mb-1.5 block text-sm font-medium">角色名称</span><Input value={String(form.name || '')} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          </div>
          <label><span className="mb-1.5 block text-sm font-medium">描述</span><Input value={String(form.description || '')} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label><span className="mb-1.5 block text-sm font-medium">数据范围</span><Select className="w-full" value={String(form.dataScope || 'ALL')} onChange={(e) => setForm({ ...form, dataScope: e.target.value })}><option value="ALL">全部</option><option value="REGION">区域</option><option value="STORE">门店</option></Select></label>
          <div>
            <span className="mb-2 block text-sm font-medium">权限</span>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-stone-200 p-3 dark:border-stone-700">
              {permissions?.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(form.permissionIds as string[])?.includes(p.id)}
                    onChange={(e) => {
                      const ids = new Set((form.permissionIds as string[]) || [])
                      if (e.target.checked) ids.add(p.id)
                      else ids.delete(p.id)
                      setForm({ ...form, permissionIds: [...ids] })
                    }}
                  />
                  {p.name} <span className="text-xs text-stone-400">({p.code})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setOpen(false)}>取消</Button><Button onClick={submit}>保存</Button></div>
      </Dialog>
    </>
  )
}

export function LogsView() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useApi<{ items: LogRow[]; total: number }>(`/system/logs?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=20`)

  return (
    <>
      <PageHeader title="操作日志" description="审计系统关键操作行为" />
      <Card className="p-5">
        <div className="mb-4 flex gap-3">
          <Input className="max-w-72" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索操作人或模块" />
          <Button variant="outline" onClick={reload}>查询</Button>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.items.length ? <EmptyState /> : (
          <>
            <Table>
              <thead><tr><Th>时间</Th><Th>操作人</Th><Th>模块</Th><Th>操作</Th><Th>IP</Th><Th>结果</Th></tr></thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                    <Td>{new Date(log.createdAt).toLocaleString('zh-CN')}</Td>
                    <Td>{log.user ? `${log.user.name}(${log.user.username})` : '-'}</Td>
                    <Td className="font-mono text-xs">{log.module}</Td>
                    <Td>{log.action}</Td>
                    <Td className="font-mono text-xs">{log.ip}</Td>
                    <Td><Badge tone={log.success ? 'emerald' : 'red'}>{log.success ? '成功' : '失败'}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={20} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
    </>
  )
}

function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  return (
    <nav className="mt-4 flex items-center justify-between text-sm">
      <span className="text-stone-500">共 {total} 条，第 {page}/{pages} 页</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>上一页</Button>
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>下一页</Button>
      </div>
    </nav>
  )
}
