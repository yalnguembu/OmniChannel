import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchBalancesReadModelRequest } from "@/shared/api/types.gen"
import { zSearchBalancesReadModelRequest } from "@/shared/api/zod.gen"
import { BalancesReadModelDataGrid } from "../components/BalancesReadModelDataGrid"
import { useBalancesReadModel } from "../hooks/useBalancesReadModel"

export function BalancesReadModelsListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useBalancesReadModel()

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("balancesReadModels.title")}
          addButtonText={t("balancesReadModels.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("balancesReadModels.title") }]}
        />
      }
      filter={
        <BaseFilter<SearchBalancesReadModelRequest>
          schema={zSearchBalancesReadModelRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
        />
      }
      content={<BalancesReadModelDataGrid />}
    />
  )
}
