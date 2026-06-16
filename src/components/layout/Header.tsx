import { Breadcrumbs } from './Breadcrumbs'
import { useSession } from '@/hooks/useSession'

export function Header() {
  useSession()

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB]/60 flex items-center px-6 shrink-0">
      <Breadcrumbs />
    </header>
  )
}
