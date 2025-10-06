import { createFileRoute } from "@tanstack/react-router"
import { FeeTypesListPage } from "@/features/fee-types/pages/FeeTypesListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/fee-types/")({
  beforeLoad: createPermissionGuard("FEETYPE_VIEW"),
  pendingComponent: PageLoader,
  component: FeeTypesListPage,
})
