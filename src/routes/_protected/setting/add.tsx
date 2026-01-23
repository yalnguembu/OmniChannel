import { createFileRoute } from "@tanstack/react-router"
import { CreateSettingPage } from "@/features/setting/pages/CreateSettingPage"

export const Route = createFileRoute("/_protected/setting/add")({
  component: CreateSettingPage,
})
