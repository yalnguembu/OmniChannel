import { createFileRoute } from "@tanstack/react-router"
import { UserProfilesListPage } from "@/features/user-profiles/pages/UserProfilesListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/user-profiles/")({
  beforeLoad: createPermissionGuard("USERPROFILE_VIEW"),
  component: UserProfilesListPage,
  pendingComponent: PageLoader,
})
