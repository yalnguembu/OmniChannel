import { createFileRoute } from "@tanstack/react-router"
import { UserProfileDetailsPage } from "@/features/user-profiles/pages/UserProfileDetailsPage"

export const Route = createFileRoute("/_protected/access-control/user-profiles/$id/")({
  component: UserProfileDetailsPage,
})
