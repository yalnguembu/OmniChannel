import { createFileRoute } from "@tanstack/react-router"
import { ApplicationsListPage } from "@/features/companies/pages/ApplicationsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/applications/")({
  beforeLoad: createPermissionGuard("APPLICATION_VIEW"),
  pendingComponent: PageLoader,
  component: ApplicationsListPage,
})
