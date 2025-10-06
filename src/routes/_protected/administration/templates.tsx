import { createFileRoute } from "@tanstack/react-router"
import { SmsmailTemplatesListPage } from "@/features/smsmail-templates/pages/SmsMailTemplatesListPage"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/templates")({
  pendingComponent: PageLoader,
  component: SmsmailTemplatesListPage,
})
