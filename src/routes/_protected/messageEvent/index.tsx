import { createFileRoute } from "@tanstack/react-router"
import { MessageEventsListPage } from "@/features/messageEvent/pages/MessageEventsListPage"

export const Route = createFileRoute("/_protected/messageEvent/")({
  component: MessageEventsListPage,
})
