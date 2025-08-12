import { createFileRoute } from "@tanstack/react-router"
import { SecureSettingsListPage } from "@/features/secure-settings/pages/SecureSettingsListPage"

export const Route = createFileRoute("/_protected/administration/secure-settings/")({
  component: SecureSettingsListPage,
})
