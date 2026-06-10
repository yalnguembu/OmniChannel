import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { type InputHTMLAttributes, forwardRef, type ReactNode, useState } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
  prefixIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, hint, prefixIcon, className, id, type, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const isPassword = type === 'password'
    const [reveal, setReveal] = useState(false)
    // For password fields, swap the type when revealed and show an eye toggle.
    const inputType = isPassword ? (reveal ? 'text' : 'password') : type
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
            type={inputType}
            className={cn(
              'w-full px-3 py-2 border rounded-md text-[13px] text-[#0D2137] bg-white outline-none transition-all duration-150 placeholder:text-[#8BAFC0]',
              prefixIcon && 'pl-10',
              isPassword && 'pr-10',
              error
                ? 'border-[#FCA5A5] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                : 'border-[#E5E7EB] focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)]',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setReveal((v) => !v)}
              title={reveal ? 'Masquer' : 'Afficher'}
              aria-label={reveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BAFC0] hover:text-[#2E8FAD] transition-colors cursor-pointer"
            >
              {reveal ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
        {hint && !error && <p className="text-[11.5px] text-[#8BAFC0] leading-relaxed">{hint}</p>}
        {error && <p className="text-[11.5px] text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
