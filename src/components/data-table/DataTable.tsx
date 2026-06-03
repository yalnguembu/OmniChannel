import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/feedback/PageLoader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Inbox } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  width?: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  activeRowId?: string
  getRowId?: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  pagination?: {
    total: number
    pageSize: number
    page: number
    onPageChange: (page: number) => void
  }
}

interface PaginationProps {
  total: number
  pageSize: number
  page: number
  onChange: (page: number) => void
}

export function DataTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  activeRowId,
  getRowId,
  emptyTitle = 'Aucun résultat',
  emptyDescription,
  pagination,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="h-9.5 bg-[#F7F8F9] border-b border-[#E5E7EB]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 text-left text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em] whitespace-nowrap select-none',
                    col.sortable && 'cursor-pointer hover:text-[#0D2137] transition-colors',
                    sortKey === col.key && 'text-[#1B5E82]'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={10} />
                        : <ChevronDown size={10} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <TableSkeleton rows={6} cols={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={<Inbox size={32} />}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const rowId = getRowId ? getRowId(row) : String(i)
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'h-12 border-b border-[#E5E7EB] last:border-b-0 transition-colors duration-100',
                      onRowClick && 'cursor-pointer',
                      activeRowId === rowId ? 'bg-[#E8F4F8]' : onRowClick && 'hover:bg-[#F7F8F9]'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 text-[12.5px] text-[#0D2137] align-middle overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          total={pagination.total}
          pageSize={pagination.pageSize}
          page={pagination.page}
          onChange={pagination.onPageChange}
        />
      )}
    </div>
  )
}

export function Pagination({ total, pageSize, page, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = () => {
    const result: (number | '...')[] = []
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    result.push(1)
    if (page > 3) result.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) result.push(i)
    if (page < totalPages - 2) result.push('...')
    result.push(totalPages)
    return result
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] bg-[#F7F8F9] rounded-b-[14px]">
      <span className="text-[12.5px] text-[#8BAFC0]">
        {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} sur {total.toLocaleString('fr')}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[12.5px] text-[#4A7A94] hover:bg-[#F0F2F4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >‹</button>
        {pages().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="w-7 h-7 flex items-center justify-center text-[12px] text-[#8BAFC0]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn(
                'w-7 h-7 rounded-[6px] border flex items-center justify-center text-[12.5px] transition-all',
                p === page
                  ? 'bg-[#0D2137] text-white border-[#0D2137]'
                  : 'border-[#E5E7EB] bg-white text-[#4A7A94] hover:bg-[#F0F2F4]'
              )}
            >{p}</button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[12.5px] text-[#4A7A94] hover:bg-[#F0F2F4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >›</button>
      </div>
    </div>
  )
}
