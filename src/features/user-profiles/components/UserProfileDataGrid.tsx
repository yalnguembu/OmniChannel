import React, { useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort, ACTION } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useUserProfile } from "../hooks/useUserProfile"
import { UserProfileDataGridEntry } from "../lib/data-grid/UserProfileDataGridEntry"

export const UserProfileDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    userProfiles,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    changePage,
    changeSort,
    setSelectedRows,
    deleteUserProfile,
    bulkDeleteMutation,
    searchUserProfiles,
  } = useUserProfile()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "name",
      label: t("userprofiles.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("userprofiles.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "permissions",
      label: t("userprofiles.headers.permissions"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isSystemProfile",
      label: t("userprofiles.headers.isSystemProfile"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "isActive",
      label: t("userprofiles.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("userprofiles.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("userProfile.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return userProfiles.map((item) => new UserProfileDataGridEntry(item))
  }, [userProfiles])

  useEffect(() => {
    searchUserProfiles()
  }, [])

  const handleView = (id: string) => {
    navigate({ to: `/access-control/user-profiles/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/access-control/user-profiles/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("userProfile.messages.delete.confirm"))) {
      deleteUserProfile(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("userProfile.bulk.deleteConfirm", { count: selectedRows.length }))) {
      bulkDeleteMutation.mutate(selectedRows)
    }
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "view":
        handleView(id)
        break
      case "edit":
        handleEdit(id)
        break
      case "delete":
        handleDelete(id)
        break
    }
  }

  const sortConfig: DataGridSort | undefined = sortBy
    ? {
        column: sortBy,
        direction: sortDirection === "desc" ? SortDirection.DESC : SortDirection.ASC,
      }
    : undefined

  const handleSortChange = (config: DataGridSort) => {
    const direction = config.direction
    changeSort(config.column, direction)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds)
  }

  const handlePageChange = (page: number) => {
    changePage(page)
  }

  const bulkActions = hasSelection
    ? [
        {
          label: bulkDeleteMutation.isPending ? t("userProfile.bulk.deleting") : t("userProfile.bulk.delete", { count: selectedRows.length }),
          action: handleBulkDelete,
          variant: "destructive" as const,
          loading: bulkDeleteMutation.isPending,
        },
      ]
    : undefined

  return (
    <div className="w-full max-w-full overflow-hidden">
      <DataGrid
        columnHeaders={columnHeaders}
        items={gridItems}
        total={totalItems}
        page={currentPage}
        limit={pageSize}
        hasPagination={true}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage={t("userProfile.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        bulkActions={bulkActions}
        dispatch={handleDispatch}
      />
    </div>
  )
}
