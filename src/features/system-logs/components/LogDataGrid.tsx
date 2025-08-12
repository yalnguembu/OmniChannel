import { useTranslation } from "react-i18next"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { useLog } from "../hooks/useLog"
import { LogDataGridEntry } from "../lib/data-grid/LogDataGridEntry"
import { useState, useMemo } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { MoreHorizontal, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { LogDto } from "@/shared/api/types.gen"

export const LogDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = useState<LogDto | null>(null)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const { logs, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows } = useLog()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "logLevel",
      label: t("logs.headers.logLevel"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("logs.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "machineName",
      label: t("logs.headers.machineName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "environment",
      label: t("logs.headers.environment"),
      sortable: true,
      resizable: true,
    },
    {
      key: "correlationId",
      label: t("logs.headers.correlationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "message",
      label: t("logs.headers.message"),
      sortable: true,
      resizable: true,
    },
    {
      key: "exceptionMessage",
      label: t("logs.headers.exceptionMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "stackTrace",
      label: t("logs.headers.stackTrace"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("logs.headers.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "requestUri",
      label: t("logs.headers.requestUri"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("logs.headers.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userName",
      label: t("logs.headers.userName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "additionalData",
      label: t("logs.headers.additionalData"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("logs.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("logs.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return logs.map((item) => new LogDataGridEntry(item))
  }, [logs])

  const handleView = (id: string) => {
    const item = logs.find((log) => log.id === id)
    if (item) {
      setSelectedItem(item)
      setShowDetailsModal(true)
    }
  }
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
                {t("logs.actions.view")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      default:
        return item.getTextFor(columnKey)
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

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
      <Label className="font-semibold text-muted-foreground">{label}</Label>
      <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
    </div>
  )

  interface LogDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<LogDto>
  }

  const LogDetails: React.FC<LogDetailsProps> = ({ onCancel, open, data }) => (
    <ModalWrapper open={open} onOpenChange={onCancel} title={t("smsmailTemplates.details.title")}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Log Details</CardTitle>
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
        emptyMessage={t("logs.messages.noData")}
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
      {showDetailsModal && !!selectedItem && <LogDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
    </div>
  )
}
