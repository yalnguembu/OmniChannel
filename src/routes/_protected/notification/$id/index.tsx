import { createFileRoute } from "@tanstack/react-router"
import { NotificationDetailsPage } from "@/features/notification/pages/NotificationDetailsPage"

export const Route = createFileRoute("/_protected/notification/$id/")({
  component: NotificationDetailsPage,
})
