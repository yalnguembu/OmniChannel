import { createFileRoute } from "@tanstack/react-router"
import { AllowedIpsListPage } from "@/features/allowed-ips/pages/AllowedIpsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/audit-security/allowed-ips")({
  beforeLoad: createPermissionGuard("ALLOWEDIP_VIEW"),
  pendingComponent: PageLoader,
  component: AllowedIpsListPage,
})
