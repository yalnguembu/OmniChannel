import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useReceiptsReadModel } from "../hooks/useReceiptsReadModel"
import { ReceiptsReadModelDataGridEntry } from "../lib/data-grid/ReceiptsReadModelDataGridEntry"

export const ReceiptsReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    receiptsReadModels,
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
    bulkDeleteMutation,
  } = useReceiptsReadModel()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "amount",
      label: t("receiptsreadmodels.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("receiptsreadmodels.headers.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("receiptsreadmodels.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("receiptsreadmodels.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerFeeAmount",
      label: t("receiptsreadmodels.headers.providerFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "internalFeeAmount",
      label: t("receiptsreadmodels.headers.internalFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "feeAppliedAmount",
      label: t("receiptsreadmodels.headers.feeAppliedAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "netAmount",
      label: t("receiptsreadmodels.headers.netAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "phoneNumberEncrypted",
      label: t("receiptsreadmodels.headers.phoneNumberEncrypted"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalReference",
      label: t("receiptsreadmodels.headers.externalReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerReference",
      label: t("receiptsreadmodels.headers.providerReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transactionId",
      label: t("receiptsreadmodels.headers.transactionId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("receiptsreadmodels.headers.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodCode",
      label: t("receiptsreadmodels.headers.paymentMethodCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("receiptsreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("receiptsReadModels.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return receiptsReadModels.map((item) => new ReceiptsReadModelDataGridEntry(item))
  }, [receiptsReadModels])

  const handleView = (id: string) => {
    navigate({ to: `/payments/receipts/${id}` })
  }

  const handleEdit = (id: string) => {
    console.log(id)
    // navigate({ to: `/payments/receipts/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    console.log(id)
    if (confirm(t("receiptsReadModels.messages.delete.confirm"))) {
      // deleteReceiptsReadModel(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("receiptsReadModels.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("receiptsReadModels.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("receiptsReadModels.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("receiptsReadModels.actions.delete")}
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
          label: bulkDeleteMutation.isPending ? t("receiptsReadModels.bulk.deleting") : t("receiptsReadModels.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("receiptsReadModels.messages.noData")}
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
