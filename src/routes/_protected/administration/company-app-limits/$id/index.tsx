import { createFileRoute } from "@tanstack/react-router"
import { CompanyAppLimitDetailsPage } from "@/features/company-app-limits/pages/CompanyAppLimitDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/company-app-limits/$id/")({
  beforeLoad: createPermissionGuard("COMPANYAPPLIMIT_VIEW"),
  pendingComponent: PageLoader,
  component: CompanyAppLimitDetailsPage,
})
