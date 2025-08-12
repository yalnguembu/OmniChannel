import { createFileRoute } from "@tanstack/react-router"
import { UserDetailsPage } from "@/features/users/pages/UserDetailsPage"

export const Route = createFileRoute("/_protected/access-control/users/$id/")({
  component: UserDetailsPage,
})
