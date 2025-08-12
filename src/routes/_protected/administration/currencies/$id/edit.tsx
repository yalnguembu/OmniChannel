import { createFileRoute } from "@tanstack/react-router"
import { EditCurrencyPage } from "@/features/currencies/pages/EditCurrencyPage"

export const Route = createFileRoute("/_protected/administration/currencies/$id/edit")({
  component: EditCurrencyPage,
})
