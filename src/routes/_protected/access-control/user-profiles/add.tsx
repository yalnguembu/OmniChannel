import { createFileRoute } from "@tanstack/react-router"
import { CreateUserProfilePage } from "@/features/user-profiles/pages/CreateUserProfilePage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/user-profiles/add")({
  beforeLoad: createPermissionGuard("USERPROFILE_CREATE"),
  component: CreateUserProfilePage,
  pendingComponent: PageLoader,
})
