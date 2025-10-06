import { createFileRoute } from "@tanstack/react-router"
import { CreateCountryPage } from "@/features/countries/pages/CreateCountryPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/countries/add")({
  beforeLoad: createPermissionGuard("COUNTRY_CREATE"),
  pendingComponent: PageLoader,
  component: CreateCountryPage,
})
