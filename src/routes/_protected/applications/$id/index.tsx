import { createFileRoute } from "@tanstack/react-router"
import { ApplicationDetailsPage } from "@/features/companies/pages/ApplicationDetailsPage"

export const Route = createFileRoute("/_protected/applications/$id/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
    }
  },
  component: ApplicationDetailsPage,
})
