import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWithdrawalMethodRequest } from "@/shared/api/types.gen"
import { zSearchWithdrawalMethodRequest } from "@/shared/api/zod.gen"
import { WithdrawalMethodDataGrid } from "../components/WithdrawalMethodDataGrid"
import { useWithdrawalMethod } from "../hooks/useWithdrawalMethod"

export function WithdrawalMethodsListPage() {
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useWithdrawalMethod()

  const handleCreate = () => {}

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("withdrawalMethods.title")}
          totalCountText={t("withdrawalMethods.totalCount", { count: totalItems })}
          addButtonText={t("withdrawalMethods.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("withdrawalMethods.title") }]}
          totalItems={totalItems}
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
