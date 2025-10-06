export enum PermissionAction {
  CREATE = "CREATE",
  VIEW = "VIEW",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const buildPermission = (resource: string, action: PermissionAction): string => {
  return `${resource}_${action}`
}

export const hasPermission = (userPermissions: string[] | null | undefined, requiredPermission: string | undefined): boolean => {
  if (!requiredPermission) return true // No permission required
  if (!userPermissions || userPermissions.length === 0) return false
  return userPermissions.includes(requiredPermission)
}

export const hasAnyPermission = (userPermissions: string[] | null | undefined, requiredPermissions: string[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true
  if (!userPermissions || userPermissions.length === 0) return false
  return requiredPermissions.some((permission) => userPermissions.includes(permission))
}

export const hasAllPermissions = (userPermissions: string[] | null | undefined, requiredPermissions: string[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true
  if (!userPermissions || userPermissions.length === 0) return false
  return requiredPermissions.every((permission) => userPermissions.includes(permission))
}

export const filterMenuByPermissions = <T extends { permission?: string; children?: T[] }>(menuItems: T[], userPermissions: string[] | null | undefined): T[] => {
  return menuItems
    .filter((item) => hasPermission(userPermissions, item.permission))
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuByPermissions(item.children, userPermissions),
        }
      }
      return item
    })
    .filter((item) => !item.children || item.children.length > 0) // Remove parent items with no accessible children
}
