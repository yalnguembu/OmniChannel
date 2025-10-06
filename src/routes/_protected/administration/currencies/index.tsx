import { createFileRoute } from "@tanstack/react-router"
import { CurrencysListPage } from "@/features/currencies/pages/CurrencysListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/currencies/")({
  beforeLoad: createPermissionGuard("CURRENCY_VIEW"),
  pendingComponent: PageLoader,
  component: CurrencysListPage,
})
