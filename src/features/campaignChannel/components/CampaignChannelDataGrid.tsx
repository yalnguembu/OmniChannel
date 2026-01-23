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
import { SearchCampaignChannelResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CampaignChannelDataGridProps {
  campaignChannels: SearchCampaignChannelResponse[]
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

export const CampaignChannelDataGrid: React.FC<CampaignChannelDataGridProps> = ({
  campaignChannels,
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

  const columnHeaders: DataGridColumnHeader<SearchCampaignChannelResponse>[] = [
    {
      key: "campaignName",
      label: t("campaignChannel.fields.campaignName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignType",
      label: t("campaignChannel.fields.campaignType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignStatus",
      label: t("campaignChannel.fields.campaignStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelName",
      label: t("campaignChannel.fields.channelName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelCode",
      label: t("campaignChannel.fields.channelCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "templateName",
      label: t("campaignChannel.fields.templateName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "templateStatus",
      label: t("campaignChannel.fields.templateStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignId",
      label: t("campaignChannel.fields.campaignId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelId",
      label: t("campaignChannel.fields.channelId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "templateId",
      label: t("campaignChannel.fields.templateId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "priority",
      label: t("campaignChannel.fields.priority"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("campaignChannel.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/campaignChannel/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/campaignChannel/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("campaignChannel.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("campaignChannel.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCampaignChannelResponse, column: DataGridColumnHeader<SearchCampaignChannelResponse>, view: ViewMode): ReactNode => {
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
        case "templateName":
          return <span className="text-muted-foreground/70">{item.templateName || "N/A"}</span>
        case "templateStatus":
          return <span className="text-muted-foreground/70">{item.templateStatus || "N/A"}</span>
        case "campaignId":
          return <span className="text-muted-foreground/70">{item.campaignId || "N/A"}</span>
        case "channelId":
          return <span className="text-muted-foreground/70">{item.channelId || "N/A"}</span>
        case "templateId":
          return <span className="text-muted-foreground/70">{item.templateId || "N/A"}</span>
        case "priority":
          return <span className="text-muted-foreground/70">{item.priority || "N/A"}</span>
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
              <DetailsCardItem label={t("campaignChannel.fields.campaignName")} value={item.campaignName ?? "N/A"} />
            </div>
          )
        case "campaignType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.campaignType")} value={item.campaignType ?? "N/A"} />
            </div>
          )
        case "campaignStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.campaignStatus")} value={item.campaignStatus ?? "N/A"} />
            </div>
          )
        case "channelName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.channelName")} value={item.channelName ?? "N/A"} />
            </div>
          )
        case "channelCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.channelCode")} value={item.channelCode ?? "N/A"} />
            </div>
          )
        case "templateName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.templateName")} value={item.templateName ?? "N/A"} />
            </div>
          )
        case "templateStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.templateStatus")} value={item.templateStatus ?? "N/A"} />
            </div>
          )
        case "campaignId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.campaignId")} value={item.campaignId ?? "N/A"} />
            </div>
          )
        case "channelId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.channelId")} value={item.channelId ?? "N/A"} />
            </div>
          )
        case "templateId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.templateId")} value={item.templateId ?? "N/A"} />
            </div>
          )
        case "priority":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignChannel.fields.priority")} value={item.priority ?? "N/A"} />
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
        label: isDeleting ? t("campaignChannel.bulk.deleting") : t("campaignChannel.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCampaignChannelResponse>
        columnHeaders={columnHeaders}
        items={campaignChannels}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("campaignChannel.messages.noData")}
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
