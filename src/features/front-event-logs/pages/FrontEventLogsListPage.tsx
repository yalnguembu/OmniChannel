import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { FrontEventLogDataGrid } from "../components/FrontEventLogDataGrid"
import { useFrontEventLog } from "../hooks/useFrontEventLog"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { SearchFrontEventLogRequest } from "@/shared/api/types.gen"
import { zSearchFrontEventLogRequest } from "@/shared/api/zod.gen"

export function FrontEventLogsListPage() {
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useFrontEventLog()

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("frontEventLogs.title")}
          totalCountText={t("frontEventLogs.totalCount", { count: totalItems })}
          addButtonText={t("frontEventLogs.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("frontEventLogs.title") }]}
          totalItems={totalItems}
        />
      }
      filter={
        <BaseFilter<SearchFrontEventLogRequest>
          schema={zSearchFrontEventLogRequest}
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
      content={
        <>
          <FrontEventLogDataGrid />
        </>
      }
    />
  )
}
