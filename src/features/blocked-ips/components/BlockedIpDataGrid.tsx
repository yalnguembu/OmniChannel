import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useBlockedIp } from "../hooks/useBlockedIp"
import { BlockedIpDataGridEntry } from "../lib/data-grid/BlockedIpDataGridEntry"
export const BlockedIpDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    blockedIps,
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
  } = useBlockedIp()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("blockedips.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("blockedips.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationStatus",
      label: t("blockedips.headers.applicationStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationId",
      label: t("blockedips.headers.applicationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("blockedips.headers.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reason",
      label: t("blockedips.headers.reason"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("blockedIp.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return blockedIps.map((item) => new BlockedIpDataGridEntry(item))
  }, [blockedIps])

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
        emptyMessage={t("blockedIp.messages.noData")}
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
