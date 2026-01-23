import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchSubscriptionPlanRequest } from "@/shared/api/types.gen"
import { zSearchSubscriptionPlanRequest } from "@/shared/api/zod.gen"
import { SubscriptionPlanDataGrid } from "../components/SubscriptionPlanDataGrid"
import { useSubscriptionPlanList } from "../hooks/useSubscriptionPlanList"
import { useSubscriptionPlanMutations } from "../hooks/useSubscriptionPlanMutations"

export function SubscriptionPlansListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    subscriptionPlans,
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
  } = useSubscriptionPlanList()

  const { deleteMutation, bulkDeleteMutation } = useSubscriptionPlanMutations()

  const handleCreate = () => {
    navigate({ to: `/subscriptionPlan/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("subscriptionPlan.title")}
          addButtonText={t("subscriptionPlan.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("subscriptionPlan.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchSubscriptionPlanRequest>
          schema={zSearchSubscriptionPlanRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="subscriptionPlan"
        />
      }
      content={
        <SubscriptionPlanDataGrid
          subscriptionPlans={subscriptionPlans}
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
