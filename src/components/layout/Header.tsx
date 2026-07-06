import { Menu } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { useSession } from '@/hooks/useSession'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  useSession()

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB]/60 flex items-center px-4 md:px-6 shrink-0 gap-3">
      {/* Burger — mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-[#4A7A94] hover:bg-[#F0F2F4] transition-colors shrink-0"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      <Breadcrumbs />
    </header>
  )
}
