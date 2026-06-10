import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  color?: string
  sub?: string
}

export function StatCard({ label, value, color = '#2E8FAD', sub }: StatCardProps) {
  return (
    <div className="bg-[#F7F8F9] border border-[#E5E7EB] rounded-md p-4 text-center">
      <p className="text-[32px] font-semibold tracking-tight leading-none mb-1" style={{ color }}>{value}</p>
      <p className="text-[11.5px] text-[#8BAFC0]">{label}</p>
      {sub && <p className="text-[11px] text-[#B8CDD8] mt-0.5">{sub}</p>}
    </div>
  )
}

interface TimelineBarProps {
  data: number[]
  color?: string
  height?: number
}

export function TimelineBar({ data, color = '#2E8FAD', height = 80 }: TimelineBarProps) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[2px] cursor-pointer transition-all hover:opacity-100"
          style={{
            height: `${Math.max(2, Math.round((v / max) * height))}px`,
            background: color,
            opacity: 0.5 + 0.5 * (v / max),
          }}
          title={String(v)}
        />
      ))}
    </div>
  )
}
