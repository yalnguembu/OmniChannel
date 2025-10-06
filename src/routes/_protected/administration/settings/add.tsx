import { createFileRoute } from "@tanstack/react-router"
import { CreateSettingPage } from "@/features/settings/pages/CreateSettingPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/settings/add")({
  beforeLoad: createPermissionGuard("SETTING_CREATE"),
  pendingComponent: PageLoader,
  component: CreateSettingPage,
})
