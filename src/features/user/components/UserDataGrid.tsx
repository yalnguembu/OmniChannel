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
import { SearchUserResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface UserDataGridProps {
  users: SearchUserResponse[]
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

export const UserDataGrid: React.FC<UserDataGridProps> = ({
  users,
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

  const columnHeaders: DataGridColumnHeader<SearchUserResponse>[] = [
    {
      key: "companyName",
      label: t("user.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("user.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("user.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "profileName",
      label: t("user.fields.profileName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userSecurityFirstName",
      label: t("user.fields.userSecurityFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userSecurityLastName",
      label: t("user.fields.userSecurityLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userSecurityPhoneNumber",
      label: t("user.fields.userSecurityPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userSecurityStatus",
      label: t("user.fields.userSecurityStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userSecurityEmail",
      label: t("user.fields.userSecurityEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("user.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "profileId",
      label: t("user.fields.profileId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "firstName",
      label: t("user.fields.firstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastName",
      label: t("user.fields.lastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "email",
      label: t("user.fields.email"),
      sortable: true,
      resizable: true,
    },
    {
      key: "phoneNumber",
      label: t("user.fields.phoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userType",
      label: t("user.fields.userType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("user.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "deletionReason",
      label: t("user.fields.deletionReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("user.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/user/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/user/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("user.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("user.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchUserResponse, column: DataGridColumnHeader<SearchUserResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "profileName":
          return <span className="text-muted-foreground/70">{item.profileName || "N/A"}</span>
        case "userSecurityFirstName":
          return <span className="text-muted-foreground/70">{item.userSecurityFirstName || "N/A"}</span>
        case "userSecurityLastName":
          return <span className="text-muted-foreground/70">{item.userSecurityLastName || "N/A"}</span>
        case "userSecurityPhoneNumber":
          return <span className="text-muted-foreground/70">{item.userSecurityPhoneNumber || "N/A"}</span>
        case "userSecurityStatus":
          return <span className="text-muted-foreground/70">{item.userSecurityStatus || "N/A"}</span>
        case "userSecurityEmail":
          return <span className="text-muted-foreground/70">{item.userSecurityEmail || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "profileId":
          return <span className="text-muted-foreground/70">{item.profileId || "N/A"}</span>
        case "firstName":
          return <span className="text-muted-foreground/70">{item.firstName || "N/A"}</span>
        case "lastName":
          return <span className="text-muted-foreground/70">{item.lastName || "N/A"}</span>
        case "email":
          return <span className="text-muted-foreground/70">{item.email || "N/A"}</span>
        case "phoneNumber":
          return <span className="text-muted-foreground/70">{item.phoneNumber || "N/A"}</span>
        case "userType":
          return <span className="text-muted-foreground/70">{item.userType || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "deletionReason":
          return <span className="text-muted-foreground/70">{item.deletionReason || "N/A"}</span>
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
              <DetailsCardItem label={t("user.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "profileName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.profileName")} value={item.profileName ?? "N/A"} />
            </div>
          )
        case "userSecurityFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.userSecurityFirstName")} value={item.userSecurityFirstName ?? "N/A"} />
            </div>
          )
        case "userSecurityLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.userSecurityLastName")} value={item.userSecurityLastName ?? "N/A"} />
            </div>
          )
        case "userSecurityPhoneNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.userSecurityPhoneNumber")} value={item.userSecurityPhoneNumber ?? "N/A"} />
            </div>
          )
        case "userSecurityStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.userSecurityStatus")} value={item.userSecurityStatus ?? "N/A"} />
            </div>
          )
        case "userSecurityEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.userSecurityEmail")} value={item.userSecurityEmail ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "profileId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.profileId")} value={item.profileId ?? "N/A"} />
            </div>
          )
        case "firstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.firstName")} value={item.firstName ?? "N/A"} />
            </div>
          )
        case "lastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.lastName")} value={item.lastName ?? "N/A"} />
            </div>
          )
        case "email":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.email")} value={item.email ?? "N/A"} />
            </div>
          )
        case "phoneNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.phoneNumber")} value={item.phoneNumber ?? "N/A"} />
            </div>
          )
        case "userType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.userType")} value={item.userType ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "deletionReason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("user.fields.deletionReason")} value={item.deletionReason ?? "N/A"} />
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
        label: isDeleting ? t("user.bulk.deleting") : t("user.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchUserResponse>
        columnHeaders={columnHeaders}
        items={users}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("user.messages.noData")}
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
