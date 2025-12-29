import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useFundTransfersReadModel } from "../hooks/useFundTransfersReadModel"
import { FundTransfersReadModelDataGridEntry } from "../lib/data-grid/FundTransfersReadModelDataGridEntry"

export const FundTransfersReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    fundTransfersReadModels,
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
  } = useFundTransfersReadModel()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "companyName",
      label: t("fundtransfersreadmodels.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByFirstName",
      label: t("fundtransfersreadmodels.headers.createdByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByLastName",
      label: t("fundtransfersreadmodels.headers.createdByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByPhoneNumber",
      label: t("fundtransfersreadmodels.headers.createdByPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("fundtransfersreadmodels.headers.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "destinationApplicationName",
      label: t("fundtransfersreadmodels.headers.destinationApplicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "sourceApplicationName",
      label: t("fundtransfersreadmodels.headers.sourceApplicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByFirstName",
      label: t("fundtransfersreadmodels.headers.updatedByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "updatedByLastName",
      label: t("fundtransfersreadmodels.headers.updatedByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "publicId",
      label: t("fundtransfersreadmodels.headers.publicId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transferType",
      label: t("fundtransfersreadmodels.headers.transferType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("fundtransfersreadmodels.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("fundtransfersreadmodels.headers.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "internalFeeAmount",
      label: t("fundtransfersreadmodels.headers.internalFeeAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "feeAppliedAmount",
      label: t("fundtransfersreadmodels.headers.feeAppliedAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "netAmount",
      label: t("fundtransfersreadmodels.headers.netAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("fundtransfersreadmodels.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reference",
      label: t("fundtransfersreadmodels.headers.reference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("fundtransfersreadmodels.headers.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currentVersion",
      label: t("fundtransfersreadmodels.headers.currentVersion"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("fundtransfersreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("fundTransfersReadModels.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return fundTransfersReadModels.map((item) => new FundTransfersReadModelDataGridEntry(item))
  }, [fundTransfersReadModels])

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
        emptyMessage={t("fundTransfersReadModels.messages.noData")}
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
