import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWalletRequest } from "@/shared/api/types.gen"
import { zSearchWalletRequest } from "@/shared/api/zod.gen"
import { WalletDataGrid } from "../components/WalletDataGrid"
import { useWalletList } from "../hooks/useWalletList"
import { useWalletMutations } from "../hooks/useWalletMutations"

export function WalletsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    wallets,
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
  } = useWalletList()

  const { deleteMutation, bulkDeleteMutation } = useWalletMutations()

  const handleCreate = () => {
    navigate({ to: `/wallet/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("wallet.title")}
          addButtonText={t("wallet.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("wallet.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchWalletRequest>
          schema={zSearchWalletRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="wallet"
        />
      }
      content={
        <WalletDataGrid
          wallets={wallets}
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
