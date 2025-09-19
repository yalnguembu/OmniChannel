import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useCurrency } from "../hooks/useCurrency"
import { CurrencyDataGridEntry } from "../lib/data-grid/CurrencyDataGridEntry"

export const CurrencyDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    currencys,
    currentPage,
    searchCurrencies,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    changePage,
    changeSort,
    deleteCurrency,
    bulkDeleteMutation,
  } = useCurrency()

  useEffect(() => {
    searchCurrencies()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "name",
      label: t("currencies.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "symbol",
      label: t("currencies.headers.symbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "code",
      label: t("currencies.headers.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "decimalPlaces",
      label: t("currencies.headers.decimalPlaces"),
      sortable: true,
      resizable: true,
    },
    {
      key: "exchangeRate",
      label: t("currencies.headers.exchangeRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isBaseCurrency",
      label: t("currencies.headers.isBaseCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("currencies.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("currencies.headers.createdAt"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("currencies.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return currencys.map((item) => new CurrencyDataGridEntry(item))
  }, [currencys])

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/currencies/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("currencies.messages.delete.confirm"))) {
      deleteCurrency(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("currencies.bulk.deleteConfirm", { count: selectedRows.length }))) {
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

  const handlePageChange = (page: number) => {
    changePage(page)
  }

  const bulkActions = hasSelection
    ? [
        {
          label: bulkDeleteMutation.isPending ? t("currencies.bulk.deleting") : t("currencies.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("currencies.messages.noData")}
        enableSelection={false}
        selectedRows={selectedRows}
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
