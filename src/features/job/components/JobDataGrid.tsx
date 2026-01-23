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
import { SearchJobResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface JobDataGridProps {
  jobs: SearchJobResponse[]
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

export const JobDataGrid: React.FC<JobDataGridProps> = ({
  jobs,
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

  const columnHeaders: DataGridColumnHeader<SearchJobResponse>[] = [
    {
      key: "jobType",
      label: t("job.fields.jobType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("job.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "payload",
      label: t("job.fields.payload"),
      sortable: true,
      resizable: true,
    },
    {
      key: "scheduledAt",
      label: t("job.fields.scheduledAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "startedAt",
      label: t("job.fields.startedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "completedAt",
      label: t("job.fields.completedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "result",
      label: t("job.fields.result"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorMessage",
      label: t("job.fields.errorMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "attemptCount",
      label: t("job.fields.attemptCount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxAttempts",
      label: t("job.fields.maxAttempts"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("job.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/job/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/job/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("job.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("job.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchJobResponse, column: DataGridColumnHeader<SearchJobResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "jobType":
          return <span className="text-muted-foreground/70">{item.jobType || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "payload":
          return <span className="text-muted-foreground/70">{item.payload || "N/A"}</span>
        case "scheduledAt":
          return <span className="text-muted-foreground/70">{item.scheduledAt || "N/A"}</span>
        case "startedAt":
          return <span className="text-muted-foreground/70">{item.startedAt || "N/A"}</span>
        case "completedAt":
          return <span className="text-muted-foreground/70">{item.completedAt || "N/A"}</span>
        case "result":
          return <span className="text-muted-foreground/70">{item.result || "N/A"}</span>
        case "errorMessage":
          return <span className="text-muted-foreground/70">{item.errorMessage || "N/A"}</span>
        case "attemptCount":
          return <span className="text-muted-foreground/70">{item.attemptCount || "N/A"}</span>
        case "maxAttempts":
          return <span className="text-muted-foreground/70">{item.maxAttempts || "N/A"}</span>
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
        case "jobType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.jobType")} value={item.jobType ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "payload":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.payload")} value={item.payload ?? "N/A"} />
            </div>
          )
        case "scheduledAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.scheduledAt")} value={item.scheduledAt ?? "N/A"} />
            </div>
          )
        case "startedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.startedAt")} value={item.startedAt ?? "N/A"} />
            </div>
          )
        case "completedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.completedAt")} value={item.completedAt ?? "N/A"} />
            </div>
          )
        case "result":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.result")} value={item.result ?? "N/A"} />
            </div>
          )
        case "errorMessage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.errorMessage")} value={item.errorMessage ?? "N/A"} />
            </div>
          )
        case "attemptCount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.attemptCount")} value={item.attemptCount ?? "N/A"} />
            </div>
          )
        case "maxAttempts":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("job.fields.maxAttempts")} value={item.maxAttempts ?? "N/A"} />
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
        label: isDeleting ? t("job.bulk.deleting") : t("job.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchJobResponse>
        columnHeaders={columnHeaders}
        items={jobs}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("job.messages.noData")}
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
