import { AnalyticsPage } from "@/features/analytics/page"
import { useTranslation } from "react-i18next"
import { createFileRoute } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import PageLoader from "@/shared/components/PageLoader"

const Analytics = () => {
  const { t } = useTranslation()

  return (
    <StandardListPageLayout
      header={<ListPageHeader title={t("menu.analytics")} />}
      content={
        <div className="lg:-mt-4 xl:-mt-5">
          <AnalyticsPage />
        </div>
      }
    />
  )
}

export const Route = createFileRoute("/_protected/analytics")({
  pendingComponent: PageLoader,
  component: Analytics,
})
