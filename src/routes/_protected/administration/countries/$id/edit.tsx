import { createFileRoute } from "@tanstack/react-router"
import { EditCountryPage } from "@/features/countries/pages/EditCountryPage"

export const Route = createFileRoute("/_protected/administration/countries/$id/edit")({
  component: EditCountryPage,
})
