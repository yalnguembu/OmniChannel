import { createFileRoute } from "@tanstack/react-router"
import { CompanyChannelsListPage } from "@/features/companyChannel/pages/CompanyChannelsListPage"

export const Route = createFileRoute("/_protected/companyChannel/")({
  component: CompanyChannelsListPage,
})
