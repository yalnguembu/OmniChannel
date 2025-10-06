import { useNavigate } from "@tanstack/react-router"
import { useWebhook } from "@/features/webhooks/hooks/useWebhook"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchWebhookRequest } from "@/shared/api/zod.gen"
import { SearchWebhookRequest } from "@/shared"
import React, { useMemo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort, ACTION } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { UpdateWebhookRequest } from "@/shared/api/types.gen"
import { WebhookDataGridEntry } from "@/features/webhooks/lib/data-grid/WebhookDataGridEntry"
import { Label } from "@/shared/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/shared/components/ui/card"
import { WebhookEditForm } from "@/features/webhooks/components/WebhookEditForm"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { toast } from "sonner"
import { Button } from "@/shared"
import { EyeClosed, Loader2, RotateCcwKey, Key, Eye, Copy } from "lucide-react"

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b break-words">
    <Label className="font-semibold text-muted-foreground">{label}</Label>
    <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
  </div>
)

export function WebhooksTab({ companyId }: { companyId: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  console.log(companyId)

  const {
    webhooks,
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
    searchWebhooks,
    updateWebhookWithValidation,
    getApiWebhookGetWebhookSecretById,
    regenerateWebhookSecretById,
  } = useWebhook()

  useEffect(() => {
    searchWebhooks()
  }, [])

  const [showEditModal, setShowEditModal] = useState(false)
  const toggleShowEditModal = () => setShowEditModal((prev) => !prev)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const [selectedItem, setSelectedItem] = useState(null)

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
      width: 100,
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

  const { data: keys, isPending: isKepending } = getApiWebhookGetWebhookSecretById(selectedItem?.id || "")

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

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  const handleEdit = (data: UpdateWebhookRequest, setError: any) => {
    updateWebhookWithValidation(data, setError, () => {
      toggleShowEditModal()
    })
  }

  const handleDispatch = (action: ACTION, id: string) => {
    const selectedWebhook = webhooks.find((webhook) => webhook.id === id)
    setSelectedItem(selectedWebhook)
    if (action === "view") {
      toggleShowDetailsModal()
    } else if (action === "edit") {
      toggleShowEditModal()
    }
  }

  const handleCopy = (value: string) => {
    if (value && value !== "N/A") {
      navigator.clipboard.writeText(value)
      toast.success("API Key copied to clipboard")
    }
  }

  type DetailItemProps = { label?: string; value?: string | null }

  const ApiKeyDetailItem = ({ value = "N/A", label }: DetailItemProps) => {
    const [visible, setVisible] = useState(false)
    const toggleVisibility = () => setVisible((prev) => !prev)
    return (
      <div className="flex gap-2 py-1 items-center justify-between">
        <span className=" text-sm  text-muted-foreground/80 mr-2">{label}</span>
        <div className=" text-sm flex items-center">
          <span className="mr-2 rounded-md pt-1 px-2 min-w-20 bg-muted w-full wrap-anywhere">{visible ? value : "*********"}</span>
          <Button variant="ghost" size="sm" className="h-5" onClick={toggleVisibility}>
            {visible ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-5" onClick={() => handleCopy(value || "")}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchWebhookRequest>
        schema={zSearchWebhookRequest}
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
        fieldTranslationPrefix="webhooks"
      />

      <Card>
        <CardContent>
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
              actions={["view", "edit"]}
              dispatch={handleDispatch}
            />

            {showEditModal && (
              <ModalWrapper title="" description="" open={showEditModal} onOpenChange={toggleShowEditModal}>
                <div className="-m-6">
                  <WebhookEditForm webhookId={selectedItem?.id || ""} initialData={selectedItem} onSubmit={handleEdit} onCancel={toggleShowEditModal} isLoading={false} />
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
                      <div className="flex flex-col lg:flex-row justify-between">
                        <CardTitle className="text-sm font-medium">
                          <Key className="h-4 w-4 text-muted-foreground inline mr-2" />
                          {t("applications.headers.keys")}
                        </CardTitle>

                        <CardAction>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={isKepending} onClick={() => regenerateWebhookSecretById(selectedItem.id)}>
                            {isKepending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcwKey className="h-4 w-4 mr-2" />}
                            Regenerate
                          </Button>
                        </CardAction>
                      </div>
                      <ApiKeyDetailItem label="Key:" value={keys?.data?.webhookSecret} Icon={Key} />

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
        </CardContent>
      </Card>
    </div>
  )
}
