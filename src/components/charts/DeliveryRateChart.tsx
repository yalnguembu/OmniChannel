import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface BarData {
  label: string
  value: number
  color?: string
}

interface DeliveryRateChartProps {
  data: BarData[]
  height?: number
  className?: string
}

export function DeliveryRateChart({ data, height = 120, className }: DeliveryRateChartProps) {
  const max = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data])

  return (
    <div className={cn('flex items-end gap-1', className)} style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
          title={`${d.label}: ${d.value}`}
        >
          <div
            className="w-full rounded-t-[2px] transition-opacity duration-150 group-hover:opacity-100 opacity-70"
            style={{
              height: `${Math.round((d.value / max) * (height - 20))}px`,
              background: d.color ?? '#2E8FAD',
              minHeight: d.value > 0 ? '2px' : '0',
            }}
          />
        </div>
      ))}
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  max?: number
  color?: string
  showPercent?: boolean
}

export function ProgressBar({ label, value, max = 100, color = '#2E8FAD', showPercent = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#E5E7EB] last:border-b-0">
      <span className="text-[12.5px] font-medium text-[#0D2137] w-[80px] shrink-0">{label}</span>
      <div className="flex-1 h-[5px] bg-[#F0F2F4] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showPercent && <span className="text-[11.5px] text-[#4A7A94] w-[38px] text-right shrink-0">{pct}%</span>}
    </div>
  )
}

interface FunnelRow {
  label: string
  count: number
  pct: number
  color: string
}

interface DeliveryFunnelProps {
  rows: FunnelRow[]
}

export function DeliveryFunnel({ rows }: DeliveryFunnelProps) {
  return (
    <div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3 py-2 border-b border-[#E5E7EB] last:border-b-0">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12.5px] font-medium text-[#0D2137]">{row.label}</span>
            </div>
            <div className="h-1 bg-[#F0F2F4] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${row.pct}%`, background: row.color }}
              />
            </div>
          </div>
          <div className="text-right shrink-0 w-[90px]">
            <p className="text-[13px] font-semibold text-[#0D2137]">{row.count.toLocaleString('fr')}</p>
            <p className="text-[11px]" style={{ color: row.color }}>{row.pct}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}
