import { createFileRoute } from "@tanstack/react-router"
import { UserDevicesListPage } from "@/features/user-devices/pages/UserDevicesListPage"

export const Route = createFileRoute("/_protected/audit-security/user-devices")({
  component: UserDevicesListPage,
})
