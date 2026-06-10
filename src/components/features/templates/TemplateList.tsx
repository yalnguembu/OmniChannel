import { Edit } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn, statusLabel } from '@/lib/utils'
import { formatDate } from '@/lib/date'
import type { TemplateModel } from '@/models/template.model'

const categoryColors: Record<string, string> = {
  Transactionnel: '#2E8FAD',
  Marketing: '#E8541A',
  Bienvenue: '#16A34A',
  Notification: '#D97706',
}

const statusV = (s: string) =>
  s === 'active' ? 'success' : s === 'archived' ? 'neutral' : 'warning'

interface TemplateListProps {
  templates: TemplateModel[]
  activeId?: string
  onSelect: (template: TemplateModel) => void
  onEdit?: (template: TemplateModel) => void
}

export function TemplateList({ templates, activeId, onSelect, onEdit }: TemplateListProps) {
  return (
    <div className="flex flex-col p-2">
      {templates.map((t) => {
        const catColor = categoryColors[t.category ?? ''] ?? '#2E8FAD'
        return (
          <div
            key={t.id}
            onClick={() => onSelect(t)}
            className={cn(
              'px-3.5 py-3 rounded-md cursor-pointer transition-all border mb-1 relative group',
              activeId === t.id
                ? 'bg-[#E8F4F8] border-[#2E8FAD]/30'
                : 'border-transparent hover:bg-[#F0F2F4] hover:border-[#E5E7EB]'
            )}
          >
            {/* Header: name + status */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-[13px] font-medium text-[#0D2137] leading-snug">{t.name || 'Sans titre'}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(t) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[#0D2137]/10 text-[#8BAFC0] hover:text-[#0D2137] transition-all"
                    title="Modifier"
                  >
                    <Edit size={12} />
                  </button>
                )}
                <Badge variant={statusV(t.status)} className="text-[10px] flex-shrink-0">
                  {statusLabel(t.status)}
                </Badge>
              </div>
            </div>

            {/* Meta: category + language */}
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {t.category && (
                <span
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: catColor + '18',
                    color: catColor,
                  }}
                >
                  {t.category}
                </span>
              )}
              {t.language && (
                <span className="text-[10.5px] bg-[#F0F2F4] text-[#8BAFC0] px-1.5 py-0.5 rounded">
                  {t.language.toUpperCase()}
                </span>
              )}
            </div>

            {/* Preview text */}
            <p className="text-[12px] text-[#8BAFC0] line-clamp-2 leading-relaxed">
              {t.content ? t.content.slice(0, 100) : 'Aucun contenu'}
            </p>

            {/* Footer: date + version/usage */}
            <div className="flex items-center justify-between mt-2 pt-1.5">
              <span className="text-[11px] text-[#B8CDD8]">
                {t.updatedAt ? formatDate(t.updatedAt) : t.createdAt ? formatDate(t.createdAt) : '—'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
