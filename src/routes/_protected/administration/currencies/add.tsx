import { createFileRoute } from "@tanstack/react-router"
import { CreateCurrencyPage } from "@/features/currencies/pages/CreateCurrencyPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/currencies/add")({
  beforeLoad: createPermissionGuard("CURRENCY_CREATE"),
  pendingComponent: PageLoader,
  component: CreateCurrencyPage,
})
