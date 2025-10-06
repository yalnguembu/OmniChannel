import { createFileRoute } from "@tanstack/react-router"
import { UserProfilePage } from "@/features/settings/pages/UserProfilePage"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/settings/profile")({
  pendingComponent: PageLoader,
  component: UserProfilePage,
})
