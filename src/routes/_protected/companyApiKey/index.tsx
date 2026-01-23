import { createFileRoute } from "@tanstack/react-router"
import { CompanyApiKeysListPage } from "@/features/companyApiKey/pages/CompanyApiKeysListPage"

export const Route = createFileRoute("/_protected/companyApiKey/")({
  component: CompanyApiKeysListPage,
})
