import { createFileRoute } from "@tanstack/react-router"
import { UsersListPage } from "@/features/user/pages/UsersListPage"

export const Route = createFileRoute("/_protected/user/")({
  component: UsersListPage,
})
