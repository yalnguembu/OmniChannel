import { createFileRoute } from "@tanstack/react-router"
import { FeeConfigurationsListPage } from "@/features/fee-configurations/pages/FeeConfigurationsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-configurations/")({
  beforeLoad: createPermissionGuard("FEECONFIGURATION_VIEW"),
  pendingComponent: PageLoader,
  component: FeeConfigurationsListPage,
})
