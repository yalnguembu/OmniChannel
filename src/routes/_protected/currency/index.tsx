import { createFileRoute } from "@tanstack/react-router"
import { CurrencysListPage } from "@/features/currency/pages/CurrencysListPage"

export const Route = createFileRoute("/_protected/currency/")({
  component: CurrencysListPage,
})
