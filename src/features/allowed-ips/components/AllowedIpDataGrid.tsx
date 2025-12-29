import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useAllowedIp } from "../hooks/useAllowedIp"
import { AllowedIpDataGridEntry } from "../lib/data-grid/AllowedIpDataGridEntry"
export const AllowedIpDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    allowedIps,
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
  } = useAllowedIp()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("allowedips.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("allowedips.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationStatus",
      label: t("allowedips.headers.applicationStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationId",
      label: t("allowedips.headers.applicationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("allowedips.headers.ipAddress"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("allowedIps.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return allowedIps.map((item) => new AllowedIpDataGridEntry(item))
  }, [allowedIps])

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
        emptyMessage={t("allowedIps.messages.noData")}
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
