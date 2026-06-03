import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, disabled, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-[34px] h-[19px] rounded-full transition-colors duration-200 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-[#2E8FAD]' : 'bg-[#E5E7EB]',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] w-[15px] h-[15px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-200',
          checked ? 'left-[17px]' : 'left-[2px]'
        )}
      />
    </button>
  )
}
