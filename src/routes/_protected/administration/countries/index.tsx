import { createFileRoute } from "@tanstack/react-router"
import { CountriesListPage } from "@/features/countries/pages/CountriesListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/countries/")({
  beforeLoad: createPermissionGuard("COUNTRY_VIEW"),
  pendingComponent: PageLoader,
  component: CountriesListPage,
})
