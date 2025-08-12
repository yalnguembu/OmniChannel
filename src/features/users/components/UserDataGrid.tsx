import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useUser } from "../hooks/useUser"
import { UserDataGridEntry } from "../lib/data-grid/UserDataGridEntry"

export const UserDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    users,
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
    deleteUser,
    bulkDeleteMutation,
  } = useUser()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("users.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("users.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "profileName",
      label: t("users.headers.profileName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "publicId",
      label: t("users.headers.publicId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "firstName",
      label: t("users.headers.firstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastName",
      label: t("users.headers.lastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "email",
      label: t("users.headers.email"),
      sortable: true,
      resizable: true,
    },
    {
      key: "phoneNumber",
      label: t("users.headers.phoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userType",
      label: t("users.headers.userType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("users.headers.status"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("common.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return users.map((item) => new UserDataGridEntry(item))
  }, [users])

  const handleView = (id: string) => {
    navigate({ to: `/access-control/user/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/access-control/user/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("users.messages.delete.confirm"))) {
      deleteUser(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("users.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("common.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("common.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.actions.delete")}
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
          label: bulkDeleteMutation.isPending ? t("users.bulk.deleting") : t("users.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("users.messages.noData")}
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
