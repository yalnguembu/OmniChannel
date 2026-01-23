import { createFileRoute } from "@tanstack/react-router"
import { SettingsListPage } from "@/features/setting/pages/SettingsListPage"

export const Route = createFileRoute("/_protected/setting/")({
  component: SettingsListPage,
})
