import { createFileRoute } from "@tanstack/react-router"
import { SettingsListPage } from "@/features/settings/pages/SettingsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/settings/")({
  beforeLoad: createPermissionGuard("SETTING_VIEW"),
  pendingComponent: PageLoader,
  component: SettingsListPage,
})
