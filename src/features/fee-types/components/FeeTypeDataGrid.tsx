import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useFeeType } from "../hooks/useFeeType"
import { FeeTypeDataGridEntry } from "../lib/data-grid/FeeTypeDataGridEntry"

export const FeeTypeDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    feeTypes,
    currentPage,
    searchFeeTypes,
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
    deleteFeeType,
    bulkDeleteMutation,
  } = useFeeType()

  useEffect(() => {
    searchFeeTypes()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("feetypes.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "code",
      label: t("feetypes.headers.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("feetypes.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("feetypes.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transactionType",
      label: t("feetypes.headers.transactionType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("feetypes.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("feeTypes.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return feeTypes.map((item) => new FeeTypeDataGridEntry(item))
  }, [feeTypes])

  const handleView = (id: string) => {
    navigate({ to: `/feeType/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/feeType/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("feeTypes.messages.delete.confirm"))) {
      deleteFeeType(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("feeTypes.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("feeTypes.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("feeTypes.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("feeTypes.actions.delete")}
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
          label: bulkDeleteMutation.isPending ? t("feeTypes.bulk.deleting") : t("feeTypes.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("feeTypes.messages.noData")}
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
