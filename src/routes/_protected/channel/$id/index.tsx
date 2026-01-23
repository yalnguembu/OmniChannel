import { createFileRoute } from "@tanstack/react-router"
import { ChannelDetailsPage } from "@/features/channel/pages/ChannelDetailsPage"

export const Route = createFileRoute("/_protected/channel/$id/")({
  component: ChannelDetailsPage,
})
