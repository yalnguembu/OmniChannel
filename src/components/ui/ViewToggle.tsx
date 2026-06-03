import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  view: 'card' | 'table'
  onChange: (v: 'card' | 'table') => void
  className?: string
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center bg-[#F0F2F4] border border-[#E5E7EB] rounded-[8px] p-0.5', className)}>
      <button
        onClick={() => onChange('card')}
        title="Vue cartes"
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[12px] transition-all cursor-pointer',
          view === 'card'
            ? 'bg-white text-[#0D2137] shadow-[0_1px_3px_rgba(13,33,55,0.08)] font-medium'
            : 'text-[#8BAFC0] hover:text-[#4A7A94]'
        )}
      >
        <LayoutGrid size={13} />
        <span>Cartes</span>
      </button>
      <button
        onClick={() => onChange('table')}
        title="Vue tableau"
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[12px] transition-all cursor-pointer',
          view === 'table'
            ? 'bg-white text-[#0D2137] shadow-[0_1px_3px_rgba(13,33,55,0.08)] font-medium'
            : 'text-[#8BAFC0] hover:text-[#4A7A94]'
        )}
      >
        <List size={13} />
        <span>Tableau</span>
      </button>
    </div>
  )
}