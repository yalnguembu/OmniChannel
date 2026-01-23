import { createFileRoute } from "@tanstack/react-router"
import { ChannelsListPage } from "@/features/channel/pages/ChannelsListPage"

export const Route = createFileRoute("/_protected/channel/")({
  component: ChannelsListPage,
})
