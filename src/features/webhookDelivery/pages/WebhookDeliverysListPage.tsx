import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWebhookDeliveryRequest } from "@/shared/api/types.gen"
import { zSearchWebhookDeliveryRequest } from "@/shared/api/zod.gen"
import { WebhookDeliveryDataGrid } from "../components/WebhookDeliveryDataGrid"
import { useWebhookDeliveryList } from "../hooks/useWebhookDeliveryList"
import { useWebhookDeliveryMutations } from "../hooks/useWebhookDeliveryMutations"

export function WebhookDeliverysListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    webhookDeliverys,
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
  } = useWebhookDeliveryList()

  const { deleteMutation, bulkDeleteMutation } = useWebhookDeliveryMutations()

  const handleCreate = () => {
    navigate({ to: `/webhookDelivery/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("webhookDelivery.title")}
          addButtonText={t("webhookDelivery.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("webhookDelivery.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchWebhookDeliveryRequest>
          schema={zSearchWebhookDeliveryRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="webhookDelivery"
        />
      }
      content={
        <WebhookDeliveryDataGrid
          webhookDeliverys={webhookDeliverys}
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
