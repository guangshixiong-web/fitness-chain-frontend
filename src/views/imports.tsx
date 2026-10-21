'use client'

import { useRef, useState } from 'react'
import { FileUp } from 'lucide-react'
import { api, errorMessage, type PageResult } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import { Badge, Button, Card, Dialog, EmptyState, ErrorState, LoadingState, PageHeader, Pagination, Table, Td, Th, useToast } from '@/components/ui'

type ImportTask = {
  id: string
  fileName: string
  status: string
  totalRows: number
  successRows: number
  failedRows: number
  createdAt: string
  createdBy: { name: string }
  errors: { rowNo: number; message: string }[]
  previewData: Record<string, string>[]
}

export default function ImportsView() {
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState<ImportTask | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { data, loading, error, reload } = useApi<PageResult<ImportTask>>(`/data-imports?page=${page}&pageSize=20`)
  const { toast } = useToast()

  const upload = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/data-imports/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast({ title: '上传成功', description: `${res.data.data.fileName} 已解析`, variant: 'success' })
      await reload()
    } catch (e) {
      toast({ title: '上传失败', description: errorMessage(e), variant: 'error' })
    }
  }

  const confirm = async (id: string) => {
    try {
      await api.post(`/data-imports/${id}/confirm`)
      toast({ title: '导入成功', variant: 'success' })
      setPreview(null)
      await reload()
    } catch (e) {
      toast({ title: '导入失败', description: errorMessage(e), variant: 'error' })
    }
  }

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/data-imports/template')
      const blob = new Blob([res.data.data.content], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.data.data.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast({ title: '下载失败', description: errorMessage(e), variant: 'error' })
    }
  }

  return (
    <>
      <PageHeader title="CSV 数据导入" description="上传 CSV 文件批量导入订单数据" />
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={downloadTemplate}>下载模板</Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = '' }} />
          <Button onClick={() => fileRef.current?.click()}><FileUp size={16} /> 上传 CSV</Button>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="mb-4 text-lg font-semibold">导入记录</h3>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={reload} /> : !data?.items.length ? <EmptyState /> : (
          <>
            <Table>
              <thead><tr><Th>文件名</Th><Th>总行数</Th><Th>成功</Th><Th>失败</Th><Th>状态</Th><Th>操作人</Th><Th>时间</Th><Th>操作</Th></tr></thead>
              <tbody>
                {data.items.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/70">
                    <Td className="max-w-48 truncate">{t.fileName}</Td>
                    <Td>{t.totalRows}</Td>
                    <Td className="text-emerald-600">{t.successRows}</Td>
                    <Td className="text-red-600">{t.failedRows}</Td>
                    <Td><Badge tone={t.status === 'IMPORTED' ? 'emerald' : t.status === 'FAILED' ? 'red' : 'amber'}>{t.status}</Badge></Td>
                    <Td>{t.createdBy.name}</Td>
                    <Td>{new Date(t.createdAt).toLocaleString('zh-CN')}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPreview(t)}>预览</Button>
                        {t.status === 'PREVIEW' && <Button size="sm" onClick={() => confirm(t.id)}>确认导入</Button>}
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
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)} title="导入预览" description={preview?.fileName}>
        {preview && (
          <div className="max-h-80 overflow-auto">
            <Table>
              <thead><tr>{Object.keys(preview.previewData[0] || {}).map((k) => <Th key={k}>{k}</Th>)}</tr></thead>
              <tbody>
                {preview.previewData.map((row, i) => (
                  <tr key={i}>{Object.values(row).map((v, j) => <Td key={j}>{v}</Td>)}</tr>
                ))}
              </tbody>
            </Table>
            {preview.errors.length > 0 && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">错误行：</p>
                {preview.errors.map((e) => <p key={e.rowNo}>第 {e.rowNo} 行：{e.message}</p>)}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  )
}
