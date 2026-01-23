import { createFileRoute } from "@tanstack/react-router"
import { UserProfilesListPage } from "@/features/userProfile/pages/UserProfilesListPage"

export const Route = createFileRoute("/_protected/userProfile/")({
  component: UserProfilesListPage,
})
