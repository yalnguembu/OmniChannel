import { createFileRoute } from "@tanstack/react-router"
import { CountriesListPage } from "@/features/countries/pages/CountriesListPage"

export const Route = createFileRoute("/_protected/administration/countries/")({
  component: CountriesListPage,
})
