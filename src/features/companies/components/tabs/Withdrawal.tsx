import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import { useWithdrawalsReadModel } from "@/features/withdrawals-read-models/hooks/useWithdrawalsReadModel"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchWithdrawalsReadModelRequest } from "@/shared/api/zod.gen"
import { SearchWithdrawalsReadModelRequest } from "@/shared"
import { CommonDataGridEntry, Entity } from "@/shared/components/data-grid/adapters/common"
import { Card, CardContent } from "@/shared/components/ui/card"

export function WithdrawalsTab({ companyId }: { companyId: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  console.log(companyId)

  const {
    withdrawalsReadModels,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    viewMode,
    setViewMode,
    refreshData,
    applyFilters,
    clearFilters,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
  } = useWithdrawalsReadModel()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "withdrawalMethodName",
      label: t("withdrawalsReadModels.headers.withdrawalMethodName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("withdrawalsReadModels.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("withdrawalsReadModels.headers.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("withdrawalsReadModels.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("withdrawalsReadModels.headers.companyName"),
      sortable: true,
      resizable: true,
    },

    {
      key: "providerFeeAmount",
      label: t("withdrawalsReadModels.headers.providerFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "internalFeeAmount",
      label: t("withdrawalsReadModels.headers.internalFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "feeAppliedAmount",
      label: t("withdrawalsReadModels.headers.feeAppliedAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "netAmount",
      label: t("withdrawalsReadModels.headers.netAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "verificationAttempts",
      label: t("withdrawalsReadModels.headers.verificationAttempts"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerReference",
      label: t("withdrawalsReadModels.headers.providerReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transactionId",
      label: t("withdrawalsReadModels.headers.transactionId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("withdrawalsReadModels.headers.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "accountNumber",
      label: t("withdrawalsReadModels.headers.accountNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodName",
      label: t("withdrawalsReadModels.headers.paymentMethodName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("withdrawalsReadModels.headers.createdAt"),
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
    return withdrawalsReadModels.map((item) => new CommonDataGridEntry(item as Entity))
  }, [withdrawalsReadModels])

  const handleView = (id: string) => {
    navigate({ to: `/transactions/withdrawals/${id}` })
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
                {t("withdrawals.actions.view")}
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

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchWithdrawalsReadModelRequest>
        schema={zSearchWithdrawalsReadModelRequest}
        onFilter={applyFilters}
        onReset={clearFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        refreshData={refreshData}
        isLoading={isLoading}
        hasSelection={hasSelection}
        selectedRows={selectedRows}
        selectionCount={selectedRows.length}
        defaultCollapsed={false}
        fieldTranslationPrefix="withdrawalsReadModels"
      />

      <Card>
        <CardContent>
          <DataGrid
            columnHeaders={columnHeaders}
            items={gridItems}
            total={totalItems}
            page={currentPage}
            limit={pageSize}
            hasPagination={true}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            emptyMessage={t("withdrawals.messages.noData")}
            enableSelection={true}
            selectedRows={selectedRows}
            onSelectionChange={handleSelectionChange}
            enableSorting={true}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            enableColumnVisibility={true}
            hiddenColumns={[]}
            onColumnVisibilityChange={() => {}}
            renderCell={renderCell}
          />
        </CardContent>
      </Card>
    </div>
  )
}
