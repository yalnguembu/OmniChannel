import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

const variants = {
  primary: 'bg-[#E8541A] hover:bg-[#D44814] text-white shadow-[0_2px_10px_rgba(232,84,26,0.25)] hover:shadow-[0_4px_16px_rgba(232,84,26,0.35)] hover:-translate-y-px active:scale-[0.98]',
  secondary: 'bg-white hover:bg-[#F0F2F4] text-[#0D2137] border border-[#E5E7EB]',
  ghost: 'bg-transparent hover:bg-[#F0F2F4] text-[#4A7A94] border border-[#E5E7EB]',
  danger: 'bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] border border-[#FCA5A5]',
}

const sizes = {
  sm: 'text-[12px] px-3 py-1.5 gap-1.5',
  md: 'text-[13px] px-4 py-2 gap-1.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
