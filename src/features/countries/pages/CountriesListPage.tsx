import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { CountryDataGrid } from "../components/CountryDataGrid"
import { useCountry } from "../hooks/useCountry"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCountryRequest } from "@/shared/api/types.gen"
import { zSearchCountryRequest } from "@/shared/api/zod.gen"
import { useEffect } from "react"

export function CountriesListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, searchCountries, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useCountry()

  const handleCreate = () => {
    navigate({ to: `/administration/countries/add` })
  }

  useEffect(() => {
    searchCountries()
  }, [])

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("countries.title")}
          addButtonText={t("countries.actions.add")}
          breadcrumbs={[{ label: t("menu.administration"), href: "/dashboard" }, { label: t("countries.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCountryRequest>
          schema={zSearchCountryRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="countries"
        />
      }
      content={<CountryDataGrid />}
    />
  )
}
