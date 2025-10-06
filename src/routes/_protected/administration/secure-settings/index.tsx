import { createFileRoute } from "@tanstack/react-router"
import { SecureSettingsListPage } from "@/features/secure-settings/pages/SecureSettingsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/secure-settings/")({
  beforeLoad: createPermissionGuard("SECURESETTING_VIEW"),
  pendingComponent: PageLoader,
  component: SecureSettingsListPage,
})
