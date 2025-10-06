import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
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
    changePageSize,
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
      style: "max-w-[100px]",
      width: 150,
    },
    {
      key: "transactionType",
      label: t("feetypes.headers.transactionType"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "description",
      label: t("feetypes.headers.description"),
      sortable: true,
      resizable: true,
      width: 150,
    },
    {
      key: "isActive",
      label: t("feetypes.headers.isActive"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "createdAt",
      label: t("feetypes.headers.createdAt"),
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

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/fee-types/${id}/edit` })
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

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "edit":
        handleEdit(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
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
        enableSelection={false}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        bulkActions={bulkActions}
        actions={["edit", "delete"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
