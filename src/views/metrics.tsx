'use client'

import { Power } from 'lucide-react'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Table, Td, Th, useToast } from '@/components/ui'

type Metric = { id: string; code: string; name: string; description: string; formula: string; enabled: boolean }

export default function MetricsView() {
  const { data, loading, error, reload } = useApi<Metric[]>('/metrics/definitions')
  const { toast } = useToast()

  const toggle = async (metric: Metric) => {
    try {
      await api.patch(`/metrics/definitions/${metric.id}/status`, { enabled: !metric.enabled })
      toast({ title: `指标已${metric.enabled ? '停用' : '启用'}`, variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '操作失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader title="指标管理" description="查看和维护经营指标定义" />
      <Card className="p-5">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>编码</Th><Th>名称</Th><Th>描述</Th><Th>计算口径</Th><Th>状态</Th><Th>操作</Th></tr></thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                  <Td className="font-mono text-xs">{m.code}</Td>
                  <Td className="font-medium">{m.name}</Td>
                  <Td>{m.description}</Td>
                  <Td className="font-mono text-xs">{m.formula}</Td>
                  <Td><Badge tone={m.enabled ? 'emerald' : 'neutral'}>{m.enabled ? '启用' : '停用'}</Badge></Td>
                  <Td><Button size="sm" variant="ghost" onClick={() => toggle(m)}><Power size={14} />{m.enabled ? '停用' : '启用'}</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  )
}
