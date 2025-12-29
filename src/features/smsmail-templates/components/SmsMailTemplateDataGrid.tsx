import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useSmsmailTemplate } from "../hooks/useSmsMailTemplate"
import { SmsmailTemplateDataGridEntry } from "../lib/data-grid/SmsMailTemplateDataGridEntry"

export const SmsmailTemplateDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    smsmailTemplates,
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
  } = useSmsmailTemplate()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("smsmailtemplates.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "locale",
      label: t("smsmailtemplates.headers.locale"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("smsmailtemplates.headers.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "subject",
      label: t("smsmailtemplates.headers.subject"),
      sortable: true,
      resizable: true,
    },
    {
      key: "body",
      label: t("smsmailtemplates.headers.body"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("smsmailtemplates.headers.isActive"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("smsmailTemplates.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return smsmailTemplates.map((item) => new SmsmailTemplateDataGridEntry(item))
  }, [smsmailTemplates])

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
        emptyMessage={t("smsmailTemplates.messages.noData")}
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
