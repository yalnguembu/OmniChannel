import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  title: string
  action?: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white border border-[#E5E7EB] rounded-[14px]', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8F9] rounded-t-[14px]',
        className
      )}
    >
      <span className="text-[13px] font-medium text-[#0D2137]">{title}</span>
      {action && <div className="text-[12px] text-[#2E8FAD] cursor-pointer flex items-center gap-1">{action}</div>}
    </div>
  )
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn('p-5', className)}>{children}</div>
}
