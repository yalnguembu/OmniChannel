import { createFileRoute } from "@tanstack/react-router"
import { EditSecureSettingPage } from "@/features/secure-settings/pages/EditSecureSettingPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/secure-settings/$system-name/edit")({
  beforeLoad: createPermissionGuard("SECURESETTING_UPDATE"),
  pendingComponent: PageLoader,
  component: EditSecureSettingPage,
})
