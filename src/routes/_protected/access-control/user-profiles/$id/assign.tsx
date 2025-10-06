import { createFileRoute } from "@tanstack/react-router"
import { AssignPermissionToProfilePage } from "@/features/user-profiles/pages/AssignPermissionToProfilePage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/user-profiles/$id/assign")({
  beforeLoad: createPermissionGuard("USERPROFILE_UPDATE"),
  component: AssignPermissionToProfilePage,
  pendingComponent: PageLoader,
})
