import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchAuditLogRequest } from "@/shared/api/types.gen"
import { zSearchAuditLogRequest } from "@/shared/api/zod.gen"
import { AuditLogDataGrid } from "../components/AuditLogDataGrid"
import { useAuditLogList } from "../hooks/useAuditLogList"
import { useAuditLogMutations } from "../hooks/useAuditLogMutations"

export function AuditLogsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    auditLogs,
    paginationMetadata,
    isLoading,
    viewMode,
    selectedRows,
    sortBy,
    sortDirection,
    setViewMode,
    setSelectedRows,
    clearSelection,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
  } = useAuditLogList()

  const { deleteMutation, bulkDeleteMutation } = useAuditLogMutations()

  const handleCreate = () => {
    navigate({ to: `/auditLog/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("auditLog.title")}
          addButtonText={t("auditLog.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("auditLog.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchAuditLogRequest>
          schema={zSearchAuditLogRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="auditLog"
        />
      }
      content={
        <AuditLogDataGrid
          auditLogs={auditLogs}
          paginationMetadata={paginationMetadata}
          isLoading={isLoading}
          viewMode={viewMode}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onPageChange={handlePageChange}
          onSortChange={changeSort}
          onDelete={(id) => deleteMutation.mutate({ path: { id } })}
          onBulkDelete={() => bulkDeleteMutation.mutate(selectedRows)}
          isDeleting={deleteMutation.isPending || bulkDeleteMutation.isPending}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      }
    />
  )
}
