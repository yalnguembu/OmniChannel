import { createFileRoute } from "@tanstack/react-router"
import { FeeConfigurationDetailsPage } from "@/features/fee-configurations/pages/FeeConfigurationDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-configurations/$id/")({
  beforeLoad: createPermissionGuard("FEECONFIGURATION_VIEW"),
  pendingComponent: PageLoader,
  component: FeeConfigurationDetailsPage,
})
