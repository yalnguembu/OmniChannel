import { createFileRoute } from "@tanstack/react-router"
import { WithdrawalsReadModelsListPage } from "@/features/withdrawals-read-models/pages/WithdrawalsReadModelsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/transactions/withdrawals/")({
  beforeLoad: createPermissionGuard("WITHDRAWALSREADMODEL_VIEW"),
  pendingComponent: PageLoader,
  component: WithdrawalsReadModelsListPage,
})
