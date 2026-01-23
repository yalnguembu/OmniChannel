import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCompanyRequest } from "@/shared/api/types.gen"
import { zSearchCompanyRequest } from "@/shared/api/zod.gen"
import { CompanyDataGrid } from "../components/CompanyDataGrid"
import { useCompanyList } from "../hooks/useCompanyList"
import { useCompanyMutations } from "../hooks/useCompanyMutations"

export function CompanysListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    companys,
    paginationMetadata,
    isLoading,
    viewMode,
    selectedRows,
    sortBy,
    sortDirection,
    setViewMode,
    setSelectedRows,
    clearSelection,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
  } = useCompanyList()

  const { deleteMutation, bulkDeleteMutation } = useCompanyMutations()

  const handleCreate = () => {
    navigate({ to: `/company/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("company.title")}
          addButtonText={t("company.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("company.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCompanyRequest>
          schema={zSearchCompanyRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="company"
        />
      }
      content={
        <CompanyDataGrid
          companys={companys}
          paginationMetadata={paginationMetadata}
          isLoading={isLoading}
          viewMode={viewMode}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onPageChange={handlePageChange}
          onSortChange={changeSort}
          onDelete={(id) => deleteMutation.mutate({ path: { id } })}
          onBulkDelete={() => bulkDeleteMutation.mutate(selectedRows)}
          isDeleting={deleteMutation.isPending || bulkDeleteMutation.isPending}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      }
    />
  )
}
