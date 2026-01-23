import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchClientImportRequest } from "@/shared/api/types.gen"
import { zSearchClientImportRequest } from "@/shared/api/zod.gen"
import { ClientImportDataGrid } from "../components/ClientImportDataGrid"
import { useClientImportList } from "../hooks/useClientImportList"
import { useClientImportMutations } from "../hooks/useClientImportMutations"

export function ClientImportsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    clientImports,
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
  } = useClientImportList()

  const { deleteMutation, bulkDeleteMutation } = useClientImportMutations()

  const handleCreate = () => {
    navigate({ to: `/clientImport/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("clientImport.title")}
          addButtonText={t("clientImport.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("clientImport.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchClientImportRequest>
          schema={zSearchClientImportRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="clientImport"
        />
      }
      content={
        <ClientImportDataGrid
          clientImports={clientImports}
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
