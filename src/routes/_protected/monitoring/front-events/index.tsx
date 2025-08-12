import { createFileRoute } from "@tanstack/react-router"
import { FrontEventLogsListPage } from "@/features/front-event-logs/pages/FrontEventLogsListPage"

export const Route = createFileRoute("/_protected/monitoring/front-events/")({
  component: FrontEventLogsListPage,
})
