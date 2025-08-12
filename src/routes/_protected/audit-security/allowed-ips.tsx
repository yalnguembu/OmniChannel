import { createFileRoute } from "@tanstack/react-router"
import { AllowedIpsListPage } from "@/features/allowed-ips/pages/AllowedIpsListPage"

export const Route = createFileRoute("/_protected/audit-security/allowed-ips")({
  component: AllowedIpsListPage,
})
