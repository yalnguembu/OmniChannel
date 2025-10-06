import { createFileRoute } from "@tanstack/react-router"
import { WithdrawalsReadModelDetailsPage } from "@/features/withdrawals-read-models/pages/WithdrawalsReadModelDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/transactions/withdrawals/$id/")({
  beforeLoad: createPermissionGuard("WITHDRAWAL_VIEW"),
  pendingComponent: PageLoader,
  component: WithdrawalsReadModelDetailsPage,
})
