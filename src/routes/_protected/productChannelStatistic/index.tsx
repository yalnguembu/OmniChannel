import { createFileRoute } from "@tanstack/react-router"
import { ProductChannelStatisticsListPage } from "@/features/productChannelStatistic/pages/ProductChannelStatisticsListPage"

export const Route = createFileRoute("/_protected/productChannelStatistic/")({
  component: ProductChannelStatisticsListPage,
})
