import { createFileRoute } from "@tanstack/react-router"
import { UsersListPage } from "@/features/users/pages/UsersListPage"

export const Route = createFileRoute("/_protected/access-control/users/")({
  component: UsersListPage,
})
