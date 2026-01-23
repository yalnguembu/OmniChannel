import { createFileRoute } from "@tanstack/react-router"
import { SysLogDetailsPage } from "@/features/sysLog/pages/SysLogDetailsPage"

export const Route = createFileRoute("/_protected/sysLog/$id/")({
  component: SysLogDetailsPage,
})
