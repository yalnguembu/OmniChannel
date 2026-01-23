import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchConnectorRequest } from "@/shared/api/types.gen"
import { zSearchConnectorRequest } from "@/shared/api/zod.gen"
import { ConnectorDataGrid } from "../components/ConnectorDataGrid"
import { useConnectorList } from "../hooks/useConnectorList"
import { useConnectorMutations } from "../hooks/useConnectorMutations"

export function ConnectorsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    connectors,
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
  } = useConnectorList()

  const { deleteMutation, bulkDeleteMutation } = useConnectorMutations()

  const handleCreate = () => {
    navigate({ to: `/connector/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("connector.title")}
          description={t("connector.description")}
          addButtonText={t("connector.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("connector.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchConnectorRequest>
          schema={zSearchConnectorRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="connector"
        />
      }
      content={
        <ConnectorDataGrid
          connectors={connectors}
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
