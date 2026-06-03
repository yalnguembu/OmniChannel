import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type InputHTMLAttributes } from 'react'

interface SearchInputProps {
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
  containerClassName?: string
}

export function SearchInput({ containerClassName, className, ...props }: SearchInputProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 bg-white border border-[#E5E7EB] rounded-full h-9 transition-all duration-200 focus-within:border-[#2E8FAD] focus-within:shadow-[0_0_0_3px_rgba(46,143,173,0.1)]',
        containerClassName
      )}
    >
      <Search size={13} className="text-[#8BAFC0] shrink-0" strokeWidth={1.2} />
      <input
        className={cn(
          'border-none outline-none bg-transparent text-[13px] text-[#0D2137] w-full placeholder:text-[#8BAFC0]',
          className
        )}
        {...props}
      />
    </div>
  )
}
