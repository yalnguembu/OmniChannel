import { createFileRoute } from "@tanstack/react-router"
import { SmsmailTemplatesListPage } from "@/features/smsmail-templates/pages/SmsMailTemplatesListPage"

export const Route = createFileRoute("/_protected/administration/templates")({
  component: SmsmailTemplatesListPage,
})
