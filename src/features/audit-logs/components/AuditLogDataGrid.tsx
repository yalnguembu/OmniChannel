import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import { useAuditLog } from "../hooks/useAuditLog"
import { AuditLogDataGridEntry } from "../lib/data-grid/AuditLogDataGridEntry"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { AuditLogDto } from "@/shared/api/types.gen"

export const AuditLogDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const [selectedItem, setSelectedItem] = useState<AuditLogDto | null>(null)

  const { auditLogs, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows } = useAuditLog()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("auditlogs.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("auditlogs.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyPhoneNumber",
      label: t("auditlogs.headers.companyPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("auditlogs.headers.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("auditlogs.headers.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userFirstName",
      label: t("auditlogs.headers.userFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userLastName",
      label: t("auditlogs.headers.userLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userPhoneNumber",
      label: t("auditlogs.headers.userPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userStatus",
      label: t("auditlogs.headers.userStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userEmail",
      label: t("auditlogs.headers.userEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("auditlogs.headers.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("auditlogs.headers.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityType",
      label: t("auditlogs.headers.entityType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityName",
      label: t("auditlogs.headers.entityName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityDisplayName",
      label: t("auditlogs.headers.entityDisplayName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityId",
      label: t("auditlogs.headers.entityId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "action",
      label: t("auditlogs.headers.action"),
      sortable: true,
      resizable: true,
    },
    {
      key: "oldValues",
      label: t("auditlogs.headers.oldValues"),
      sortable: true,
      resizable: true,
    },
    {
      key: "newValues",
      label: t("auditlogs.headers.newValues"),
      sortable: true,
      resizable: true,
    },
    {
      key: "changedColumn",
      label: t("auditlogs.headers.changedColumn"),
      sortable: true,
      resizable: true,
    },
    {
      key: "changeReason",
      label: t("auditlogs.headers.changeReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("auditlogs.headers.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userAgent",
      label: t("auditlogs.headers.userAgent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "riskLevel",
      label: t("auditlogs.headers.riskLevel"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("auditLogs.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return auditLogs.map((item) => new AuditLogDataGridEntry(item))
  }, [auditLogs])

  const renderCell = (item: DataGridRowEntry, columnKey: string) => {
    switch (columnKey) {
      case "actions":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(item.getId())}>
                <Eye className="mr-2 h-4 w-4" />
                {t("auditLogs.actions.view")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      default:
        return item.getTextFor(columnKey) || "N/A"
    }
  }

  const sortConfig: DataGridSort | undefined = sortBy
    ? {
        column: sortBy,
        direction: sortDirection === "desc" ? SortDirection.DESC : SortDirection.ASC,
      }
    : undefined

  const handleSortChange = (config: DataGridSort) => {
    const direction = config.direction
    changeSort(config.column, direction)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds)
  }

  const handlePageChange = (page: number) => {
    changePage(page)
  }

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const handleView = (id: string) => {
    const item = auditLogs.find((auditLog) => auditLog.id === id)
    if (item) {
      setSelectedItem(item)
      setShowDetailsModal(true)
    }
  }
  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
      <Label className="font-semibold text-muted-foreground">{label}</Label>
      <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
    </div>
  )

  interface BlockedIpDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<AuditLogDto>
  }

  const BlockedIpDetails: React.FC<BlockedIpDetailsProps> = ({ onCancel, open, data }) => (
    <ModalWrapper open={open} onOpenChange={onCancel} title={t("auditLogs.details.title")}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>SmsmailTemplate Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            if (key === "id") return null
            const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
            return <DetailItem key={key} label={formattedKey} value={value} />
          })}
        </CardContent>
      </Card>
    </ModalWrapper>
  )

  return (
    <div className="w-full max-w-full overflow-hidden">
      <DataGrid
        columnHeaders={columnHeaders}
        items={gridItems}
        total={totalItems}
        page={currentPage}
        limit={pageSize}
        hasPagination={true}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage={t("auditLogs.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        renderCell={renderCell}
      />
      {showDetailsModal && !!selectedItem && <BlockedIpDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
    </div>
  )
}
