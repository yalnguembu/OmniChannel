import React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center gap-3', className)}>
      {icon && (
        <div className="w-10 h-10 text-[#8BAFC0] opacity-50 flex items-center justify-center">{icon}</div>
      )}
      <p className="text-[14px] font-medium text-[#0D2137]">{title}</p>
      {description && <p className="text-[13px] text-[#8BAFC0] max-w-[320px] leading-relaxed">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
