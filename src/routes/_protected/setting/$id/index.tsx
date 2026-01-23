import { createFileRoute } from "@tanstack/react-router"
import { SettingDetailsPage } from "@/features/setting/pages/SettingDetailsPage"

export const Route = createFileRoute("/_protected/setting/$id/")({
  component: SettingDetailsPage,
})
