import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import { useFrontEventLog } from "../hooks/useFrontEventLog"
import { FrontEventLogDataGridEntry } from "../lib/data-grid/FrontEventLogDataGridEntry"

import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { FrontEventLogDto } from "@/shared"

export const FrontEventLogDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const { frontEventLogs, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows } = useFrontEventLog()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("fronteventlogs.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("fronteventlogs.headers.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "date",
      label: t("fronteventlogs.headers.date"),
      sortable: true,
      resizable: true,
    },
    {
      key: "environment",
      label: t("fronteventlogs.headers.environment"),
      sortable: true,
      resizable: true,
    },
    {
      key: "sessionId",
      label: t("fronteventlogs.headers.sessionId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userAgent",
      label: t("fronteventlogs.headers.userAgent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("fronteventlogs.headers.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "path",
      label: t("fronteventlogs.headers.path"),
      sortable: true,
      resizable: true,
    },
    {
      key: "action",
      label: t("fronteventlogs.headers.action"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("fronteventlogs.headers.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "additionalData",
      label: t("fronteventlogs.headers.additionalData"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("frontEventLogs.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return frontEventLogs.map((item) => new FrontEventLogDataGridEntry(item))
  }, [frontEventLogs])

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
                {t("frontEventLogs.actions.view")}
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

  const [selectedItem, setSelectedItem] = useState<FrontEventLogDto | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const handleView = (id: string) => {
    const item = frontEventLogs.find((frontEventLog) => frontEventLog.id === id)
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

  interface FrontEventLogDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<FrontEventLogDto>
  }

  const BlockedIpDetails: React.FC<FrontEventLogDetailsProps> = ({ onCancel, open, data }) => (
    <ModalWrapper open={open} onOpenChange={onCancel} title={t("smsmailTemplates.details.title")}>
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
        emptyMessage={t("frontEventLogs.messages.noData")}
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
