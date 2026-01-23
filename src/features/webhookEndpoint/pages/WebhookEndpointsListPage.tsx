import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWebhookEndpointRequest } from "@/shared/api/types.gen"
import { zSearchWebhookEndpointRequest } from "@/shared/api/zod.gen"
import { WebhookEndpointDataGrid } from "../components/WebhookEndpointDataGrid"
import { useWebhookEndpointList } from "../hooks/useWebhookEndpointList"
import { useWebhookEndpointMutations } from "../hooks/useWebhookEndpointMutations"

export function WebhookEndpointsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    webhookEndpoints,
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
  } = useWebhookEndpointList()

  const { deleteMutation, bulkDeleteMutation } = useWebhookEndpointMutations()

  const handleCreate = () => {
    navigate({ to: `/webhookEndpoint/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("webhookEndpoint.title")}
          addButtonText={t("webhookEndpoint.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("webhookEndpoint.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchWebhookEndpointRequest>
          schema={zSearchWebhookEndpointRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="webhookEndpoint"
        />
      }
      content={
        <WebhookEndpointDataGrid
          webhookEndpoints={webhookEndpoints}
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
