import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { LogDataGrid } from "../components/LogDataGrid"
import { useLog } from "../hooks/useLog"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { SearchLogRequest } from "@/shared"
import { zSearchLogRequest } from "@/shared/api/zod.gen"

export function LogsListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useLog()

  return (
    <StandardListPageLayout
      header={<ListPageHeader title={t("logs.title")} breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("logs.title") }]} />}
      filter={
        <BaseFilter<SearchLogRequest>
          schema={zSearchLogRequest}
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
      content={<LogDataGrid />}
    />
  )
}
