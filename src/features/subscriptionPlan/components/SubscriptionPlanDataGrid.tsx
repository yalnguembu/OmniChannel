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
import { SearchSubscriptionPlanResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface SubscriptionPlanDataGridProps {
  subscriptionPlans: SearchSubscriptionPlanResponse[]
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

export const SubscriptionPlanDataGrid: React.FC<SubscriptionPlanDataGridProps> = ({
  subscriptionPlans,
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

  const columnHeaders: DataGridColumnHeader<SearchSubscriptionPlanResponse>[] = [
    {
      key: "code",
      label: t("subscriptionPlan.fields.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("subscriptionPlan.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("subscriptionPlan.fields.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "monthlyPrice",
      label: t("subscriptionPlan.fields.monthlyPrice"),
      sortable: true,
      resizable: true,
    },
    {
      key: "yearlyPrice",
      label: t("subscriptionPlan.fields.yearlyPrice"),
      sortable: true,
      resizable: true,
    },
    {
      key: "monthlyQuota",
      label: t("subscriptionPlan.fields.monthlyQuota"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxProducts",
      label: t("subscriptionPlan.fields.maxProducts"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxUsers",
      label: t("subscriptionPlan.fields.maxUsers"),
      sortable: true,
      resizable: true,
    },
    {
      key: "features",
      label: t("subscriptionPlan.fields.features"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("subscriptionPlan.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("subscriptionPlan.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/subscriptionPlan/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/subscriptionPlan/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("subscriptionPlan.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("subscriptionPlan.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchSubscriptionPlanResponse, column: DataGridColumnHeader<SearchSubscriptionPlanResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "code":
          return <span className="text-muted-foreground/70">{item.code || "N/A"}</span>
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "description":
          return <span className="text-muted-foreground/70">{item.description || "N/A"}</span>
        case "monthlyPrice":
          return <span className="text-muted-foreground/70">{item.monthlyPrice || "N/A"}</span>
        case "yearlyPrice":
          return <span className="text-muted-foreground/70">{item.yearlyPrice || "N/A"}</span>
        case "monthlyQuota":
          return <span className="text-muted-foreground/70">{item.monthlyQuota || "N/A"}</span>
        case "maxProducts":
          return <span className="text-muted-foreground/70">{item.maxProducts || "N/A"}</span>
        case "maxUsers":
          return <span className="text-muted-foreground/70">{item.maxUsers || "N/A"}</span>
        case "features":
          return <span className="text-muted-foreground/70">{item.features || "N/A"}</span>
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
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
        case "code":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.code")} value={item.code ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "description":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.description")} value={item.description ?? "N/A"} />
            </div>
          )
        case "monthlyPrice":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.monthlyPrice")} value={item.monthlyPrice ?? "N/A"} />
            </div>
          )
        case "yearlyPrice":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.yearlyPrice")} value={item.yearlyPrice ?? "N/A"} />
            </div>
          )
        case "monthlyQuota":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.monthlyQuota")} value={item.monthlyQuota ?? "N/A"} />
            </div>
          )
        case "maxProducts":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.maxProducts")} value={item.maxProducts ?? "N/A"} />
            </div>
          )
        case "maxUsers":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.maxUsers")} value={item.maxUsers ?? "N/A"} />
            </div>
          )
        case "features":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.features")} value={item.features ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("subscriptionPlan.fields.isActive")} value={item.isActive ?? "N/A"} />
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
        label: isDeleting ? t("subscriptionPlan.bulk.deleting") : t("subscriptionPlan.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchSubscriptionPlanResponse>
        columnHeaders={columnHeaders}
        items={subscriptionPlans}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("subscriptionPlan.messages.noData")}
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
