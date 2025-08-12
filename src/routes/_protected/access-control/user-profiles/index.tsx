import { createFileRoute } from "@tanstack/react-router"
import { UserProfilesListPage } from "@/features/user-profiles/pages/UserProfilesListPage"

export const Route = createFileRoute("/_protected/access-control/user-profiles/")({
  component: UserProfilesListPage,
})
