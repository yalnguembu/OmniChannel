import { createFileRoute } from "@tanstack/react-router"
import { EditSecureSettingPage } from "@/features/secure-settings/pages/EditSecureSettingPage"

export const Route = createFileRoute("/_protected/administration/secure-settings/$system-name/edit")({
  component: EditSecureSettingPage,
})
