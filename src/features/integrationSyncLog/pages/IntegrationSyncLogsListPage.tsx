import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchIntegrationSyncLogRequest } from "@/shared/api/types.gen"
import { zSearchIntegrationSyncLogRequest } from "@/shared/api/zod.gen"
import { IntegrationSyncLogDataGrid } from "../components/IntegrationSyncLogDataGrid"
import { useIntegrationSyncLogList } from "../hooks/useIntegrationSyncLogList"
import { useIntegrationSyncLogMutations } from "../hooks/useIntegrationSyncLogMutations"

export function IntegrationSyncLogsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    integrationSyncLogs,
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
  } = useIntegrationSyncLogList()

  const { deleteMutation, bulkDeleteMutation } = useIntegrationSyncLogMutations()

  const handleCreate = () => {
    navigate({ to: `/integrationSyncLog/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("integrationSyncLog.title")}
          addButtonText={t("integrationSyncLog.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("integrationSyncLog.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchIntegrationSyncLogRequest>
          schema={zSearchIntegrationSyncLogRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="integrationSyncLog"
        />
      }
      content={
        <IntegrationSyncLogDataGrid
          integrationSyncLogs={integrationSyncLogs}
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
