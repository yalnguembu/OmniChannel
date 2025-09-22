import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchVwTransactionsSummaryRequest } from "@/shared/api/types.gen"
import { zSearchVwTransactionsSummaryRequest } from "@/shared/api/zod.gen"
import { VwTransactionsSummaryDataGrid } from "../components/VwTransactionsSummaryDataGrid"
import { useVwTransactionsSummary } from "../hooks/useVwTransactionsSummary"

export function VwTransactionsSummarysListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useVwTransactionsSummary()

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
          title={t("vwTransactionsSummarys.title")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("vwTransactionsSummarys.title") }]}
        />
      }
      filter={
        <BaseFilter<SearchVwTransactionsSummaryRequest>
          schema={zSearchVwTransactionsSummaryRequest}
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
          fieldTranslationPrefix="vwTransactionsSummarys"
        />
      }
      content={<VwTransactionsSummaryDataGrid />}
    />
  )
}
