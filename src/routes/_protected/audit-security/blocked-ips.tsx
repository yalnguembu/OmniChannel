import { createFileRoute } from "@tanstack/react-router"
import { BlockedIpsListPage } from "@/features/blocked-ips/pages/BlockedIpsListPage"

export const Route = createFileRoute("/_protected/audit-security/blocked-ips")({
  component: BlockedIpsListPage,
})
