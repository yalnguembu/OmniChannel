import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
  prefixIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, hint, prefixIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[12.5px] font-medium text-[#0D2137]">
            {label}
          </label>
        )}
        <div className="relative group">
          {prefixIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8BAFC0] group-focus-within:text-[#2E8FAD] transition-colors pointer-events-none">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3 py-2 border rounded-[10px] text-[13px] text-[#0D2137] bg-white outline-none transition-all duration-150 placeholder:text-[#8BAFC0]',
              prefixIcon && 'pl-10',
              error
                ? 'border-[#FCA5A5] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                : 'border-[#E5E7EB] focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)]',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-[11.5px] text-[#8BAFC0] leading-relaxed">{hint}</p>}
        {error && <p className="text-[11.5px] text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
