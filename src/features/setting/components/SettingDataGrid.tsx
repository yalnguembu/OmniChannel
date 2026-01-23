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
import { SearchSettingResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface SettingDataGridProps {
  settings: SearchSettingResponse[]
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

export const SettingDataGrid: React.FC<SettingDataGridProps> = ({
  settings,
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

  const columnHeaders: DataGridColumnHeader<SearchSettingResponse>[] = [
    {
      key: "value",
      label: t("setting.fields.value"),
      sortable: true,
      resizable: true,
    },
    {
      key: "dataType",
      label: t("setting.fields.dataType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isEncrypted",
      label: t("setting.fields.isEncrypted"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("setting.fields.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "category",
      label: t("setting.fields.category"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isReadOnly",
      label: t("setting.fields.isReadOnly"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isSystemSetting",
      label: t("setting.fields.isSystemSetting"),
      sortable: true,
      resizable: true,
    },
    {
      key: "allowedValues",
      label: t("setting.fields.allowedValues"),
      sortable: true,
      resizable: true,
    },
    {
      key: "validationRegex",
      label: t("setting.fields.validationRegex"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("setting.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/setting/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/setting/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("setting.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("setting.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchSettingResponse, column: DataGridColumnHeader<SearchSettingResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "value":
          return <span className="text-muted-foreground/70">{item.value || "N/A"}</span>
        case "dataType":
          return <span className="text-muted-foreground/70">{item.dataType || "N/A"}</span>
        case "isEncrypted":
          return <span className="text-muted-foreground/70">{item.isEncrypted || "N/A"}</span>
        case "description":
          return <span className="text-muted-foreground/70">{item.description || "N/A"}</span>
        case "category":
          return <span className="text-muted-foreground/70">{item.category || "N/A"}</span>
        case "isReadOnly":
          return <span className="text-muted-foreground/70">{item.isReadOnly || "N/A"}</span>
        case "isSystemSetting":
          return <span className="text-muted-foreground/70">{item.isSystemSetting || "N/A"}</span>
        case "allowedValues":
          return <span className="text-muted-foreground/70">{item.allowedValues || "N/A"}</span>
        case "validationRegex":
          return <span className="text-muted-foreground/70">{item.validationRegex || "N/A"}</span>
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
        case "value":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.value")} value={item.value ?? "N/A"} />
            </div>
          )
        case "dataType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.dataType")} value={item.dataType ?? "N/A"} />
            </div>
          )
        case "isEncrypted":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.isEncrypted")} value={item.isEncrypted ?? "N/A"} />
            </div>
          )
        case "description":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.description")} value={item.description ?? "N/A"} />
            </div>
          )
        case "category":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.category")} value={item.category ?? "N/A"} />
            </div>
          )
        case "isReadOnly":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.isReadOnly")} value={item.isReadOnly ?? "N/A"} />
            </div>
          )
        case "isSystemSetting":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.isSystemSetting")} value={item.isSystemSetting ?? "N/A"} />
            </div>
          )
        case "allowedValues":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.allowedValues")} value={item.allowedValues ?? "N/A"} />
            </div>
          )
        case "validationRegex":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("setting.fields.validationRegex")} value={item.validationRegex ?? "N/A"} />
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
        label: isDeleting ? t("setting.bulk.deleting") : t("setting.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchSettingResponse>
        columnHeaders={columnHeaders}
        items={settings}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("setting.messages.noData")}
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
