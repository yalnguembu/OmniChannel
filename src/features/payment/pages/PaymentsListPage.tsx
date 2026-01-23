import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchPaymentRequest } from "@/shared/api/types.gen"
import { zSearchPaymentRequest } from "@/shared/api/zod.gen"
import { PaymentDataGrid } from "../components/PaymentDataGrid"
import { usePaymentList } from "../hooks/usePaymentList"
import { usePaymentMutations } from "../hooks/usePaymentMutations"

export function PaymentsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    payments,
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
  } = usePaymentList()

  const { deleteMutation, bulkDeleteMutation } = usePaymentMutations()

  const handleCreate = () => {
    navigate({ to: `/payment/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("payment.title")}
          addButtonText={t("payment.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("payment.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchPaymentRequest>
          schema={zSearchPaymentRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="payment"
        />
      }
      content={
        <PaymentDataGrid
          payments={payments}
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
