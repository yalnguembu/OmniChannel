import { createFileRoute } from "@tanstack/react-router"
import { CreateCurrencyPage } from "@/features/currencies/pages/CreateCurrencyPage"

export const Route = createFileRoute("/_protected/administration/currencies/add")({
  component: CreateCurrencyPage,
})
