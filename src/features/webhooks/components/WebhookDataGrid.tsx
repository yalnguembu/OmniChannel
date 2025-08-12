import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { Eye } from "lucide-react"
import { useWebhook } from "../hooks/useWebhook"
import { WebhookDataGridEntry } from "../lib/data-grid/WebhookDataGridEntry"

export const WebhookDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { webhooks, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows } = useWebhook()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "applicationName",
      label: t("webhooks.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "eventType",
      label: t("webhooks.headers.eventType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "url",
      label: t("webhooks.headers.url"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastSecretGenerated",
      label: t("webhooks.headers.lastSecretGenerated"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("webhooks.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxRetries",
      label: t("webhooks.headers.maxRetries"),
      sortable: true,
      resizable: true,
    },
    {
      key: "timeoutSeconds",
      label: t("webhooks.headers.timeoutSeconds"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("webhooks.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("webhooks.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return webhooks.map((item) => new WebhookDataGridEntry(item))
  }, [webhooks])

  const handleView = (id: string) => {
    navigate({ to: `/webhooka/${id}` })
  }

  const renderCell = (item: DataGridRowEntry, columnKey: string) => {
    switch (columnKey) {
      case "actions":
        return (
          <Button onClick={() => handleView(item.getId())}>
            <Eye className="mr-2 h-4 w-4" />
            {t("webhooks.actions.view")}
          </Button>
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
        emptyMessage={t("webhooks.messages.noData")}
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
    </div>
  )
}
