import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useVwTransactionsSummary } from "../hooks/useVwTransactionsSummary"
import { VwTransactionsSummaryDataGridEntry } from "../lib/data-grid/VwTransactionsSummaryDataGridEntry"

export const VwTransactionsSummaryDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const { vwTransactionsSummarys, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changePageSize, changeSort, setSelectedRows } =
    useVwTransactionsSummary()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "aggregateType",
      label: t("vwtransactionssummaries.headers.aggregateType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "aggregateId",
      label: t("vwtransactionssummaries.headers.aggregateId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalReference",
      label: t("vwtransactionssummaries.headers.externalReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerInitialReference",
      label: t("vwtransactionssummaries.headers.providerInitialReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerFinalReference",
      label: t("vwtransactionssummaries.headers.providerFinalReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("vwtransactionssummaries.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("vwtransactionssummaries.headers.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("vwtransactionssummaries.headers.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedAt",
      label: t("vwtransactionssummaries.headers.updatedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodName",
      label: t("vwtransactionssummaries.headers.paymentMethodName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodCode",
      label: t("vwtransactionssummaries.headers.paymentMethodCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("vwtransactionssummaries.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("vwtransactionssummaries.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("vwtransactionssummaries.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("vwTransactionsSummarys.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return vwTransactionsSummarys.map((item) => new VwTransactionsSummaryDataGridEntry(item))
  }, [vwTransactionsSummarys])

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

  const bulkActions = undefined

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
        emptyMessage={t("vwTransactionsSummarys.messages.noData")}
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
        dispatch={() => {}}
      />
    </div>
  )
}
