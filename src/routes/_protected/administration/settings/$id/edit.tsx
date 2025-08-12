import { createFileRoute } from "@tanstack/react-router"
import { EditSettingPage } from "@/features/settings/pages/EditSettingPage"

export const Route = createFileRoute("/_protected/administration/settings/$id/edit")({
  component: EditSettingPage,
})
