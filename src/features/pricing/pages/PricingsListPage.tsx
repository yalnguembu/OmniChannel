import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchPricingRequest } from "@/shared/api/types.gen"
import { zSearchPricingRequest } from "@/shared/api/zod.gen"
import { PricingDataGrid } from "../components/PricingDataGrid"
import { usePricingList } from "../hooks/usePricingList"
import { usePricingMutations } from "../hooks/usePricingMutations"

export function PricingsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    pricings,
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
  } = usePricingList()

  const { deleteMutation, bulkDeleteMutation } = usePricingMutations()

  const handleCreate = () => {
    navigate({ to: `/pricing/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("pricing.title")}
          addButtonText={t("pricing.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("pricing.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchPricingRequest>
          schema={zSearchPricingRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="pricing"
        />
      }
      content={
        <PricingDataGrid
          pricings={pricings}
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
