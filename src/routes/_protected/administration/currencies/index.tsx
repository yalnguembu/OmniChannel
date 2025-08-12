import { createFileRoute } from "@tanstack/react-router"
import { CurrencysListPage } from "@/features/currencies/pages/CurrencysListPage"

export const Route = createFileRoute("/_protected/administration/currencies/")({
  component: CurrencysListPage,
})
