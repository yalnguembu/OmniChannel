import { createFileRoute } from "@tanstack/react-router"
import { EditWithdrawalMethodPage } from "@/features/withdrawal-methods/pages/EditWithdrawalMethodPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/withdrawal-methods/$id/edit")({
  beforeLoad: createPermissionGuard("WITHDRAWALMETHOD_UPDATE"),
  pendingComponent: PageLoader,
  component: EditWithdrawalMethodPage,
})
