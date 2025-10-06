import { createFileRoute } from "@tanstack/react-router"
import { EditSettingPage } from "@/features/settings/pages/EditSettingPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/settings/$id/edit")({
  beforeLoad: createPermissionGuard("SETTING_UPDATE"),
  pendingComponent: PageLoader,
  component: EditSettingPage,
})
