import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWebhookLogRequest } from "@/shared/api/types.gen"
import { zSearchWebhookLogRequest } from "@/shared/api/zod.gen"
import { WebhookLogDataGrid } from "../components/WebhookLogDataGrid"
import { useWebhookLog } from "../hooks/useWebhookLog"

export function WebhookLogsListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useWebhookLog()

  return (
    <StandardListPageLayout
      header={<ListPageHeader title={t("webhookLog.title")} breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("webhookLog.title") }]} />}
      filter={
        <BaseFilter<SearchWebhookLogRequest>
          schema={zSearchWebhookLogRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
        />
      }
      content={<WebhookLogDataGrid />}
    />
  )
}
