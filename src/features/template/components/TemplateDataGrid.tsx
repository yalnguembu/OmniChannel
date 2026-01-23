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
import { SearchTemplateResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface TemplateDataGridProps {
  templates: SearchTemplateResponse[]
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

export const TemplateDataGrid: React.FC<TemplateDataGridProps> = ({
  templates,
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

  const columnHeaders: DataGridColumnHeader<SearchTemplateResponse>[] = [
    {
      key: "productName",
      label: t("template.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("template.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("template.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("template.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("template.fields.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("template.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "subject",
      label: t("template.fields.subject"),
      sortable: true,
      resizable: true,
    },
    {
      key: "content",
      label: t("template.fields.content"),
      sortable: true,
      resizable: true,
    },
    {
      key: "language",
      label: t("template.fields.language"),
      sortable: true,
      resizable: true,
    },
    {
      key: "category",
      label: t("template.fields.category"),
      sortable: true,
      resizable: true,
    },
    {
      key: "version",
      label: t("template.fields.version"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("template.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/template/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/template/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("template.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("template.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchTemplateResponse, column: DataGridColumnHeader<SearchTemplateResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "productName":
          return <span className="text-muted-foreground/70">{item.productName || "N/A"}</span>
        case "productStatus":
          return <span className="text-muted-foreground/70">{item.productStatus || "N/A"}</span>
        case "productId":
          return <span className="text-muted-foreground/70">{item.productId || "N/A"}</span>
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "description":
          return <span className="text-muted-foreground/70">{item.description || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "subject":
          return <span className="text-muted-foreground/70">{item.subject || "N/A"}</span>
        case "content":
          return <span className="text-muted-foreground/70">{item.content || "N/A"}</span>
        case "language":
          return <span className="text-muted-foreground/70">{item.language || "N/A"}</span>
        case "category":
          return <span className="text-muted-foreground/70">{item.category || "N/A"}</span>
        case "version":
          return <span className="text-muted-foreground/70">{item.version || "N/A"}</span>
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
        case "productName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "description":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.description")} value={item.description ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "subject":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.subject")} value={item.subject ?? "N/A"} />
            </div>
          )
        case "content":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.content")} value={item.content ?? "N/A"} />
            </div>
          )
        case "language":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.language")} value={item.language ?? "N/A"} />
            </div>
          )
        case "category":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.category")} value={item.category ?? "N/A"} />
            </div>
          )
        case "version":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("template.fields.version")} value={item.version ?? "N/A"} />
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
        label: isDeleting ? t("template.bulk.deleting") : t("template.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchTemplateResponse>
        columnHeaders={columnHeaders}
        items={templates}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("template.messages.noData")}
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
