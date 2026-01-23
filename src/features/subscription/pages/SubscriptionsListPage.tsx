import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchSubscriptionRequest } from "@/shared/api/types.gen"
import { zSearchSubscriptionRequest } from "@/shared/api/zod.gen"
import { SubscriptionDataGrid } from "../components/SubscriptionDataGrid"
import { useSubscriptionList } from "../hooks/useSubscriptionList"
import { useSubscriptionMutations } from "../hooks/useSubscriptionMutations"

export function SubscriptionsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    subscriptions,
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
  } = useSubscriptionList()

  const { deleteMutation, bulkDeleteMutation } = useSubscriptionMutations()

  const handleCreate = () => {
    navigate({ to: `/subscription/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("subscription.title")}
          addButtonText={t("subscription.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("subscription.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchSubscriptionRequest>
          schema={zSearchSubscriptionRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="subscription"
        />
      }
      content={
        <SubscriptionDataGrid
          subscriptions={subscriptions}
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
