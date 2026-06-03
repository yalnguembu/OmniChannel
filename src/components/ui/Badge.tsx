import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent' | 'purple'
  dot?: boolean
  className?: string
}

const variants = {
  success: 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]',
  warning: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
  error: 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]',
  info: 'bg-[#E8F4F8] text-[#1B5E82] border border-[#6AB8D4]/30',
  neutral: 'bg-[#F0F2F4] text-[#4A7A94] border border-[#E5E7EB]',
  accent: 'bg-[#FFF0EA] text-[#E8541A] border border-[#F5C4A8]',
  purple: 'bg-[#EDE9FE] text-[#7C3AED] border border-[#C4B5FD]',
}

const dotColors = {
  success: 'bg-[#16A34A]',
  warning: 'bg-[#D97706]',
  error: 'bg-[#DC2626]',
  info: 'bg-[#2E8FAD]',
  neutral: 'bg-[#8BAFC0]',
  accent: 'bg-[#E8541A]',
  purple: 'bg-[#7C3AED]',
}

export function Badge({ children, variant = 'neutral', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-[5px] h-[5px] rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
