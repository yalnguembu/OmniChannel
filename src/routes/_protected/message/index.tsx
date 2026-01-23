import { createFileRoute } from "@tanstack/react-router"
import { MessagesListPage } from "@/features/message/pages/MessagesListPage"

export const Route = createFileRoute("/_protected/message/")({
  component: MessagesListPage,
})
