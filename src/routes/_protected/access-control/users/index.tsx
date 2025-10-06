import { createFileRoute } from "@tanstack/react-router"
import { UsersListPage } from "@/features/users/pages/UsersListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected/access-control/users/")({
  beforeLoad: createPermissionGuard("USER_VIEW"),
  component: UsersListPage,
  pendingComponent: PageLoader,
})
