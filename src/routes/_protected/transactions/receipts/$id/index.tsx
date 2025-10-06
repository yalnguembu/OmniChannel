import { createFileRoute } from "@tanstack/react-router"
import { ReceiptsReadModelsListPage } from "@/features/receipts-read-models/pages/ReceiptsReadModelsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/transactions/receipts/$id/")({
  beforeLoad: createPermissionGuard("RECEIPT_VIEW"),
  pendingComponent: PageLoader,
  component: ReceiptsReadModelsListPage,
})
