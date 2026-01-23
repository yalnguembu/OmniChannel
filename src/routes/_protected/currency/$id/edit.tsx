import { createFileRoute } from "@tanstack/react-router"
import { EditCurrencyPage } from "@/features/currency/pages/EditCurrencyPage"

export const Route = createFileRoute("/_protected/currency/$id/edit")({
  component: EditCurrencyPage,
})
