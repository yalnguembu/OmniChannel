import { createFileRoute } from "@tanstack/react-router"
import { MessageDetailsPage } from "@/features/message/pages/MessageDetailsPage"

export const Route = createFileRoute("/_protected/message/$id/")({
  component: MessageDetailsPage,
})
