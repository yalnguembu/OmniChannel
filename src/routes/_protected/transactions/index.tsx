import { createFileRoute } from "@tanstack/react-router"
import { VwTransactionsSummarysListPage } from "@/features/vw-transactions-summarys/pages/VwTransactionsSummarysListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/transactions/")({
  beforeLoad: createPermissionGuard("VWTRANSACTIONSSUMMARY_VIEW"),
  pendingComponent: PageLoader,
  component: VwTransactionsSummarysListPage,
})
