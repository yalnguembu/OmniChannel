import { createFileRoute } from "@tanstack/react-router"
import { CreateUserProfilePage } from "@/features/user-profiles/pages/CreateUserProfilePage"

export const Route = createFileRoute("/_protected/access-control/user-profiles/add")({
  component: CreateUserProfilePage,
})
