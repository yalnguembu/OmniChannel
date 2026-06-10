import { useAuthStore } from '@/store/authStore'
import { isSystemUser, isAdminRole } from '@/lib/auth'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = isSystemUser(user?.userType)
  const isManager = isAdmin || isAdminRole(user?.userType)
  return { isAdmin, isManager, user }
}
