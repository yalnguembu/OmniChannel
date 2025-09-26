import React, { useMemo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort, ACTION } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { UpdateWebhookRequest } from "@/shared/api/types.gen"
import { useWebhook } from "../hooks/useWebhook"
import { WebhookDataGridEntry } from "../lib/data-grid/WebhookDataGridEntry"
import { Label } from "@/shared/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { WebhookEditForm } from "../components/WebhookEditForm"
import { ModalWrapper } from "@/shared/components/ModalWrapper"

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b break-words">
    <Label className="font-semibold text-muted-foreground">{label}</Label>
    <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
  </div>
)

export const WebhookDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    webhooks,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changeSort,
    setSelectedRows,
    searchWebhooks,
    updateMutation,
    deleteMutation,
  } = useWebhook()

  useEffect(() => {
    searchWebhooks()
  }, [])

  const [showEditModal, setShowEditModal] = useState(false)
  const toggleShowEditModal = () => setShowEditModal((prev) => !prev)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const [selectedItem, setSelectedItem] = useState(false)

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
      isBadge: true,
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

  const handleDelete = (id: string) => {
    deleteMutation.mutate(
      { path: id },
      {
        onSuccess: () => toggleShowEditModal(),
      },
    )
  }

  const handleEdit = (data: UpdateWebhookRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowEditModal(),
      },
    )
  }

  const handleDispatch = (action: ACTION, id: string) => {
    const selectedWebhook = webhooks.find((webhook) => webhook.id === id)
    setSelectedItem(selectedWebhook)
    if (action === "view") {
      toggleShowDetailsModal()
    } else if (action === "edit") {
      toggleShowEditModal()
    } else if (action === "delete") {
      confirm(handleDelete(id))
    }
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
        actions={["view", "edit", "regen-secret"]}
        dispatch={handleDispatch}
      />

      {showEditModal && (
        <ModalWrapper title="" description="" open={showEditModal} onOpenChange={toggleShowEditModal}>
          <div className="-m-6">
            <WebhookEditForm onSubmit={handleEdit} onCancel={toggleShowEditModal} isLoading={false} />
          </div>
        </ModalWrapper>
      )}
      {showDetailsModal && selectedItem && (
        <ModalWrapper size="2xl" title="" description="" open={showDetailsModal} onOpenChange={toggleShowDetailsModal}>
          <div className="-m-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>FeeConfiguration Details</CardTitle>
              </CardHeader>
              <CardContent className="grid lg:grid-cols-2 gap-2">
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (key === "id") return null // Don't show ID by default
                  const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
                  return <DetailItem key={key} label={formattedKey} value={value} />
                })}
              </CardContent>
            </Card>
          </div>
        </ModalWrapper>
      )}
    </div>
  )
}
