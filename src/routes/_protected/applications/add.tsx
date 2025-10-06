import { createFileRoute } from "@tanstack/react-router"
import { CreateApplicationPage } from "@/features/companies/pages/CreateApplicationPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/applications/add")({
  beforeLoad: createPermissionGuard("APPLICATION_CREATE"),
  pendingComponent: PageLoader,
  component: CreateApplicationPage,
})
