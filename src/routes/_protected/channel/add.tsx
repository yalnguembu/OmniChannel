import { createFileRoute } from "@tanstack/react-router"
import { CreateChannelPage } from "@/features/channel/pages/CreateChannelPage"

export const Route = createFileRoute("/_protected/channel/add")({
  component: CreateChannelPage,
})
