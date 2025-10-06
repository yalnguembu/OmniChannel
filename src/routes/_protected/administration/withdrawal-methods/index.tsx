import { createFileRoute } from "@tanstack/react-router"
import { WithdrawalMethodsListPage } from "@/features/withdrawal-methods/pages/WithdrawalMethodsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/withdrawal-methods/")({
  beforeLoad: createPermissionGuard("WITHDRAWALMETHOD_VIEW"),
  pendingComponent: PageLoader,
  component: WithdrawalMethodsListPage,
})
