import { useTranslation } from "react-i18next"
import { createFileRoute } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { DashboardPage } from "@/features/dashboard/page"

const QuickActionsPage = () => {
  const { t } = useTranslation()

  return (
    <StandardListPageLayout
      header={<ListPageHeader title={t("menu.Dashboard")} />}
      content={
        <div className="lg:-mt-4 xl:-mt-5">
          <DashboardPage />
        </div>
      }
    />
  )
}

export const Route = createFileRoute("/_protected/dashboard")({
  component: QuickActionsPage,
})
