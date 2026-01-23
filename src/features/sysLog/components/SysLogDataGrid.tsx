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
import { SearchSysLogResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface SysLogDataGridProps {
  sysLogs: SearchSysLogResponse[]
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

export const SysLogDataGrid: React.FC<SysLogDataGridProps> = ({
  sysLogs,
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

  const columnHeaders: DataGridColumnHeader<SearchSysLogResponse>[] = [
    {
      key: "logLevel",
      label: t("sysLog.fields.logLevel"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("sysLog.fields.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "machineName",
      label: t("sysLog.fields.machineName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "environment",
      label: t("sysLog.fields.environment"),
      sortable: true,
      resizable: true,
    },
    {
      key: "correlationId",
      label: t("sysLog.fields.correlationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "message",
      label: t("sysLog.fields.message"),
      sortable: true,
      resizable: true,
    },
    {
      key: "exceptionMessage",
      label: t("sysLog.fields.exceptionMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "stackTrace",
      label: t("sysLog.fields.stackTrace"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("sysLog.fields.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "requestUri",
      label: t("sysLog.fields.requestUri"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("sysLog.fields.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userName",
      label: t("sysLog.fields.userName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "additionalData",
      label: t("sysLog.fields.additionalData"),
      sortable: true,
      resizable: true,
    },
    {
      key: "logCategory",
      label: t("sysLog.fields.logCategory"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transactionType",
      label: t("sysLog.fields.transactionType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "internalReference",
      label: t("sysLog.fields.internalReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalReference",
      label: t("sysLog.fields.externalReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerInitialReference",
      label: t("sysLog.fields.providerInitialReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerFinalReference",
      label: t("sysLog.fields.providerFinalReference"),
      sortable: true,
      resizable: true,
    },
    {
      key: "eventType",
      label: t("sysLog.fields.eventType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentProvider",
      label: t("sysLog.fields.paymentProvider"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("sysLog.fields.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("sysLog.fields.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "requestPayload",
      label: t("sysLog.fields.requestPayload"),
      sortable: true,
      resizable: true,
    },
    {
      key: "responsePayload",
      label: t("sysLog.fields.responsePayload"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerErrorCode",
      label: t("sysLog.fields.providerErrorCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerErrorMessage",
      label: t("sysLog.fields.providerErrorMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "httpStatusCode",
      label: t("sysLog.fields.httpStatusCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isRecoveryLog",
      label: t("sysLog.fields.isRecoveryLog"),
      sortable: true,
      resizable: true,
    },
    {
      key: "recoveryData",
      label: t("sysLog.fields.recoveryData"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isWebhookLog",
      label: t("sysLog.fields.isWebhookLog"),
      sortable: true,
      resizable: true,
    },
    {
      key: "webhookSignature",
      label: t("sysLog.fields.webhookSignature"),
      sortable: true,
      resizable: true,
    },
    {
      key: "webhookHeaders",
      label: t("sysLog.fields.webhookHeaders"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("sysLog.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/sysLog/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/sysLog/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("sysLog.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("sysLog.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchSysLogResponse, column: DataGridColumnHeader<SearchSysLogResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "logLevel":
          return <span className="text-muted-foreground/70">{item.logLevel || "N/A"}</span>
        case "applicationName":
          return <span className="text-muted-foreground/70">{item.applicationName || "N/A"}</span>
        case "machineName":
          return <span className="text-muted-foreground/70">{item.machineName || "N/A"}</span>
        case "environment":
          return <span className="text-muted-foreground/70">{item.environment || "N/A"}</span>
        case "correlationId":
          return <span className="text-muted-foreground/70">{item.correlationId || "N/A"}</span>
        case "message":
          return <span className="text-muted-foreground/70">{item.message || "N/A"}</span>
        case "exceptionMessage":
          return <span className="text-muted-foreground/70">{item.exceptionMessage || "N/A"}</span>
        case "stackTrace":
          return <span className="text-muted-foreground/70">{item.stackTrace || "N/A"}</span>
        case "ipAddress":
          return <span className="text-muted-foreground/70">{item.ipAddress || "N/A"}</span>
        case "requestUri":
          return <span className="text-muted-foreground/70">{item.requestUri || "N/A"}</span>
        case "userId":
          return <span className="text-muted-foreground/70">{item.userId || "N/A"}</span>
        case "userName":
          return <span className="text-muted-foreground/70">{item.userName || "N/A"}</span>
        case "additionalData":
          return <span className="text-muted-foreground/70">{item.additionalData || "N/A"}</span>
        case "logCategory":
          return <span className="text-muted-foreground/70">{item.logCategory || "N/A"}</span>
        case "transactionType":
          return <span className="text-muted-foreground/70">{item.transactionType || "N/A"}</span>
        case "internalReference":
          return <span className="text-muted-foreground/70">{item.internalReference || "N/A"}</span>
        case "externalReference":
          return <span className="text-muted-foreground/70">{item.externalReference || "N/A"}</span>
        case "providerInitialReference":
          return <span className="text-muted-foreground/70">{item.providerInitialReference || "N/A"}</span>
        case "providerFinalReference":
          return <span className="text-muted-foreground/70">{item.providerFinalReference || "N/A"}</span>
        case "eventType":
          return <span className="text-muted-foreground/70">{item.eventType || "N/A"}</span>
        case "paymentProvider":
          return <span className="text-muted-foreground/70">{item.paymentProvider || "N/A"}</span>
        case "amount":
          return <span className="text-muted-foreground/70">{item.amount || "N/A"}</span>
        case "currency":
          return <span className="text-muted-foreground/70">{item.currency || "N/A"}</span>
        case "requestPayload":
          return <span className="text-muted-foreground/70">{item.requestPayload || "N/A"}</span>
        case "responsePayload":
          return <span className="text-muted-foreground/70">{item.responsePayload || "N/A"}</span>
        case "providerErrorCode":
          return <span className="text-muted-foreground/70">{item.providerErrorCode || "N/A"}</span>
        case "providerErrorMessage":
          return <span className="text-muted-foreground/70">{item.providerErrorMessage || "N/A"}</span>
        case "httpStatusCode":
          return <span className="text-muted-foreground/70">{item.httpStatusCode || "N/A"}</span>
        case "isRecoveryLog":
          return <span className="text-muted-foreground/70">{item.isRecoveryLog || "N/A"}</span>
        case "recoveryData":
          return <span className="text-muted-foreground/70">{item.recoveryData || "N/A"}</span>
        case "isWebhookLog":
          return <span className="text-muted-foreground/70">{item.isWebhookLog || "N/A"}</span>
        case "webhookSignature":
          return <span className="text-muted-foreground/70">{item.webhookSignature || "N/A"}</span>
        case "webhookHeaders":
          return <span className="text-muted-foreground/70">{item.webhookHeaders || "N/A"}</span>
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
        case "logLevel":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.logLevel")} value={item.logLevel ?? "N/A"} />
            </div>
          )
        case "applicationName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.applicationName")} value={item.applicationName ?? "N/A"} />
            </div>
          )
        case "machineName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.machineName")} value={item.machineName ?? "N/A"} />
            </div>
          )
        case "environment":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.environment")} value={item.environment ?? "N/A"} />
            </div>
          )
        case "correlationId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.correlationId")} value={item.correlationId ?? "N/A"} />
            </div>
          )
        case "message":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.message")} value={item.message ?? "N/A"} />
            </div>
          )
        case "exceptionMessage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.exceptionMessage")} value={item.exceptionMessage ?? "N/A"} />
            </div>
          )
        case "stackTrace":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.stackTrace")} value={item.stackTrace ?? "N/A"} />
            </div>
          )
        case "ipAddress":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.ipAddress")} value={item.ipAddress ?? "N/A"} />
            </div>
          )
        case "requestUri":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.requestUri")} value={item.requestUri ?? "N/A"} />
            </div>
          )
        case "userId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.userId")} value={item.userId ?? "N/A"} />
            </div>
          )
        case "userName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.userName")} value={item.userName ?? "N/A"} />
            </div>
          )
        case "additionalData":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.additionalData")} value={item.additionalData ?? "N/A"} />
            </div>
          )
        case "logCategory":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.logCategory")} value={item.logCategory ?? "N/A"} />
            </div>
          )
        case "transactionType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.transactionType")} value={item.transactionType ?? "N/A"} />
            </div>
          )
        case "internalReference":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.internalReference")} value={item.internalReference ?? "N/A"} />
            </div>
          )
        case "externalReference":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.externalReference")} value={item.externalReference ?? "N/A"} />
            </div>
          )
        case "providerInitialReference":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.providerInitialReference")} value={item.providerInitialReference ?? "N/A"} />
            </div>
          )
        case "providerFinalReference":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.providerFinalReference")} value={item.providerFinalReference ?? "N/A"} />
            </div>
          )
        case "eventType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.eventType")} value={item.eventType ?? "N/A"} />
            </div>
          )
        case "paymentProvider":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.paymentProvider")} value={item.paymentProvider ?? "N/A"} />
            </div>
          )
        case "amount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.amount")} value={item.amount ?? "N/A"} />
            </div>
          )
        case "currency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.currency")} value={item.currency ?? "N/A"} />
            </div>
          )
        case "requestPayload":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.requestPayload")} value={item.requestPayload ?? "N/A"} />
            </div>
          )
        case "responsePayload":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.responsePayload")} value={item.responsePayload ?? "N/A"} />
            </div>
          )
        case "providerErrorCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.providerErrorCode")} value={item.providerErrorCode ?? "N/A"} />
            </div>
          )
        case "providerErrorMessage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.providerErrorMessage")} value={item.providerErrorMessage ?? "N/A"} />
            </div>
          )
        case "httpStatusCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.httpStatusCode")} value={item.httpStatusCode ?? "N/A"} />
            </div>
          )
        case "isRecoveryLog":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.isRecoveryLog")} value={item.isRecoveryLog ?? "N/A"} />
            </div>
          )
        case "recoveryData":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.recoveryData")} value={item.recoveryData ?? "N/A"} />
            </div>
          )
        case "isWebhookLog":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.isWebhookLog")} value={item.isWebhookLog ?? "N/A"} />
            </div>
          )
        case "webhookSignature":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.webhookSignature")} value={item.webhookSignature ?? "N/A"} />
            </div>
          )
        case "webhookHeaders":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("sysLog.fields.webhookHeaders")} value={item.webhookHeaders ?? "N/A"} />
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
        label: isDeleting ? t("sysLog.bulk.deleting") : t("sysLog.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchSysLogResponse>
        columnHeaders={columnHeaders}
        items={sysLogs}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("sysLog.messages.noData")}
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
