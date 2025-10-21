import { createFileRoute } from "@tanstack/react-router"
import { AssignProfileToUserPage } from "@/features/users/pages/AssignProfileToUserPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

export const Route = createFileRoute("/_protected/access-control/users/$id/assign")({
  beforeLoad: createPermissionGuard("USER_UPDATE"),
  component: AssignProfileToUserPage,
})
