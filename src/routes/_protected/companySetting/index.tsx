import { createFileRoute } from "@tanstack/react-router"
import { CompanySettingsListPage } from "@/features/companySetting/pages/CompanySettingsListPage"

export const Route = createFileRoute("/_protected/companySetting/")({
  component: CompanySettingsListPage,
})
