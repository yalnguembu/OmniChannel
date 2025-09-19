import { createFileRoute } from "@tanstack/react-router"
import { ChartsUsageGuide } from "@/features/dashboard/pages/ChartsUsageGuide"

export const Route = createFileRoute("/_protected/charts-guide")({
  component: ChartsUsageGuide,
})
