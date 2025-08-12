import { createFileRoute } from "@tanstack/react-router"
import { CreateCountryPage } from "@/features/countries/pages/CreateCountryPage"

export const Route = createFileRoute("/_protected/administration/countries/add")({
  component: CreateCountryPage,
})
