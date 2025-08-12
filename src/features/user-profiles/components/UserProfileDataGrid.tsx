import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
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
  } = useUserProfile()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("userprofiles.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
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
    },
    {
      key: "isActive",
      label: t("userprofiles.headers.isActive"),
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

  const handleView = (id: string) => {
    navigate({ to: `/userProfile/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/userProfile/${id}/edit` })
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

  const renderCell = (item: DataGridRowEntry, columnKey: string) => {
    switch (columnKey) {
      case "actions":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(item.getId())}>
                <Eye className="mr-2 h-4 w-4" />
                {t("userProfile.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("userProfile.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("userProfile.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      default:
        return item.getTextFor(columnKey) || "N/A"
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
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        bulkActions={bulkActions}
        renderCell={renderCell}
      />
    </div>
  )
}
