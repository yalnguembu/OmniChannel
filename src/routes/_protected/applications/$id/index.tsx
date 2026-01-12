import { createFileRoute } from "@tanstack/react-router"
import { ApplicationDetailsPage } from "@/features/applications/pages/ApplicationDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/applications/$id/")({
  beforeLoad: createPermissionGuard("APPLICATION_VIEW"),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
    }
  },
  pendingComponent: PageLoader,
  component: ApplicationDetailsPage,
})
