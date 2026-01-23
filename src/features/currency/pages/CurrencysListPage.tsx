import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCurrencyRequest } from "@/shared/api/types.gen"
import { zSearchCurrencyRequest } from "@/shared/api/zod.gen"
import { CurrencyDataGrid } from "../components/CurrencyDataGrid"
import { useCurrencyList } from "../hooks/useCurrencyList"
import { useCurrencyMutations } from "../hooks/useCurrencyMutations"

export function CurrencysListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    currencys,
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
  } = useCurrencyList()

  const { deleteMutation, bulkDeleteMutation } = useCurrencyMutations()

  const handleCreate = () => {
    navigate({ to: `/currency/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("currency.title")}
          addButtonText={t("currency.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("currency.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCurrencyRequest>
          schema={zSearchCurrencyRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="currency"
        />
      }
      content={
        <CurrencyDataGrid
          currencys={currencys}
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
