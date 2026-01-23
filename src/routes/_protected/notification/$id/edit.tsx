import { createFileRoute } from "@tanstack/react-router"
import { EditNotificationPage } from "@/features/notification/pages/EditNotificationPage"

export const Route = createFileRoute("/_protected/notification/$id/edit")({
  component: EditNotificationPage,
})
