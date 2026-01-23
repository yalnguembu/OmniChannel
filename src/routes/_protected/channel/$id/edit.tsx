import { createFileRoute } from "@tanstack/react-router"
import { EditChannelPage } from "@/features/channel/pages/EditChannelPage"

export const Route = createFileRoute("/_protected/channel/$id/edit")({
  component: EditChannelPage,
})
