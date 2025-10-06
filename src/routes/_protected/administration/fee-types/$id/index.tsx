import { createFileRoute } from "@tanstack/react-router"
import { FeeTypeDetailsPage } from "@/features/fee-types/pages/FeeTypeDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-types/$id/")({
  beforeLoad: createPermissionGuard("FEETYPE_VIEW"),
  pendingComponent: PageLoader,
  component: FeeTypeDetailsPage,
})
