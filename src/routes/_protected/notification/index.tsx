import { createFileRoute } from "@tanstack/react-router"
import { NotificationsListPage } from "@/features/notification/pages/NotificationsListPage"

export const Route = createFileRoute("/_protected/notification/")({
  component: NotificationsListPage,
})
