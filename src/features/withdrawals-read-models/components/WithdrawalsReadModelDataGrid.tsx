import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useWithdrawalsReadModel } from "../hooks/useWithdrawalsReadModel"
import { WithdrawalsReadModelDataGridEntry } from "../lib/data-grid/WithdrawalsReadModelDataGridEntry"

export const WithdrawalsReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const { withdrawalsReadModels, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changePageSize, changeSort, setSelectedRows } =
    useWithdrawalsReadModel()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "withdrawalMethodName",
      label: t("withdrawalsreadmodels.headers.withdrawalMethodName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("withdrawalsreadmodels.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("withdrawalsreadmodels.headers.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("withdrawalsreadmodels.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("withdrawalsreadmodels.headers.companyName"),
      sortable: true,
      resizable: true,
    },

    {
      key: "providerFeeAmount",
      label: t("withdrawalsreadmodels.headers.providerFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "internalFeeAmount",
      label: t("withdrawalsreadmodels.headers.internalFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "feeAppliedAmount",
      label: t("withdrawalsreadmodels.headers.feeAppliedAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "netAmount",
      label: t("withdrawalsreadmodels.headers.netAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "verificationAttempts",
      label: t("withdrawalsreadmodels.headers.verificationAttempts"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerReference",
      label: t("withdrawalsreadmodels.headers.providerReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transactionId",
      label: t("withdrawalsreadmodels.headers.transactionId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("withdrawalsreadmodels.headers.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "accountNumber",
      label: t("withdrawalsreadmodels.headers.accountNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodName",
      label: t("withdrawalsreadmodels.headers.paymentMethodName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("withdrawalsreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("withdrawalsReadModels.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return withdrawalsReadModels.map((item) => new WithdrawalsReadModelDataGridEntry(item))
  }, [withdrawalsReadModels])

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
        emptyMessage={t("withdrawalsReadModels.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        bulkActions={bulkActions}
        dispatch={() => {}}
      />
    </div>
  )
}
