import { createFileRoute } from "@tanstack/react-router"
import { UserProfileDetailsPage } from "@/features/user-profiles/pages/UserProfileDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/user-profiles/$id/")({
  beforeLoad: createPermissionGuard("USERPROFILE_VIEW"),
  component: UserProfileDetailsPage,
  pendingComponent: PageLoader,
})
