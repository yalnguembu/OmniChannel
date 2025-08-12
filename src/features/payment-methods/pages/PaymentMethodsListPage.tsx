import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchPaymentMethodRequest } from "@/shared/api/types.gen"
import { zSearchPaymentMethodRequest } from "@/shared/api/zod.gen"
import { PaymentMethodDataGrid } from "../components/PaymentMethodDataGrid"
import { usePaymentMethod } from "../hooks/usePayMentmethod"

export function PaymentMethodsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = usePaymentMethod()

  const handleCreate = () => {
    navigate({ to: `/administration/payment-methods/add` })
  }

  const handleImport = () => {
    // Implement import logic
  }

  const handleExport = () => {
    // Implement export logic
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("paymentMethods.title")}
          totalCountText={t("paymentMethods.totalCount", { count: totalItems })}
          addButtonText={t("paymentMethods.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("paymentMethods.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchPaymentMethodRequest>
          schema={zSearchPaymentMethodRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          onImport={handleImport}
          onExport={handleExport}
          fieldTranslationPrefix="paymentMethods"
        />
      }
      content={<PaymentMethodDataGrid />}
    />
  )
}
