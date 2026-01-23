import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchSysLogRequest } from "@/shared/api/types.gen"
import { zSearchSysLogRequest } from "@/shared/api/zod.gen"
import { SysLogDataGrid } from "../components/SysLogDataGrid"
import { useSysLogList } from "../hooks/useSysLogList"
import { useSysLogMutations } from "../hooks/useSysLogMutations"

export function SysLogsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    sysLogs,
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
  } = useSysLogList()

  const { deleteMutation, bulkDeleteMutation } = useSysLogMutations()

  const handleCreate = () => {
    navigate({ to: `/sysLog/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("sysLog.title")}
          addButtonText={t("sysLog.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("sysLog.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchSysLogRequest>
          schema={zSearchSysLogRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="sysLog"
        />
      }
      content={
        <SysLogDataGrid
          sysLogs={sysLogs}
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
