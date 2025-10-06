import { createFileRoute } from "@tanstack/react-router"
import { CreateWithdrawalMethodPage } from "@/features/withdrawal-methods/pages/CreateWithdrawalMethodPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/withdrawal-methods/add")({
  beforeLoad: createPermissionGuard("WITHDRAWALMETHOD_CREATE"),
  pendingComponent: PageLoader,
  component: CreateWithdrawalMethodPage,
})
