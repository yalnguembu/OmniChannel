import { createFileRoute } from "@tanstack/react-router"
import { CompanyDetailsPage } from "@/features/companies/pages/CompanyDetailsPage"

export const Route = createFileRoute("/_protected/companies/$id/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
    }
  },
  component: CompanyDetailsPage,
})
