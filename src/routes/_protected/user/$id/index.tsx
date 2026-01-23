import { createFileRoute } from "@tanstack/react-router"
import { UserDetailsPage } from "@/features/user/pages/UserDetailsPage"

export const Route = createFileRoute("/_protected/user/$id/")({
  component: UserDetailsPage,
})
