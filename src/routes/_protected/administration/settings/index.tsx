import { createFileRoute } from "@tanstack/react-router"
import { SettingsListPage } from "@/features/settings/pages/SettingsListPage"

export const Route = createFileRoute("/_protected/administration/settings/")({
  component: SettingsListPage,
})
