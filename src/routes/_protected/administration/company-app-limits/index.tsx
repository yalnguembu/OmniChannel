import { createFileRoute } from "@tanstack/react-router"
import { CompanyAppLimitsListPage } from "@/features/company-app-limits/pages/CompanyAppLimitsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/company-app-limits/")({
  beforeLoad: createPermissionGuard("COMPANYAPPLIMIT_VIEW"),
  pendingComponent: PageLoader,
  component: CompanyAppLimitsListPage,
})
