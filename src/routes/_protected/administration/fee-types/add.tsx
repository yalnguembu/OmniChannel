import { createFileRoute } from "@tanstack/react-router"
import { CreateFeeTypePage } from "@/features/fee-types/pages/CreateFeeTypePage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-types/add")({
  beforeLoad: createPermissionGuard("FEETYPE_CREATE"),
  pendingComponent: PageLoader,
  component: CreateFeeTypePage,
})
