import { createFileRoute } from "@tanstack/react-router"
import { EditCompanyPage } from "@/features/companies/pages/EditCompanyPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/companies/$id/edit")({
  beforeLoad: createPermissionGuard("COMPANY_UPDATE"),
  pendingComponent: PageLoader,
  component: EditCompanyPage,
})
