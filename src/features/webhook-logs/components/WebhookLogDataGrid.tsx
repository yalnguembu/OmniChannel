import React, { useMemo, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, ACTION, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useWebhookLog } from "../hooks/useWebhookLog"
import { WebhookLogDataGridEntry } from "../lib/data-grid/WebhookLogDataGridEntry"
import { WebhookLogDto } from "@/shared/api/types.gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"

export const WebhookLogDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const { webhookLogs, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows, searchWebhookLogs } =
    useWebhookLog()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "webhookName",
      label: t("webhooklogs.headers.webhookName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "responseStatusCode",
      label: t("webhooklogs.headers.responseStatusCode"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    // {
    //   key: "webhookId",
    //   label: t("webhooklogs.headers.webhookId"),
    //   sortable: true,
    //   resizable: true,
    // },
    {
      key: "attemptNumber",
      label: t("webhooklogs.headers.attemptNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorMessage",
      label: t("webhooklogs.headers.errorMessage"),
      sortable: true,
      width: 100,
      style: "w-24 word-breaks overflow-hidden",
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
    {
      key: "requestBody",
      label: t("webhooklogs.headers.requestBody"),
      sortable: true,
      resizable: true,
    },
    {
      key: "responseBody",
      label: t("webhooklogs.headers.responseBody"),
      sortable: true,
      resizable: true,
    },
  ]

  useEffect(() => {
    searchWebhookLogs()
  }, [])

  const gridItems = useMemo(() => {
    return webhookLogs.map((item) => new WebhookLogDataGridEntry(item))
  }, [webhookLogs])

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

  const handleDispacth = (action: ACTION, id: string) => {
    if (action === "view") {
      const selectedLog = webhookLogs.find((log) => log.id === id)
      setSelectedItem(selectedLog ?? null)
      toggleShowDetailsModal()
    }
  }

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
      <Label className="font-semibold text-muted-foreground">{label}</Label>
      <div className="md:col-span-2 break-words">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
    </div>
  )

  interface LogDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<WebhookLogDto>
  }

  const LogDetails: React.FC<LogDetailsProps> = ({ onCancel, open, data }) => (
    <ModalWrapper size="3xl" open={open} onOpenChange={onCancel} title={t("smsmailTemplates.details.title")}>
      <Card className="max-w-4xl -m-6">
        <CardHeader>
          <CardTitle>Log Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 overflow-auto">
          {Object.entries(data).map(([key, value]) => {
            if (key === "id") return null
            const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
            return <DetailItem key={key} label={formattedKey} value={value} />
          })}
        </CardContent>
      </Card>
    </ModalWrapper>
  )

  const [selectedItem, setSelectedItem] = useState<WebhookLogDto | null>(null)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

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
        actions={["view"]}
        dispatch={handleDispacth}
      />
      {showDetailsModal && !!selectedItem && <LogDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
    </div>
  )
}
