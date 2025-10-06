import { createFileRoute } from "@tanstack/react-router"
import { CreateCompanyAppLimitPage } from "@/features/company-app-limits/pages/CreateCompanyAppLimitPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/company-app-limits/add")({
  beforeLoad: createPermissionGuard("COMPANYAPPLIMIT_CREATE"),
  pendingComponent: PageLoader,
  component: CreateCompanyAppLimitPage,
})
