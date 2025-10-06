import { createFileRoute } from "@tanstack/react-router"
import { EditFeeConfigurationPage } from "@/features/fee-configurations/pages/EditFeeConfigurationPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-configurations/$id/edit")({
  beforeLoad: createPermissionGuard("FEECONFIGURATION_UPDATE"),
  pendingComponent: PageLoader,
  component: EditFeeConfigurationPage,
})
