import { createFileRoute } from "@tanstack/react-router"
import { SecureSettingsListPage } from "@/features/secureSetting/pages/SecureSettingsListPage"

export const Route = createFileRoute("/_protected/secureSetting/")({
  component: SecureSettingsListPage,
})
