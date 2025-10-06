import { createFileRoute } from "@tanstack/react-router"
import { CreateCompanyPage } from "@/features/companies/pages/CreateCompanyPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/companies/add")({
  beforeLoad: createPermissionGuard("COMPANY_CREATE"),
  pendingComponent: PageLoader,
  component: CreateCompanyPage,
})
