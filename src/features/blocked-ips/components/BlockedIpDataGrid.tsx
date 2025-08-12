import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useBlockedIp } from "../hooks/useBlockedIp"
import { BlockedIpDataGridEntry } from "../lib/data-grid/BlockedIpDataGridEntry"
import { BlockedIpDto, UpdateBlockedIpRequest } from "@/shared"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { BlockedIpEditForm } from "./BlockedIpEditForm"

export const BlockedIpDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    blockedIps,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changeSort,
    setSelectedRows,
    deleteBlockedIp,
    updateMutation,
  } = useBlockedIp()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("blockedips.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("blockedips.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationStatus",
      label: t("blockedips.headers.applicationStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationId",
      label: t("blockedips.headers.applicationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("blockedips.headers.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reason",
      label: t("blockedips.headers.reason"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("blockedIp.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return blockedIps.map((item) => new BlockedIpDataGridEntry(item))
  }, [blockedIps])

  const handleDelete = (id: string) => {
    if (confirm(t("blockedIp.messages.delete.confirm"))) {
      deleteBlockedIp(id)
    }
  }

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const [showEditModal, setShowEditModal] = useState(false)
  const toggleShowEditModal = () => setShowEditModal((prev) => !prev)
  const [selectedItem, setSelectedItem] = useState<BlockedIpDto | null>(null)

  const handleEdit = (id: string) => {
    const item = blockedIps.find((blockedIp) => blockedIp.id === id)
    if (item) {
      setSelectedItem(item)
      setShowEditModal(true)
    }
  }

  const handleView = (id: string) => {
    const item = blockedIps.find((blockedIp) => blockedIp.id === id)
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
    data: Partial<BlockedIpDto>
  }

  const BlockedIpDetails: React.FC<BlockedIpDetailsProps> = ({ onCancel, open, data }) => (
    <ModalWrapper open={open} onOpenChange={onCancel} title={t("blockedIp.details.title")}>
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
                {t("blockedIp.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("blockedIp.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("blockedIp.actions.delete")}
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

  const handleSubmit = (data: UpdateBlockedIpRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowEditModal(),
      },
    )
  }

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
        emptyMessage={t("blockedIp.messages.noData")}
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

      {showEditModal && !!selectedItem && (
        <BlockedIpEditForm initialData={selectedItem} blockedIpId={selectedItem.id ?? ""} onSubmit={handleSubmit} onCancel={toggleShowEditModal} isLoading={false} />
      )}
      {showDetailsModal && !!selectedItem && <BlockedIpDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
    </div>
  )
}
