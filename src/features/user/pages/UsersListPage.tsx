import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchUserRequest } from "@/shared/api/types.gen"
import { zSearchUserRequest } from "@/shared/api/zod.gen"
import { UserDataGrid } from "../components/UserDataGrid"
import { useUserList } from "../hooks/useUserList"
import { useUserMutations } from "../hooks/useUserMutations"

export function UsersListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    users,
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
  } = useUserList()

  const { deleteMutation, bulkDeleteMutation } = useUserMutations()

  const handleCreate = () => {
    navigate({ to: `/user/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("user.title")}
          addButtonText={t("user.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("user.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchUserRequest>
          schema={zSearchUserRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="user"
        />
      }
      content={
        <UserDataGrid
          users={users}
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
