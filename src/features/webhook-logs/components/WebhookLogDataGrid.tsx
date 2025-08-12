import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import { useWebhookLog } from "../hooks/useWebhookLog"
import { WebhookLogDataGridEntry } from "../lib/data-grid/WebhookLogDataGridEntry"

export const WebhookLogDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { webhookLogs, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows } = useWebhookLog()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "webhookName",
      label: t("webhooklogs.headers.webhookName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "webhookId",
      label: t("webhooklogs.headers.webhookId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "requestBody",
      label: t("webhooklogs.headers.requestBody"),
      sortable: true,
      resizable: true,
    },
    {
      key: "responseStatusCode",
      label: t("webhooklogs.headers.responseStatusCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "responseBody",
      label: t("webhooklogs.headers.responseBody"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorMessage",
      label: t("webhooklogs.headers.errorMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "attemptNumber",
      label: t("webhooklogs.headers.attemptNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("webhooklogs.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("webhookLog.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return webhookLogs.map((item) => new WebhookLogDataGridEntry(item))
  }, [webhookLogs])

  const handleView = (id: string) => {
    navigate({ to: `/webhookLog/${id}` })
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
                {t("webhookLog.actions.view")}
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

  const handlePageChange = (page: number) => {
    changePage(page)
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
        emptyMessage={t("webhookLog.messages.noData")}
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
        renderCell={renderCell}
      />
    </div>
  )
}
