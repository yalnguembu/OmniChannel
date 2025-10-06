import { createFileRoute } from "@tanstack/react-router"
import { EditUserProfilePage } from "@/features/user-profiles/pages/EditUserProfilePage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/user-profiles/$id/edit")({
  beforeLoad: createPermissionGuard("USERPROFILE_UPDATE"),
  component: EditUserProfilePage,
  pendingComponent: PageLoader,
})
