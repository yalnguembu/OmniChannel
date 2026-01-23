import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchPaymentMethodRequest } from "@/shared/api/types.gen"
import { zSearchPaymentMethodRequest } from "@/shared/api/zod.gen"
import { PaymentMethodDataGrid } from "../components/PaymentMethodDataGrid"
import { usePaymentMethodList } from "../hooks/usePaymentMethodList"
import { usePaymentMethodMutations } from "../hooks/usePaymentMethodMutations"

export function PaymentMethodsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    paymentMethods,
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
  } = usePaymentMethodList()

  const { deleteMutation, bulkDeleteMutation } = usePaymentMethodMutations()

  const handleCreate = () => {
    navigate({ to: `/paymentMethod/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("paymentMethod.title")}
          addButtonText={t("paymentMethod.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("paymentMethod.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchPaymentMethodRequest>
          schema={zSearchPaymentMethodRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="paymentMethod"
        />
      }
      content={
        <PaymentMethodDataGrid
          paymentMethods={paymentMethods}
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
