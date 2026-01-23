import { createFileRoute } from "@tanstack/react-router"
import { CreateNotificationPage } from "@/features/notification/pages/CreateNotificationPage"

export const Route = createFileRoute("/_protected/notification/add")({
  component: CreateNotificationPage,
})
