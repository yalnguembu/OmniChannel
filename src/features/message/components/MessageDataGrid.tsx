import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import { SearchMessageResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface MessageDataGridProps {
  messages: SearchMessageResponse[]
  paginationMetadata?: {
    totalCount: number
    totalPages: number
    pageNumber: number
    pageSize: number
    startIndex?: number
    endIndex?: number
    hasPreviousPage?: boolean
    hasNextPage?: boolean
  }
  isLoading: boolean
  viewMode: "grid" | "list"
  selectedRows: string[]
  onSelectionChange: (rows: string[]) => void
  onPageChange: (page: number, size: number) => void
  onSortChange: (column: string, direction: SortDirection | null) => void
  onDelete: (id: string) => void
  onBulkDelete: () => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  isDeleting?: boolean
  sortBy?: string | null
  sortDirection?: SortDirection | null
}

export const MessageDataGrid: React.FC<MessageDataGridProps> = ({
  messages,
  paginationMetadata,
  isLoading,
  viewMode,
  selectedRows,
  onSelectionChange,
  onPageChange,
  onSortChange,
  onDelete,
  onBulkDelete,
  onView,
  onEdit,
  isDeleting,
  sortBy,
  sortDirection
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columnHeaders: DataGridColumnHeader<SearchMessageResponse>[] = [
    {
      key: "campaignName",
      label: t("message.fields.campaignName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignType",
      label: t("message.fields.campaignType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignStatus",
      label: t("message.fields.campaignStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelName",
      label: t("message.fields.channelName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelCode",
      label: t("message.fields.channelCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientFirstName",
      label: t("message.fields.clientFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientLastName",
      label: t("message.fields.clientLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientStatus",
      label: t("message.fields.clientStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientEmail",
      label: t("message.fields.clientEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "connectorName",
      label: t("message.fields.connectorName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "templateName",
      label: t("message.fields.templateName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "templateStatus",
      label: t("message.fields.templateStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignId",
      label: t("message.fields.campaignId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientId",
      label: t("message.fields.clientId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "templateId",
      label: t("message.fields.templateId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelId",
      label: t("message.fields.channelId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "connectorId",
      label: t("message.fields.connectorId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalMessageId",
      label: t("message.fields.externalMessageId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "recipientAddress",
      label: t("message.fields.recipientAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "subject",
      label: t("message.fields.subject"),
      sortable: true,
      resizable: true,
    },
    {
      key: "content",
      label: t("message.fields.content"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("message.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "attemptCount",
      label: t("message.fields.attemptCount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxAttempts",
      label: t("message.fields.maxAttempts"),
      sortable: true,
      resizable: true,
    },
    {
      key: "nextRetryAt",
      label: t("message.fields.nextRetryAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorCode",
      label: t("message.fields.errorCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorMessage",
      label: t("message.fields.errorMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "queuedAt",
      label: t("message.fields.queuedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "sentAt",
      label: t("message.fields.sentAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "deliveredAt",
      label: t("message.fields.deliveredAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "failedAt",
      label: t("message.fields.failedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "cost",
      label: t("message.fields.cost"),
      sortable: true,
      resizable: true,
    },
    {
      key: "count",
      label: t("message.fields.count"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isApiCall",
      label: t("message.fields.isApiCall"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("message.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/message/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/message/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("message.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("message.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchMessageResponse, column: DataGridColumnHeader<SearchMessageResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "campaignName":
          return <span className="text-muted-foreground/70">{item.campaignName || "N/A"}</span>
        case "campaignType":
          return <span className="text-muted-foreground/70">{item.campaignType || "N/A"}</span>
        case "campaignStatus":
          return <span className="text-muted-foreground/70">{item.campaignStatus || "N/A"}</span>
        case "channelName":
          return <span className="text-muted-foreground/70">{item.channelName || "N/A"}</span>
        case "channelCode":
          return <span className="text-muted-foreground/70">{item.channelCode || "N/A"}</span>
        case "clientFirstName":
          return <span className="text-muted-foreground/70">{item.clientFirstName || "N/A"}</span>
        case "clientLastName":
          return <span className="text-muted-foreground/70">{item.clientLastName || "N/A"}</span>
        case "clientStatus":
          return <span className="text-muted-foreground/70">{item.clientStatus || "N/A"}</span>
        case "clientEmail":
          return <span className="text-muted-foreground/70">{item.clientEmail || "N/A"}</span>
        case "connectorName":
          return <span className="text-muted-foreground/70">{item.connectorName || "N/A"}</span>
        case "templateName":
          return <span className="text-muted-foreground/70">{item.templateName || "N/A"}</span>
        case "templateStatus":
          return <span className="text-muted-foreground/70">{item.templateStatus || "N/A"}</span>
        case "campaignId":
          return <span className="text-muted-foreground/70">{item.campaignId || "N/A"}</span>
        case "clientId":
          return <span className="text-muted-foreground/70">{item.clientId || "N/A"}</span>
        case "templateId":
          return <span className="text-muted-foreground/70">{item.templateId || "N/A"}</span>
        case "channelId":
          return <span className="text-muted-foreground/70">{item.channelId || "N/A"}</span>
        case "connectorId":
          return <span className="text-muted-foreground/70">{item.connectorId || "N/A"}</span>
        case "externalMessageId":
          return <span className="text-muted-foreground/70">{item.externalMessageId || "N/A"}</span>
        case "recipientAddress":
          return <span className="text-muted-foreground/70">{item.recipientAddress || "N/A"}</span>
        case "subject":
          return <span className="text-muted-foreground/70">{item.subject || "N/A"}</span>
        case "content":
          return <span className="text-muted-foreground/70">{item.content || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "attemptCount":
          return <span className="text-muted-foreground/70">{item.attemptCount || "N/A"}</span>
        case "maxAttempts":
          return <span className="text-muted-foreground/70">{item.maxAttempts || "N/A"}</span>
        case "nextRetryAt":
          return <span className="text-muted-foreground/70">{item.nextRetryAt || "N/A"}</span>
        case "errorCode":
          return <span className="text-muted-foreground/70">{item.errorCode || "N/A"}</span>
        case "errorMessage":
          return <span className="text-muted-foreground/70">{item.errorMessage || "N/A"}</span>
        case "queuedAt":
          return <span className="text-muted-foreground/70">{item.queuedAt || "N/A"}</span>
        case "sentAt":
          return <span className="text-muted-foreground/70">{item.sentAt || "N/A"}</span>
        case "deliveredAt":
          return <span className="text-muted-foreground/70">{item.deliveredAt || "N/A"}</span>
        case "failedAt":
          return <span className="text-muted-foreground/70">{item.failedAt || "N/A"}</span>
        case "cost":
          return <span className="text-muted-foreground/70">{item.cost || "N/A"}</span>
        case "count":
          return <span className="text-muted-foreground/70">{item.count || "N/A"}</span>
        case "isApiCall":
          return <span className="text-muted-foreground/70">{item.isApiCall || "N/A"}</span>
        case "actions":
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item as any} actions={actions as ACTION[]} dispatch={handleDispatch} />

        default:
          const val = (item as any)[column.key]
          return column?.isBadge ? (
            <StatusBadge text={val as string} />
          ) : (
            <span className="text-muted-foreground/70">{val || "N/A"}</span>
          )
      }
    } else {
      switch (column.key) {
        case "campaignName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.campaignName")} value={item.campaignName ?? "N/A"} />
            </div>
          )
        case "campaignType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.campaignType")} value={item.campaignType ?? "N/A"} />
            </div>
          )
        case "campaignStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.campaignStatus")} value={item.campaignStatus ?? "N/A"} />
            </div>
          )
        case "channelName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.channelName")} value={item.channelName ?? "N/A"} />
            </div>
          )
        case "channelCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.channelCode")} value={item.channelCode ?? "N/A"} />
            </div>
          )
        case "clientFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.clientFirstName")} value={item.clientFirstName ?? "N/A"} />
            </div>
          )
        case "clientLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.clientLastName")} value={item.clientLastName ?? "N/A"} />
            </div>
          )
        case "clientStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.clientStatus")} value={item.clientStatus ?? "N/A"} />
            </div>
          )
        case "clientEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.clientEmail")} value={item.clientEmail ?? "N/A"} />
            </div>
          )
        case "connectorName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.connectorName")} value={item.connectorName ?? "N/A"} />
            </div>
          )
        case "templateName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.templateName")} value={item.templateName ?? "N/A"} />
            </div>
          )
        case "templateStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.templateStatus")} value={item.templateStatus ?? "N/A"} />
            </div>
          )
        case "campaignId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.campaignId")} value={item.campaignId ?? "N/A"} />
            </div>
          )
        case "clientId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.clientId")} value={item.clientId ?? "N/A"} />
            </div>
          )
        case "templateId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.templateId")} value={item.templateId ?? "N/A"} />
            </div>
          )
        case "channelId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.channelId")} value={item.channelId ?? "N/A"} />
            </div>
          )
        case "connectorId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.connectorId")} value={item.connectorId ?? "N/A"} />
            </div>
          )
        case "externalMessageId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.externalMessageId")} value={item.externalMessageId ?? "N/A"} />
            </div>
          )
        case "recipientAddress":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.recipientAddress")} value={item.recipientAddress ?? "N/A"} />
            </div>
          )
        case "subject":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.subject")} value={item.subject ?? "N/A"} />
            </div>
          )
        case "content":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.content")} value={item.content ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "attemptCount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.attemptCount")} value={item.attemptCount ?? "N/A"} />
            </div>
          )
        case "maxAttempts":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.maxAttempts")} value={item.maxAttempts ?? "N/A"} />
            </div>
          )
        case "nextRetryAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.nextRetryAt")} value={item.nextRetryAt ?? "N/A"} />
            </div>
          )
        case "errorCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.errorCode")} value={item.errorCode ?? "N/A"} />
            </div>
          )
        case "errorMessage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.errorMessage")} value={item.errorMessage ?? "N/A"} />
            </div>
          )
        case "queuedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.queuedAt")} value={item.queuedAt ?? "N/A"} />
            </div>
          )
        case "sentAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.sentAt")} value={item.sentAt ?? "N/A"} />
            </div>
          )
        case "deliveredAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.deliveredAt")} value={item.deliveredAt ?? "N/A"} />
            </div>
          )
        case "failedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.failedAt")} value={item.failedAt ?? "N/A"} />
            </div>
          )
        case "cost":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.cost")} value={item.cost ?? "N/A"} />
            </div>
          )
        case "count":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.count")} value={item.count ?? "N/A"} />
            </div>
          )
        case "isApiCall":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("message.fields.isApiCall")} value={item.isApiCall ?? "N/A"} />
            </div>
          )
        case "actions":
          return (
            <div className="flex flex-row justify-between px-4 pt-2 mt-auto border-t">
              <DetailsCardItem label="#" value={item.id?.substring(0, 8) || "N/A"} />
              <ActionButtonGroup view={view} isLoading={isLoading} row={item as any} actions={actions as ACTION[]} dispatch={handleDispatch} />
            </div>
          )
        default:
          return null
      }
    }
  }

  const sortConfig: DataGridSort | undefined = sortBy
    ? {
      column: sortBy,
      direction: sortDirection === "desc" ? SortDirection.DESC : SortDirection.ASC,
    }
    : undefined

  const handleSortChange = (config: DataGridSort) => {
    onSortChange(config.column, config.direction)
  }

  const bulkActions = (selectedRows?.length > 0)
    ? [
      {
        label: isDeleting ? t("message.bulk.deleting") : t("message.bulk.delete", { count: selectedRows?.length }),
        action: handleBulkDelete,
        variant: "destructive" as const,
        loading: isDeleting,
      },
    ]
    : undefined

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "edit":
        handleEdit(id)
        break
      case "view":
        handleView(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col gap-2">
      <DataGrid<SearchMessageResponse>
        columnHeaders={columnHeaders}
        items={messages}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("message.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        bulkActions={bulkActions}
        renderCell={renderCell}
        dispatch={handleDispatch}
        actions={actions as ACTION[]}
        viewMode={viewMode}
      />
    </div>
  )
}
