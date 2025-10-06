import { createFileRoute } from "@tanstack/react-router"
import { CreateFeeConfigurationPage } from "@/features/fee-configurations/pages/CreateFeeConfigurationPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-configurations/add")({
  beforeLoad: createPermissionGuard("FEECONFIGURATION_CREATE"),
  pendingComponent: PageLoader,
  component: CreateFeeConfigurationPage,
})
