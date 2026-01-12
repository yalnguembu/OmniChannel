import { createFileRoute } from "@tanstack/react-router"
import { CompaniesListPage } from "@/features/companies/pages/CompaniesListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/companies/")({
  beforeLoad: createPermissionGuard("COMPANY_VIEW"),
  pendingComponent: PageLoader,
  component: CompaniesListPage,
})
