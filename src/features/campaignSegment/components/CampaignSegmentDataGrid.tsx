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
import { SearchCampaignSegmentResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CampaignSegmentDataGridProps {
  campaignSegments: SearchCampaignSegmentResponse[]
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

export const CampaignSegmentDataGrid: React.FC<CampaignSegmentDataGridProps> = ({
  campaignSegments,
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

  const columnHeaders: DataGridColumnHeader<SearchCampaignSegmentResponse>[] = [
    {
      key: "campaignName",
      label: t("campaignSegment.fields.campaignName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignType",
      label: t("campaignSegment.fields.campaignType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignStatus",
      label: t("campaignSegment.fields.campaignStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "segmentName",
      label: t("campaignSegment.fields.segmentName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignId",
      label: t("campaignSegment.fields.campaignId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "segmentId",
      label: t("campaignSegment.fields.segmentId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("campaignSegment.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/campaignSegment/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/campaignSegment/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("campaignSegment.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("campaignSegment.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCampaignSegmentResponse, column: DataGridColumnHeader<SearchCampaignSegmentResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "campaignName":
          return <span className="text-muted-foreground/70">{item.campaignName || "N/A"}</span>
        case "campaignType":
          return <span className="text-muted-foreground/70">{item.campaignType || "N/A"}</span>
        case "campaignStatus":
          return <span className="text-muted-foreground/70">{item.campaignStatus || "N/A"}</span>
        case "segmentName":
          return <span className="text-muted-foreground/70">{item.segmentName || "N/A"}</span>
        case "campaignId":
          return <span className="text-muted-foreground/70">{item.campaignId || "N/A"}</span>
        case "segmentId":
          return <span className="text-muted-foreground/70">{item.segmentId || "N/A"}</span>
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
              <DetailsCardItem label={t("campaignSegment.fields.campaignName")} value={item.campaignName ?? "N/A"} />
            </div>
          )
        case "campaignType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignSegment.fields.campaignType")} value={item.campaignType ?? "N/A"} />
            </div>
          )
        case "campaignStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignSegment.fields.campaignStatus")} value={item.campaignStatus ?? "N/A"} />
            </div>
          )
        case "segmentName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignSegment.fields.segmentName")} value={item.segmentName ?? "N/A"} />
            </div>
          )
        case "campaignId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignSegment.fields.campaignId")} value={item.campaignId ?? "N/A"} />
            </div>
          )
        case "segmentId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignSegment.fields.segmentId")} value={item.segmentId ?? "N/A"} />
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
        label: isDeleting ? t("campaignSegment.bulk.deleting") : t("campaignSegment.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCampaignSegmentResponse>
        columnHeaders={columnHeaders}
        items={campaignSegments}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("campaignSegment.messages.noData")}
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
