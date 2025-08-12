import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { CurrencyDataGrid } from "../components/CurrencyDataGrid"
import { useCurrency } from "../hooks/useCurrency"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCurrencyRequest } from "@/shared/api/types.gen"
import { zSearchCurrencyRequest } from "@/shared/api/zod.gen"

export function CurrencysListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useCurrency()

  const handleCreate = () => {
    navigate({ to: `/administration/currencies/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("currencies.title")}
          totalCountText={t("currencies.totalCount", { count: totalItems })}
          addButtonText={t("currencies.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("currencies.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCurrencyRequest>
          schema={zSearchCurrencyRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="currencies"
        />
      }
      content={<CurrencyDataGrid />}
    />
  )
}
