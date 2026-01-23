import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchIntegrationRequest } from "@/shared/api/types.gen"
import { zSearchIntegrationRequest } from "@/shared/api/zod.gen"
import { IntegrationDataGrid } from "../components/IntegrationDataGrid"
import { useIntegrationList } from "../hooks/useIntegrationList"
import { useIntegrationMutations } from "../hooks/useIntegrationMutations"

export function IntegrationsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    integrations,
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
  } = useIntegrationList()

  const { deleteMutation, bulkDeleteMutation } = useIntegrationMutations()

  const handleCreate = () => {
    navigate({ to: `/integration/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("integration.title")}
          addButtonText={t("integration.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("integration.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchIntegrationRequest>
          schema={zSearchIntegrationRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="integration"
        />
      }
      content={
        <IntegrationDataGrid
          integrations={integrations}
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
