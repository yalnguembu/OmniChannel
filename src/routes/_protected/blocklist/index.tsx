import { createFileRoute } from "@tanstack/react-router"
import { BlocklistsListPage } from "@/features/blocklist/pages/BlocklistsListPage"

export const Route = createFileRoute("/_protected/blocklist/")({
  component: BlocklistsListPage,
})
