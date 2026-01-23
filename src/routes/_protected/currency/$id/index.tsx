import { createFileRoute } from "@tanstack/react-router"
import { CurrencyDetailsPage } from "@/features/currency/pages/CurrencyDetailsPage"

export const Route = createFileRoute("/_protected/currency/$id/")({
  component: CurrencyDetailsPage,
})
