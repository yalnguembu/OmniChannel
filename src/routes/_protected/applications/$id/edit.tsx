import { createFileRoute } from "@tanstack/react-router"
import { EditApplicationPage } from "@/features/companies/pages/EditApplicationPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/applications/$id/edit")({
  beforeLoad: createPermissionGuard("APPLICATION_UPDATE"),
  pendingComponent: PageLoader,
  component: EditApplicationPage,
})
