import { createFileRoute } from "@tanstack/react-router"
import { VwTransactionsSummaryDetailsPage } from "@/features/vw-transactions-summarys/pages/VwTransactionsSummaryDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/transactions/$id/")({
  beforeLoad: createPermissionGuard("TRANSACTION_VIEW"),
  pendingComponent: PageLoader,
  component: VwTransactionsSummaryDetailsPage,
})
