import { createFileRoute } from "@tanstack/react-router"
import { EditCurrencyPage } from "@/features/currencies/pages/EditCurrencyPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/currencies/$id/edit")({
  beforeLoad: createPermissionGuard("CURRENCY_UPDATE"),
  pendingComponent: PageLoader,
  component: EditCurrencyPage,
})
