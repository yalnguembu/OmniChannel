import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWithdrawalMethodRequest } from "@/shared/api/types.gen"
import { zSearchWithdrawalMethodRequest } from "@/shared/api/zod.gen"
import { WithdrawalMethodDataGrid } from "../components/WithdrawalMethodDataGrid"
import { useWithdrawalMethod } from "../hooks/useWithdrawalMethod"
import { useNavigate } from "@tanstack/react-router"

export function WithdrawalMethodsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useWithdrawalMethod()

  const handleCreate = () => {
    navigate({ to: `/administration/withdrawal-methods/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("withdrawalMethods.title")}
          addButtonText={t("withdrawalMethods.actions.add")}
          breadcrumbs={[{ label: t("menu.administration"), href: "/dashboard" }, { label: t("withdrawalMethods.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchWithdrawalMethodRequest>
          schema={zSearchWithdrawalMethodRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="withdrawalMethods"
        />
      }
      content={<WithdrawalMethodDataGrid />}
    />
  )
}
