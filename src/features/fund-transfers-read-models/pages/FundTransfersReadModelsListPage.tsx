import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { FundTransfersReadModelDataGrid } from "../components/FundTransfersReadModelDataGrid"
import { useFundTransfersReadModel } from "../hooks/useFundTransfersReadModel"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { SearchFundTransfersReadModelRequest } from "@/shared"
import { zSearchFundTransfersReadModelRequest } from "@/shared/api/zod.gen"

export function FundTransfersReadModelsListPage() {
  const { t } = useTranslation()
  const { isLoading, applyFilters, clearFilters, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows } = useFundTransfersReadModel()

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("fundTransfersReadModels.title")}
          totalCountText={t("fundTransfersReadModels.totalCount", { count: totalItems })}
          addButtonText={t("fundTransfersReadModels.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("fundTransfersReadModels.title") }]}
          totalItems={totalItems}
        />
      }
      filter={
        <BaseFilter<SearchFundTransfersReadModelRequest>
          schema={zSearchFundTransfersReadModelRequest}
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
      content={<FundTransfersReadModelDataGrid />}
    />
  )
}
