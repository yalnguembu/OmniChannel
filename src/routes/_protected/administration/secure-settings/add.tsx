import { createFileRoute } from "@tanstack/react-router"
import { CreateSecureSettingPage } from "@/features/secure-settings/pages/CreateSecureSettingPage"

export const Route = createFileRoute("/_protected/administration/secure-settings/add")({
  component: CreateSecureSettingPage,
})
