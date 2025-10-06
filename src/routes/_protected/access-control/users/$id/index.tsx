import { createFileRoute } from "@tanstack/react-router"
import { UserDetailsPage } from "@/features/users/pages/UserDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/users/$id/")({
  beforeLoad: createPermissionGuard("USER_VIEW"),
  component: UserDetailsPage,
  pendingComponent: PageLoader,
})
