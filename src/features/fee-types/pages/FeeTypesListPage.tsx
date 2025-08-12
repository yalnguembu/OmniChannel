import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchFeeTypeRequest } from "@/shared/api/types.gen"
import { zSearchFeeTypeRequest } from "@/shared/api/zod.gen"
import { FeeTypeDataGrid } from "../components/FeeTypeDataGrid"
import { useFeeType } from "../hooks/useFeeType"

export function FeeTypesListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useFeeType()

  const handleCreate = () => {
    navigate({ to: `/administration/fee-types/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("feeTypes.title")}
          totalCountText={t("feeTypes.totalCount", { count: totalItems })}
          addButtonText={t("feeTypes.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("feeTypes.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchFeeTypeRequest>
          schema={zSearchFeeTypeRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="feeTypes"
        />
      }
      content={<FeeTypeDataGrid />}
    />
  )
}
