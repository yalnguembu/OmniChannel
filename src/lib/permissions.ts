import { useAuthStore } from '@/store/authStore'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.userType === 'system'
  const isManager = isAdmin
  return { isAdmin, isManager, user }
}
