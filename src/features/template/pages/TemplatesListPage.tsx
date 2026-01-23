import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchTemplateRequest } from "@/shared/api/types.gen"
import { zSearchTemplateRequest } from "@/shared/api/zod.gen"
import { TemplateDataGrid } from "../components/TemplateDataGrid"
import { useTemplateList } from "../hooks/useTemplateList"
import { useTemplateMutations } from "../hooks/useTemplateMutations"

export function TemplatesListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    templates,
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
  } = useTemplateList()

  const { deleteMutation, bulkDeleteMutation } = useTemplateMutations()

  const handleCreate = () => {
    navigate({ to: `/template/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("template.title")}
          addButtonText={t("template.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("template.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchTemplateRequest>
          schema={zSearchTemplateRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="template"
        />
      }
      content={
        <TemplateDataGrid
          templates={templates}
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
