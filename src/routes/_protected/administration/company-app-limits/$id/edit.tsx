import { createFileRoute } from "@tanstack/react-router"
import { EditCompanyAppLimitPage } from "@/features/company-app-limits/pages/EditCompanyAppLimitPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/company-app-limits/$id/edit")({
  beforeLoad: createPermissionGuard("COMPANYAPPLIMIT_UPDATE"),
  pendingComponent: PageLoader,
  component: EditCompanyAppLimitPage,
})
