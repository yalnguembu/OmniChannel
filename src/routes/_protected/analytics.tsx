import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsPage } from '@/features/analytics/page'

export const Route = createFileRoute('/_protected/analytics')({
  component: AnalyticsPage,
})