import { createFileRoute } from "@tanstack/react-router"
import { ProductChannelsListPage } from "@/features/productChannel/pages/ProductChannelsListPage"

export const Route = createFileRoute("/_protected/productChannel/")({
  component: ProductChannelsListPage,
})
