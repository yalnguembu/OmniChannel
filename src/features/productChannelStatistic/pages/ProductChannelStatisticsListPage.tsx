import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchProductChannelStatisticRequest } from "@/shared/api/types.gen"
import { zSearchProductChannelStatisticRequest } from "@/shared/api/zod.gen"
import { ProductChannelStatisticDataGrid } from "../components/ProductChannelStatisticDataGrid"
import { useProductChannelStatisticList } from "../hooks/useProductChannelStatisticList"
import { useProductChannelStatisticMutations } from "../hooks/useProductChannelStatisticMutations"

export function ProductChannelStatisticsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    productChannelStatistics,
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
  } = useProductChannelStatisticList()

  const { deleteMutation, bulkDeleteMutation } = useProductChannelStatisticMutations()

  const handleCreate = () => {
    navigate({ to: `/productChannelStatistic/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("productChannelStatistic.title")}
          addButtonText={t("productChannelStatistic.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("productChannelStatistic.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchProductChannelStatisticRequest>
          schema={zSearchProductChannelStatisticRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="productChannelStatistic"
        />
      }
      content={
        <ProductChannelStatisticDataGrid
          productChannelStatistics={productChannelStatistics}
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
