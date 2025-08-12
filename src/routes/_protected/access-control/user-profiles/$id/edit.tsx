import { createFileRoute } from "@tanstack/react-router"
import { EditUserProfilePage } from "@/features/user-profiles/pages/EditUserProfilePage"

export const Route = createFileRoute("/_protected/access-control/user-profiles/$id/edit")({
  component: EditUserProfilePage,
})
