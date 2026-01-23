import { createFileRoute } from "@tanstack/react-router"
import { MessageEventDetailsPage } from "@/features/messageEvent/pages/MessageEventDetailsPage"

export const Route = createFileRoute("/_protected/messageEvent/$id/")({
  component: MessageEventDetailsPage,
})
