import { createFileRoute } from "@tanstack/react-router"
import { CountrysListPage } from "@/features/country/pages/CountrysListPage"

export const Route = createFileRoute("/_protected/country/")({
  component: CountrysListPage,
})
