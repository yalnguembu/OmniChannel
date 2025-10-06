import { createFileRoute } from "@tanstack/react-router"
import { CompanyDetailsPage } from "@/features/companies/pages/CompanyDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/companies/$id/")({
  beforeLoad: createPermissionGuard("COMPANY_VIEW"),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
    }
  },
  pendingComponent: PageLoader,
  component: CompanyDetailsPage,
})
