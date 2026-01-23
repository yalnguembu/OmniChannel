import { createFileRoute } from "@tanstack/react-router"
import { SysLogsListPage } from "@/features/sysLog/pages/SysLogsListPage"

export const Route = createFileRoute("/_protected/sysLog/")({
  component: SysLogsListPage,
})
