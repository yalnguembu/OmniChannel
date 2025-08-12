import { createFileRoute } from "@tanstack/react-router"
import { LogsListPage } from "@/features/system-logs/pages/LogsListPage"

export const Route = createFileRoute("/_protected/monitoring/system-logs")({
  component: LogsListPage,
})
