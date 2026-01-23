import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCampaignRequest } from "@/shared/api/types.gen"
import { zSearchCampaignRequest } from "@/shared/api/zod.gen"
import { CampaignDataGrid } from "../components/CampaignDataGrid"
import { useCampaignList } from "../hooks/useCampaignList"
import { useCampaignMutations } from "../hooks/useCampaignMutations"

export function CampaignsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    campaigns,
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
  } = useCampaignList()

  const { deleteMutation, bulkDeleteMutation } = useCampaignMutations()

  const handleCreate = () => {
    navigate({ to: `/campaign/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("campaign.title")}
          addButtonText={t("campaign.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("campaign.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCampaignRequest>
          schema={zSearchCampaignRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="campaign"
        />
      }
      content={
        <CampaignDataGrid
          campaigns={campaigns}
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
