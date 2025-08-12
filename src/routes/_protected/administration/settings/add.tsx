import { createFileRoute } from "@tanstack/react-router"
import { CreateSettingPage } from "@/features/settings/pages/CreateSettingPage"

export const Route = createFileRoute("/_protected/administration/settings/add")({
  component: CreateSettingPage,
})
