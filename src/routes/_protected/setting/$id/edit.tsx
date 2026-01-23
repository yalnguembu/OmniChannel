import { createFileRoute } from "@tanstack/react-router"
import { EditSettingPage } from "@/features/setting/pages/EditSettingPage"

export const Route = createFileRoute("/_protected/setting/$id/edit")({
  component: EditSettingPage,
})
