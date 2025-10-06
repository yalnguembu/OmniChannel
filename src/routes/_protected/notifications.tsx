import { createFileRoute } from "@tanstack/react-router"
import { NotificationsListPage } from "@/features/notifications/pages/NotificationsListPage"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/notifications")({
  pendingComponent: PageLoader,
  component: NotificationsListPage,
})
