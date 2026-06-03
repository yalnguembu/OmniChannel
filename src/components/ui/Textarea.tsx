import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-[12.5px] font-medium text-[#0D2137]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 border rounded-[10px] text-[13px] text-[#0D2137] bg-white outline-none transition-all duration-150 placeholder:text-[#8BAFC0] resize-y min-h-[80px]',
            error
              ? 'border-[#FCA5A5] focus:border-[#DC2626]'
              : 'border-[#E5E7EB] focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)]',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11.5px] text-[#8BAFC0] leading-relaxed">{hint}</p>}
        {error && <p className="text-[11.5px] text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
