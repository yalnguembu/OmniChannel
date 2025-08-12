import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useSetting } from "../hooks/useSetting"
import { SettingDataGridEntry } from "../lib/data-grid/SettingDataGridEntry"

export const SettingDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    settings,
    searchSettings,
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
    deleteSetting,
    bulkDeleteMutation,
  } = useSetting()

  useEffect(() => {
    searchSettings()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "companyName",
      label: t("settings.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("settings.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "value",
      label: t("settings.headers.value"),
      sortable: true,
      resizable: true,
    },
    {
      key: "dataType",
      label: t("settings.headers.dataType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isEncrypted",
      label: t("settings.headers.isEncrypted"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("settings.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "category",
      label: t("settings.headers.category"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isReadOnly",
      label: t("settings.headers.isReadOnly"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isSystemSetting",
      label: t("settings.headers.isSystemSetting"),
      sortable: true,
      resizable: true,
    },
    {
      key: "allowedValues",
      label: t("settings.headers.allowedValues"),
      sortable: true,
      resizable: true,
    },
    {
      key: "validationRegex",
      label: t("settings.headers.validationRegex"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("settings.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("settings.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return settings.map((item) => new SettingDataGridEntry(item))
  }, [settings])

  const handleView = (id: string) => {
    navigate({ to: `/administration/settings/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/settings/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("settings.messages.delete.confirm"))) {
      deleteSetting(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("settings.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
          label: bulkDeleteMutation.isPending ? t("settings.bulk.deleting") : t("settings.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("settings.messages.noData")}
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
