import { createFileRoute } from "@tanstack/react-router"
import { CreateSecureSettingPage } from "@/features/secure-settings/pages/CreateSecureSettingPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/secure-settings/add")({
  beforeLoad: createPermissionGuard("SECURESETTING_CREATE"),
  pendingComponent: PageLoader,
  component: CreateSecureSettingPage,
})
