import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWithdrawalsReadModelRequest } from "@/shared/api/types.gen"
import { zSearchWithdrawalsReadModelRequest } from "@/shared/api/zod.gen"
import { WithdrawalsReadModelDataGrid } from "../components/WithdrawalsReadModelDataGrid"
import { useWithdrawalsReadModel } from "../hooks/useWithdrawalsReadModel"

export function WithdrawalsReadModelsListPage() {
  const { t } = useTranslation()
  const { isLoading, isError, error, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useWithdrawalsReadModel()

  const handleCreate = () => {
    // navigate({ to: `/transactions/withdrawals/` })
  }

  const handleImport = () => {
    // Implement import logic
  }

  const handleExport = () => {
    // Implement export logic
  }

  const mainContent = () => {
    if (isError && error) {
      // toast.error(t(error))
    }

    return <WithdrawalsReadModelDataGrid />
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("withdrawalsReadModels.title")}
          totalCountText={t("withdrawalsReadModels.totalCount", { count: totalItems })}
          addButtonText={t("withdrawalsReadModels.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("withdrawalsReadModels.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchWithdrawalsReadModelRequest>
          schema={zSearchWithdrawalsReadModelRequest}
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
          fieldTranslationPrefix="withdrawalsReadModels"
        />
      }
      content={mainContent()}
    />
  )
}
