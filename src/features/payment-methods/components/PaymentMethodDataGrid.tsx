import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { usePaymentMethod } from "../hooks/usePayMentmethod"
import { PaymentMethodDataGridEntry } from "../lib/data-grid/PaymentMethodDataGridEntry"

export const PaymentMethodDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    paymentMethods,
    currentPage,
    searchPaymentMethods,
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
    deletePaymentMethod,
    bulkDeleteMutation,
  } = usePaymentMethod()

  useEffect(() => {
    searchPaymentMethods()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("paymentmethods.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "code",
      label: t("paymentmethods.headers.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("paymentmethods.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("paymentmethods.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "logoUrl",
      label: t("paymentmethods.headers.logoUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "requiresPhoneNumber",
      label: t("paymentmethods.headers.requiresPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "minimumAmount",
      label: t("paymentmethods.headers.minimumAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maximumAmount",
      label: t("paymentmethods.headers.maximumAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "settlementPeriod",
      label: t("paymentmethods.headers.settlementPeriod"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("paymentmethods.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "sortOrder",
      label: t("paymentmethods.headers.sortOrder"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("paymentMethods.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return paymentMethods.map((item) => new PaymentMethodDataGridEntry(item))
  }, [paymentMethods])

  const handleView = (id: string) => {
    navigate({ to: `/administration/payment-methods/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/payment-methods/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("paymentMethods.messages.delete.confirm"))) {
      deletePaymentMethod(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("paymentMethods.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
          label: bulkDeleteMutation.isPending ? t("paymentMethods.bulk.deleting") : t("paymentMethods.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("paymentMethods.messages.noData")}
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
        actions={["view", "edit", "delete"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
