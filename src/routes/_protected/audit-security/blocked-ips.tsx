import { createFileRoute } from "@tanstack/react-router"
import { BlockedIpsListPage } from "@/features/blocked-ips/pages/BlockedIpsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/audit-security/blocked-ips")({
  beforeLoad: createPermissionGuard("BLOCKEDIP_VIEW"),
  pendingComponent: PageLoader,
  component: BlockedIpsListPage,
})
