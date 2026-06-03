import { Bell, LogOut } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { formatDate } from '@/lib/date'
import { Breadcrumbs } from './Breadcrumbs'
import { useSession } from '@/hooks/useSession'

export function Header() {
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const { user, logout, isLoggingOut } = useSession()

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.fullName ||
    user?.email ||
    'Mon compte'
  const initials = (
    user?.firstName?.[0] ??
    user?.fullName?.[0] ??
    user?.email?.[0] ??
    'U'
  ).toUpperCase()

  return (
    <header className="h-[54px] bg-white border-b border-[#E5E7EB]/60 flex items-center justify-between px-6 shrink-0">
      <Breadcrumbs />
      <div className="flex items-center gap-2.5">
        <span className="text-[11.5px] text-[#8BAFC0]">
          {formatDate(new Date().toISOString(), 'EEEE d MMM yyyy')}
        </span>
        <div className="w-px h-5 bg-[#E5E7EB]" />
        <button className="w-8 h-8 rounded-[6px] border border-[#E5E7EB] bg-white flex items-center justify-center cursor-pointer hover:bg-[#F0F2F4] transition-all relative">
          <Bell size={15} className="text-[#4A7A94]" strokeWidth={1.2} />
          {unreadCount > 0 && (
            <span className="absolute top-[7px] right-[7px] w-[5px] h-[5px] rounded-full bg-[#E8541A] border border-white" />
          )}
        </button>
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#E8F4F8] text-[#2E8FAD] flex items-center justify-center text-[12px] font-semibold">
            {initials}
          </div>
          <span className="text-[12.5px] text-[#0D2137] font-medium max-w-[140px] truncate hidden md:block">
            {displayName}
          </span>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            title="Se déconnecter"
            className="w-8 h-8 rounded-[6px] border border-[#E5E7EB] bg-white flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2] hover:text-[#DC2626] text-[#4A7A94] transition-all disabled:opacity-50"
          >
            <LogOut size={15} strokeWidth={1.2} />
          </button>
        </div>
      </div>
    </header>
  )
}
