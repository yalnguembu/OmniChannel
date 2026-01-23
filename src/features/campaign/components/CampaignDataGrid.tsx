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
import { SearchCampaignResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CampaignDataGridProps {
  campaigns: SearchCampaignResponse[]
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

export const CampaignDataGrid: React.FC<CampaignDataGridProps> = ({
  campaigns,
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

  const columnHeaders: DataGridColumnHeader<SearchCampaignResponse>[] = [
    {
      key: "campaignStatisticName",
      label: t("campaign.fields.campaignStatisticName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignStatisticType",
      label: t("campaign.fields.campaignStatisticType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignStatisticStatus",
      label: t("campaign.fields.campaignStatisticStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productName",
      label: t("campaign.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("campaign.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("campaign.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("campaign.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("campaign.fields.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("campaign.fields.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("campaign.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "scheduledAt",
      label: t("campaign.fields.scheduledAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "startedAt",
      label: t("campaign.fields.startedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "completedAt",
      label: t("campaign.fields.completedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "recurrencePattern",
      label: t("campaign.fields.recurrencePattern"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalRecipients",
      label: t("campaign.fields.totalRecipients"),
      sortable: true,
      resizable: true,
    },
    {
      key: "successfulSends",
      label: t("campaign.fields.successfulSends"),
      sortable: true,
      resizable: true,
    },
    {
      key: "failedSends",
      label: t("campaign.fields.failedSends"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("campaign.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/campaign/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/campaign/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("campaign.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("campaign.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCampaignResponse, column: DataGridColumnHeader<SearchCampaignResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "campaignStatisticName":
          return <span className="text-muted-foreground/70">{item.campaignStatisticName || "N/A"}</span>
        case "campaignStatisticType":
          return <span className="text-muted-foreground/70">{item.campaignStatisticType || "N/A"}</span>
        case "campaignStatisticStatus":
          return <span className="text-muted-foreground/70">{item.campaignStatisticStatus || "N/A"}</span>
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
        case "type":
          return <span className="text-muted-foreground/70">{item.type || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "scheduledAt":
          return <span className="text-muted-foreground/70">{item.scheduledAt || "N/A"}</span>
        case "startedAt":
          return <span className="text-muted-foreground/70">{item.startedAt || "N/A"}</span>
        case "completedAt":
          return <span className="text-muted-foreground/70">{item.completedAt || "N/A"}</span>
        case "recurrencePattern":
          return <span className="text-muted-foreground/70">{item.recurrencePattern || "N/A"}</span>
        case "totalRecipients":
          return <span className="text-muted-foreground/70">{item.totalRecipients || "N/A"}</span>
        case "successfulSends":
          return <span className="text-muted-foreground/70">{item.successfulSends || "N/A"}</span>
        case "failedSends":
          return <span className="text-muted-foreground/70">{item.failedSends || "N/A"}</span>
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
        case "campaignStatisticName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.campaignStatisticName")} value={item.campaignStatisticName ?? "N/A"} />
            </div>
          )
        case "campaignStatisticType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.campaignStatisticType")} value={item.campaignStatisticType ?? "N/A"} />
            </div>
          )
        case "campaignStatisticStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.campaignStatisticStatus")} value={item.campaignStatisticStatus ?? "N/A"} />
            </div>
          )
        case "productName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "description":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.description")} value={item.description ?? "N/A"} />
            </div>
          )
        case "type":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.type")} value={item.type ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "scheduledAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.scheduledAt")} value={item.scheduledAt ?? "N/A"} />
            </div>
          )
        case "startedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.startedAt")} value={item.startedAt ?? "N/A"} />
            </div>
          )
        case "completedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.completedAt")} value={item.completedAt ?? "N/A"} />
            </div>
          )
        case "recurrencePattern":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.recurrencePattern")} value={item.recurrencePattern ?? "N/A"} />
            </div>
          )
        case "totalRecipients":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.totalRecipients")} value={item.totalRecipients ?? "N/A"} />
            </div>
          )
        case "successfulSends":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.successfulSends")} value={item.successfulSends ?? "N/A"} />
            </div>
          )
        case "failedSends":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaign.fields.failedSends")} value={item.failedSends ?? "N/A"} />
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
        label: isDeleting ? t("campaign.bulk.deleting") : t("campaign.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCampaignResponse>
        columnHeaders={columnHeaders}
        items={campaigns}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("campaign.messages.noData")}
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
