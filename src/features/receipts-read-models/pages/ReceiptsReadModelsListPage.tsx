import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchReceiptsReadModelRequest } from "@/shared/api/types.gen"
import { zSearchReceiptsReadModelRequest } from "@/shared/api/zod.gen"
import { ReceiptsReadModelDataGrid } from "../components/ReceiptsReadModelDataGrid"
import { useReceiptsReadModel } from "../hooks/useReceiptsReadModel"
import { useEffect } from "react"

export function ReceiptsReadModelsListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters, searchReceiptsReadModels } = useReceiptsReadModel()

  const handleImport = () => {
    // Implement import logic
  }

  const handleExport = () => {
    // Implement export logic
  }

  useEffect(() => {
    searchReceiptsReadModels()
  }, [])

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader title={t("receiptsReadModels.title")} breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("receiptsReadModels.title") }]} />
      }
      filter={
        <BaseFilter<SearchReceiptsReadModelRequest>
          schema={zSearchReceiptsReadModelRequest}
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
          fieldTranslationPrefix="receiptsReadModels"
        />
      }
      content={<ReceiptsReadModelDataGrid />}
    />
  )
}
