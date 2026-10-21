'use client'

import { useState } from 'react'
import { Dumbbell, UserRound } from 'lucide-react'
import { api, errorMessage } from '@/lib/api'
import { useAppSelector } from '@/store/store'
import { Badge, Button, Card, Input, PageHeader, useToast } from '@/components/ui'

export default function ProfileView() {
  const user = useAppSelector((s) => s.auth.user)!
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const { toast } = useToast()

  const changePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast({ title: '两次输入的密码不一致', variant: 'error' })
      return
    }
    if (form.newPassword.length < 6) {
      toast({ title: '新密码至少 6 位', variant: 'error' })
      return
    }
    try {
      await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast({ title: '密码修改成功', variant: 'success' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) {
      toast({ title: '修改失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader title="个人资料" description="查看账号信息和修改密码" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="bg-brand-gradient relative h-28 p-5">
            <div className="fitness-stripes absolute inset-0" />
            <div className="relative flex items-center gap-2 text-white/90">
              <Dumbbell size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">YueDong Fitness</span>
            </div>
            <div className="absolute -bottom-9 left-6 rounded-2xl border-4 border-white bg-white shadow-lg dark:border-stone-900 dark:bg-stone-900">
              <div className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-xl text-white">
                <UserRound size={30} />
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 pt-12">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <Badge tone="emerald">{user.roles[0]?.name || '-'}</Badge>
            </div>
            <dl className="mt-4 space-y-4">
              <div><dt className="text-sm text-stone-500">用户名</dt><dd className="mt-1 font-medium">{user.username}</dd></div>
              <div><dt className="text-sm text-stone-500">姓名</dt><dd className="mt-1 font-medium">{user.name}</dd></div>
              <div><dt className="text-sm text-stone-500">数据范围</dt><dd className="mt-1 font-medium">{user.roles[0]?.dataScope || '-'}</dd></div>
            </dl>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">修改密码</h3>
          <div className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-medium">当前密码</span><Input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">新密码</span><Input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">确认新密码</span><Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></label>
            <Button onClick={changePassword} disabled={!form.currentPassword || !form.newPassword}>修改密码</Button>
          </div>
        </Card>
      </div>
    </>
  )
}
