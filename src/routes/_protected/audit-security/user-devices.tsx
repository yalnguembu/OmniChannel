import { createFileRoute } from "@tanstack/react-router"
import { UserDevicesListPage } from "@/features/user-devices/pages/UserDevicesListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/audit-security/user-devices")({
  beforeLoad: createPermissionGuard("USERDEVICE_VIEW"),
  pendingComponent: PageLoader,
  component: UserDevicesListPage,
})
