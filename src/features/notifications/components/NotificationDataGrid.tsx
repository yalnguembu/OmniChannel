import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useNotification } from "../hooks/useNotification"
import { NotificationDataGridEntry } from "../lib/data-grid/NotificationDataGridEntry"

export const NotificationDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    notifications,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    deleteNotification,
    bulkDeleteMutation,
  } = useNotification()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("notifications.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("notifications.headers.companyName"),
      sortable: true,
      resizable: true,
    },

    {
      key: "templateType",
      label: t("notifications.headers.templateType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userFirstName",
      label: t("notifications.headers.userFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userLastName",
      label: t("notifications.headers.userLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userPhoneNumber",
      label: t("notifications.headers.userPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userStatus",
      label: t("notifications.headers.userStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userEmail",
      label: t("notifications.headers.userEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("notifications.headers.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "priority",
      label: t("notifications.headers.priority"),
      sortable: true,
      resizable: true,
    },
    {
      key: "canal",
      label: t("notifications.headers.canal"),
      sortable: true,
      resizable: true,
    },
    {
      key: "title",
      label: t("notifications.headers.title"),
      sortable: true,
      resizable: true,
    },
    {
      key: "message",
      label: t("notifications.headers.message"),
      sortable: true,
      resizable: true,
    },
    {
      key: "data",
      label: t("notifications.headers.data"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isRead",
      label: t("notifications.headers.isRead"),
      sortable: true,
      resizable: true,
    },
    {
      key: "readAt",
      label: t("notifications.headers.readAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "expiresAt",
      label: t("notifications.headers.expiresAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedAt",
      label: t("notifications.headers.updatedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdBy",
      label: t("notifications.headers.createdBy"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("notification.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return notifications.map((item) => new NotificationDataGridEntry(item))
  }, [notifications])

  const handleView = (id: string) => {
    navigate({ to: `/notification/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/notification/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("notification.messages.delete.confirm"))) {
      deleteNotification(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("notification.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("notification.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("notification.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("notification.actions.delete")}
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

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  const bulkActions = hasSelection
    ? [
        {
          label: bulkDeleteMutation.isPending ? t("notification.bulk.deleting") : t("notification.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("notification.messages.noData")}
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
