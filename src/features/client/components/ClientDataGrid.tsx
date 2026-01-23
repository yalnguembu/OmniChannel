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
import { SearchClientResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ClientDataGridProps {
  clients: SearchClientResponse[]
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

export const ClientDataGrid: React.FC<ClientDataGridProps> = ({
  clients,
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

  const columnHeaders: DataGridColumnHeader<SearchClientResponse>[] = [
    {
      key: "productName",
      label: t("client.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("client.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("client.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalId",
      label: t("client.fields.externalId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "email",
      label: t("client.fields.email"),
      sortable: true,
      resizable: true,
    },
    {
      key: "phone",
      label: t("client.fields.phone"),
      sortable: true,
      resizable: true,
    },
    {
      key: "firstName",
      label: t("client.fields.firstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastName",
      label: t("client.fields.lastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "gender",
      label: t("client.fields.gender"),
      sortable: true,
      resizable: true,
    },
    {
      key: "birthDate",
      label: t("client.fields.birthDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "language",
      label: t("client.fields.language"),
      sortable: true,
      resizable: true,
    },
    {
      key: "timezone",
      label: t("client.fields.timezone"),
      sortable: true,
      resizable: true,
    },
    {
      key: "address",
      label: t("client.fields.address"),
      sortable: true,
      resizable: true,
    },
    {
      key: "city",
      label: t("client.fields.city"),
      sortable: true,
      resizable: true,
    },
    {
      key: "postalCode",
      label: t("client.fields.postalCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "country",
      label: t("client.fields.country"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("client.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "customData",
      label: t("client.fields.customData"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("client.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/client/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/client/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("client.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("client.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchClientResponse, column: DataGridColumnHeader<SearchClientResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "productName":
          return <span className="text-muted-foreground/70">{item.productName || "N/A"}</span>
        case "productStatus":
          return <span className="text-muted-foreground/70">{item.productStatus || "N/A"}</span>
        case "productId":
          return <span className="text-muted-foreground/70">{item.productId || "N/A"}</span>
        case "externalId":
          return <span className="text-muted-foreground/70">{item.externalId || "N/A"}</span>
        case "email":
          return <span className="text-muted-foreground/70">{item.email || "N/A"}</span>
        case "phone":
          return <span className="text-muted-foreground/70">{item.phone || "N/A"}</span>
        case "firstName":
          return <span className="text-muted-foreground/70">{item.firstName || "N/A"}</span>
        case "lastName":
          return <span className="text-muted-foreground/70">{item.lastName || "N/A"}</span>
        case "gender":
          return <span className="text-muted-foreground/70">{item.gender || "N/A"}</span>
        case "birthDate":
          return <span className="text-muted-foreground/70">{item.birthDate || "N/A"}</span>
        case "language":
          return <span className="text-muted-foreground/70">{item.language || "N/A"}</span>
        case "timezone":
          return <span className="text-muted-foreground/70">{item.timezone || "N/A"}</span>
        case "address":
          return <span className="text-muted-foreground/70">{item.address || "N/A"}</span>
        case "city":
          return <span className="text-muted-foreground/70">{item.city || "N/A"}</span>
        case "postalCode":
          return <span className="text-muted-foreground/70">{item.postalCode || "N/A"}</span>
        case "country":
          return <span className="text-muted-foreground/70">{item.country || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "customData":
          return <span className="text-muted-foreground/70">{item.customData || "N/A"}</span>
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
              <DetailsCardItem label={t("client.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "externalId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.externalId")} value={item.externalId ?? "N/A"} />
            </div>
          )
        case "email":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.email")} value={item.email ?? "N/A"} />
            </div>
          )
        case "phone":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.phone")} value={item.phone ?? "N/A"} />
            </div>
          )
        case "firstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.firstName")} value={item.firstName ?? "N/A"} />
            </div>
          )
        case "lastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.lastName")} value={item.lastName ?? "N/A"} />
            </div>
          )
        case "gender":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.gender")} value={item.gender ?? "N/A"} />
            </div>
          )
        case "birthDate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.birthDate")} value={item.birthDate ?? "N/A"} />
            </div>
          )
        case "language":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.language")} value={item.language ?? "N/A"} />
            </div>
          )
        case "timezone":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.timezone")} value={item.timezone ?? "N/A"} />
            </div>
          )
        case "address":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.address")} value={item.address ?? "N/A"} />
            </div>
          )
        case "city":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.city")} value={item.city ?? "N/A"} />
            </div>
          )
        case "postalCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.postalCode")} value={item.postalCode ?? "N/A"} />
            </div>
          )
        case "country":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.country")} value={item.country ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "customData":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("client.fields.customData")} value={item.customData ?? "N/A"} />
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
        label: isDeleting ? t("client.bulk.deleting") : t("client.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchClientResponse>
        columnHeaders={columnHeaders}
        items={clients}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("client.messages.noData")}
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
