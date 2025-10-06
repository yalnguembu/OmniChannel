import { createFileRoute } from "@tanstack/react-router"
import { EditFeeTypePage } from "@/features/fee-types/pages/EditFeeTypePage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-types/$id/edit")({
  beforeLoad: createPermissionGuard("FEETYPE_UPDATE"),
  pendingComponent: PageLoader,
  component: EditFeeTypePage,
})
