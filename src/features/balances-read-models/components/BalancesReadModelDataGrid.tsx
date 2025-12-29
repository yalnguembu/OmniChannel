import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useBalancesReadModel } from "../hooks/useBalancesReadModel"
import { BalancesReadModelDataGridEntry } from "../lib/data-grid/BalancesReadModelDataGridEntry"

export const BalancesReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    balancesReadModels,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
  } = useBalancesReadModel()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("balancesreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "balanceTypeName",
      label: t("balancesreadmodels.headers.balanceTypeName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "balanceTypeCode",
      label: t("balancesreadmodels.headers.balanceTypeCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByFirstName",
      label: t("balancesreadmodels.headers.createdByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByLastName",
      label: t("balancesreadmodels.headers.createdByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByPhoneNumber",
      label: t("balancesreadmodels.headers.createdByPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByStatus",
      label: t("balancesreadmodels.headers.createdByStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByEmail",
      label: t("balancesreadmodels.headers.createdByEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyName",
      label: t("balancesreadmodels.headers.currencyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("balancesreadmodels.headers.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyCode",
      label: t("balancesreadmodels.headers.currencyCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationByFirstName",
      label: t("balancesreadmodels.headers.lastReconciliationByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationByLastName",
      label: t("balancesreadmodels.headers.lastReconciliationByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationByPhoneNumber",
      label: t("balancesreadmodels.headers.lastReconciliationByPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationByStatus",
      label: t("balancesreadmodels.headers.lastReconciliationByStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationByEmail",
      label: t("balancesreadmodels.headers.lastReconciliationByEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodName",
      label: t("balancesreadmodels.headers.paymentMethodName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodCode",
      label: t("balancesreadmodels.headers.paymentMethodCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByFirstName",
      label: t("balancesreadmodels.headers.updatedByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByLastName",
      label: t("balancesreadmodels.headers.updatedByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByPhoneNumber",
      label: t("balancesreadmodels.headers.updatedByPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByStatus",
      label: t("balancesreadmodels.headers.updatedByStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByEmail",
      label: t("balancesreadmodels.headers.updatedByEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodId",
      label: t("balancesreadmodels.headers.paymentMethodId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "balanceType",
      label: t("balancesreadmodels.headers.balanceType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ownerType",
      label: t("balancesreadmodels.headers.ownerType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ownerId",
      label: t("balancesreadmodels.headers.ownerId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("balancesreadmodels.headers.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currentBalance",
      label: t("balancesreadmodels.headers.currentBalance"),
      sortable: true,
      resizable: true,
    },
    {
      key: "availableBalance",
      label: t("balancesreadmodels.headers.availableBalance"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reservedBalance",
      label: t("balancesreadmodels.headers.reservedBalance"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastCreditDate",
      label: t("balancesreadmodels.headers.lastCreditDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastDebitDate",
      label: t("balancesreadmodels.headers.lastDebitDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transactionCount",
      label: t("balancesreadmodels.headers.transactionCount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalCredits",
      label: t("balancesreadmodels.headers.totalCredits"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalDebits",
      label: t("balancesreadmodels.headers.totalDebits"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationDate",
      label: t("balancesreadmodels.headers.lastReconciliationDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastReconciliationBy",
      label: t("balancesreadmodels.headers.lastReconciliationBy"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reconciliationNotes",
      label: t("balancesreadmodels.headers.reconciliationNotes"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reconciliationStatus",
      label: t("balancesreadmodels.headers.reconciliationStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ownerName",
      label: t("balancesreadmodels.headers.ownerName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currentVersion",
      label: t("balancesreadmodels.headers.currentVersion"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("balancesReadModels.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return balancesReadModels.map((item) => new BalancesReadModelDataGridEntry(item))
  }, [balancesReadModels])

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
        emptyMessage={t("balancesReadModels.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => { }}
        dispatch={() => { }}
      />
    </div>
  )
}
