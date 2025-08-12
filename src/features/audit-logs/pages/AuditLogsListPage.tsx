import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { AuditLogDataGrid } from "../components/AuditLogDataGrid"
import { useAuditLog } from "../hooks/useAuditLog"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { SearchAuditLogRequest } from "@/shared/api/types.gen"
import { zSearchAuditLogRequest } from "@/shared/api/zod.gen"

export function AuditLogsListPage() {
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useAuditLog()

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("auditLogs.title")}
          totalCountText={t("auditLogs.totalCount", { count: totalItems })}
          addButtonText={t("auditLogs.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("auditLogs.title") }]}
          totalItems={totalItems}
        />
      }
      filter={
        <BaseFilter<SearchAuditLogRequest>
          schema={zSearchAuditLogRequest}
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
      content={<AuditLogDataGrid />}
    />
  )
}
