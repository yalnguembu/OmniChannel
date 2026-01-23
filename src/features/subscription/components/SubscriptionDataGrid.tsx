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
import { SearchSubscriptionResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface SubscriptionDataGridProps {
  subscriptions: SearchSubscriptionResponse[]
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

export const SubscriptionDataGrid: React.FC<SubscriptionDataGridProps> = ({
  subscriptions,
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

  const columnHeaders: DataGridColumnHeader<SearchSubscriptionResponse>[] = [
    {
      key: "companyName",
      label: t("subscription.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("subscription.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("subscription.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentCurrency",
      label: t("subscription.fields.paymentCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentStatus",
      label: t("subscription.fields.paymentStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "planName",
      label: t("subscription.fields.planName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "planCode",
      label: t("subscription.fields.planCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("subscription.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "planId",
      label: t("subscription.fields.planId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentId",
      label: t("subscription.fields.paymentId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("subscription.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "billingCycle",
      label: t("subscription.fields.billingCycle"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currentPeriodStart",
      label: t("subscription.fields.currentPeriodStart"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currentPeriodEnd",
      label: t("subscription.fields.currentPeriodEnd"),
      sortable: true,
      resizable: true,
    },
    {
      key: "usedQuota",
      label: t("subscription.fields.usedQuota"),
      sortable: true,
      resizable: true,
    },
    {
      key: "autoRenew",
      label: t("subscription.fields.autoRenew"),
      sortable: true,
      resizable: true,
    },
    {
      key: "cancelledAt",
      label: t("subscription.fields.cancelledAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("subscription.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/subscription/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/subscription/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("subscription.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("subscription.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchSubscriptionResponse, column: DataGridColumnHeader<SearchSubscriptionResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "paymentCurrency":
          return <span className="text-muted-foreground/70">{item.paymentCurrency || "N/A"}</span>
        case "paymentStatus":
          return <span className="text-muted-foreground/70">{item.paymentStatus || "N/A"}</span>
        case "planName":
          return <span className="text-muted-foreground/70">{item.planName || "N/A"}</span>
        case "planCode":
          return <span className="text-muted-foreground/70">{item.planCode || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "planId":
          return <span className="text-muted-foreground/70">{item.planId || "N/A"}</span>
        case "paymentId":
          return <span className="text-muted-foreground/70">{item.paymentId || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "billingCycle":
          return <span className="text-muted-foreground/70">{item.billingCycle || "N/A"}</span>
        case "currentPeriodStart":
          return <span className="text-muted-foreground/70">{item.currentPeriodStart || "N/A"}</span>
        case "currentPeriodEnd":
          return <span className="text-muted-foreground/70">{item.currentPeriodEnd || "N/A"}</span>
        case "usedQuota":
          return <span className="text-muted-foreground/70">{item.usedQuota || "N/A"}</span>
        case "autoRenew":
          return <span className="text-muted-foreground/70">{item.autoRenew || "N/A"}</span>
        case "cancelledAt":
          return <span className="text-muted-foreground/70">{item.cancelledAt || "N/A"}</span>
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
        case "companyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "paymentCurrency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.paymentCurrency")} value={item.paymentCurrency ?? "N/A"} />
            </div>
          )
        case "paymentStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.paymentStatus")} value={item.paymentStatus ?? "N/A"} />
            </div>
          )
        case "planName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.planName")} value={item.planName ?? "N/A"} />
            </div>
          )
        case "planCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.planCode")} value={item.planCode ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "planId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.planId")} value={item.planId ?? "N/A"} />
            </div>
          )
        case "paymentId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.paymentId")} value={item.paymentId ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "billingCycle":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.billingCycle")} value={item.billingCycle ?? "N/A"} />
            </div>
          )
        case "currentPeriodStart":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.currentPeriodStart")} value={item.currentPeriodStart ?? "N/A"} />
            </div>
          )
        case "currentPeriodEnd":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.currentPeriodEnd")} value={item.currentPeriodEnd ?? "N/A"} />
            </div>
          )
        case "usedQuota":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.usedQuota")} value={item.usedQuota ?? "N/A"} />
            </div>
          )
        case "autoRenew":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.autoRenew")} value={item.autoRenew ?? "N/A"} />
            </div>
          )
        case "cancelledAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscription.fields.cancelledAt")} value={item.cancelledAt ?? "N/A"} />
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
        label: isDeleting ? t("subscription.bulk.deleting") : t("subscription.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchSubscriptionResponse>
        columnHeaders={columnHeaders}
        items={subscriptions}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("subscription.messages.noData")}
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
