import { createFileRoute } from "@tanstack/react-router"
import { CompanysListPage } from "@/features/companies/pages/CompaniesListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/companies/")({
  beforeLoad: createPermissionGuard("COMPANY_VIEW"),
  pendingComponent: PageLoader,
  component: CompanysListPage,
})
