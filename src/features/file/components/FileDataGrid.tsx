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
import { SearchFileResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface FileDataGridProps {
  files: SearchFileResponse[]
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

export const FileDataGrid: React.FC<FileDataGridProps> = ({
  files,
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

  const columnHeaders: DataGridColumnHeader<SearchFileResponse>[] = [
    {
      key: "companyName",
      label: t("file.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("file.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("file.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByFirstName",
      label: t("file.fields.createdByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByLastName",
      label: t("file.fields.createdByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByPhoneNumber",
      label: t("file.fields.createdByPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByStatus",
      label: t("file.fields.createdByStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdByEmail",
      label: t("file.fields.createdByEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("file.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fileName",
      label: t("file.fields.fileName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "originalFileName",
      label: t("file.fields.originalFileName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "mimeType",
      label: t("file.fields.mimeType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fileSize",
      label: t("file.fields.fileSize"),
      sortable: true,
      resizable: true,
    },
    {
      key: "storagePath",
      label: t("file.fields.storagePath"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fileType",
      label: t("file.fields.fileType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isPublic",
      label: t("file.fields.isPublic"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("file.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/file/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/file/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("file.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("file.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchFileResponse, column: DataGridColumnHeader<SearchFileResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "createdByFirstName":
          return <span className="text-muted-foreground/70">{item.createdByFirstName || "N/A"}</span>
        case "createdByLastName":
          return <span className="text-muted-foreground/70">{item.createdByLastName || "N/A"}</span>
        case "createdByPhoneNumber":
          return <span className="text-muted-foreground/70">{item.createdByPhoneNumber || "N/A"}</span>
        case "createdByStatus":
          return <span className="text-muted-foreground/70">{item.createdByStatus || "N/A"}</span>
        case "createdByEmail":
          return <span className="text-muted-foreground/70">{item.createdByEmail || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "fileName":
          return <span className="text-muted-foreground/70">{item.fileName || "N/A"}</span>
        case "originalFileName":
          return <span className="text-muted-foreground/70">{item.originalFileName || "N/A"}</span>
        case "mimeType":
          return <span className="text-muted-foreground/70">{item.mimeType || "N/A"}</span>
        case "fileSize":
          return <span className="text-muted-foreground/70">{item.fileSize || "N/A"}</span>
        case "storagePath":
          return <span className="text-muted-foreground/70">{item.storagePath || "N/A"}</span>
        case "fileType":
          return <span className="text-muted-foreground/70">{item.fileType || "N/A"}</span>
        case "isPublic":
          return <span className="text-muted-foreground/70">{item.isPublic || "N/A"}</span>
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
              <DetailsCardItem label={t("file.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "createdByFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.createdByFirstName")} value={item.createdByFirstName ?? "N/A"} />
            </div>
          )
        case "createdByLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.createdByLastName")} value={item.createdByLastName ?? "N/A"} />
            </div>
          )
        case "createdByPhoneNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.createdByPhoneNumber")} value={item.createdByPhoneNumber ?? "N/A"} />
            </div>
          )
        case "createdByStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.createdByStatus")} value={item.createdByStatus ?? "N/A"} />
            </div>
          )
        case "createdByEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.createdByEmail")} value={item.createdByEmail ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "fileName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.fileName")} value={item.fileName ?? "N/A"} />
            </div>
          )
        case "originalFileName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.originalFileName")} value={item.originalFileName ?? "N/A"} />
            </div>
          )
        case "mimeType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.mimeType")} value={item.mimeType ?? "N/A"} />
            </div>
          )
        case "fileSize":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.fileSize")} value={item.fileSize ?? "N/A"} />
            </div>
          )
        case "storagePath":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.storagePath")} value={item.storagePath ?? "N/A"} />
            </div>
          )
        case "fileType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.fileType")} value={item.fileType ?? "N/A"} />
            </div>
          )
        case "isPublic":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("file.fields.isPublic")} value={item.isPublic ?? "N/A"} />
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
        label: isDeleting ? t("file.bulk.deleting") : t("file.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchFileResponse>
        columnHeaders={columnHeaders}
        items={files}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("file.messages.noData")}
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
