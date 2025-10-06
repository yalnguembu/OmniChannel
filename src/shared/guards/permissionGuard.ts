import { redirect } from "@tanstack/react-router"
import { hasPermission, hasAnyPermission, hasAllPermissions, PermissionAction, buildPermission } from "../utils/permissions"
import { useSessionStore } from "../stores/sessionStore"

export const permissionGuard = ({
  userPermissions,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  redirectTo = "/unauthorized",
}: {
  userPermissions: string[] | null | undefined
  requiredPermission?: string
  requiredPermissions?: string[]
  requireAll?: boolean
  redirectTo?: string
}) => {
  // If no permission is required, allow access
  if (!requiredPermission && (!requiredPermissions || requiredPermissions.length === 0)) {
    return true
  }

  // Check single permission
  if (requiredPermission) {
    if (!hasPermission(userPermissions, requiredPermission)) {
      throw redirect({
        to: redirectTo,
        search: {
          redirect: window.location.pathname,
        },
      })
    }
    return true
  }

  // Check multiple permissions
  if (requiredPermissions) {
    const hasAccess = requireAll ? hasAllPermissions(userPermissions, requiredPermissions) : hasAnyPermission(userPermissions, requiredPermissions)

    if (!hasAccess) {
      throw redirect({
        to: redirectTo,
        search: {
          redirect: window.location.pathname,
        },
      })
    }
  }

  return true
}

export const createPermissionGuard = (requiredPermission?: string) => async () => {
  const sessionStore = useSessionStore.getState()
  const userPermissions = sessionStore.user?.permissions || sessionStore.userPermissions || []

  permissionGuard({
    userPermissions,
    requiredPermission,
  })
}

export const createCrudPermissionGuard = (resource: string, action: PermissionAction) => async () => {
  const sessionStore = useSessionStore.getState()
  const userPermissions = sessionStore.user?.permissions || sessionStore.userPermissions || []
  const requiredPermission = buildPermission(resource, action)

  permissionGuard({
    userPermissions,
    requiredPermission,
  })
}

export const createMultiPermissionGuard =
  (requiredPermissions: string[], requireAll: boolean = false) =>
  async () => {
    const sessionStore = useSessionStore.getState()
    const userPermissions = sessionStore.user?.permissions || sessionStore.userPermissions || []

    permissionGuard({
      userPermissions,
      requiredPermissions,
      requireAll,
    })
  }

export { PermissionAction, buildPermission }
