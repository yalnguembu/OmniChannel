import { createFileRoute } from "@tanstack/react-router"
import { EditCountryPage } from "@/features/countries/pages/EditCountryPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/countries/$id/edit")({
  beforeLoad: createPermissionGuard("COUNTRY_UPDATE"),
  pendingComponent: PageLoader,
  component: EditCountryPage,
})
