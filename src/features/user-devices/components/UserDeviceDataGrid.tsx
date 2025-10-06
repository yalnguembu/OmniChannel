import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import { useUserDevice } from "../hooks/useUserDevice"
import { UserDeviceDataGridEntry } from "../lib/data-grid/UserDeviceDataGridEntry"

export const UserDeviceDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { userDevices, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows } = useUserDevice()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("userdevices.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userFirstName",
      label: t("userdevices.headers.userFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userLastName",
      label: t("userdevices.headers.userLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userPhoneNumber",
      label: t("userdevices.headers.userPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userStatus",
      label: t("userdevices.headers.userStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userEmail",
      label: t("userdevices.headers.userEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("userdevices.headers.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipaddress",
      label: t("userdevices.headers.ipaddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userAgent",
      label: t("userdevices.headers.userAgent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "deviceType",
      label: t("userdevices.headers.deviceType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "os",
      label: t("userdevices.headers.os"),
      sortable: true,
      resizable: true,
    },
    {
      key: "browser",
      label: t("userdevices.headers.browser"),
      sortable: true,
      resizable: true,
    },
    {
      key: "screenResolution",
      label: t("userdevices.headers.screenResolution"),
      sortable: true,
      resizable: true,
    },
    {
      key: "language",
      label: t("userdevices.headers.language"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("userdevices.headers.status"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("userDevices.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return userDevices.map((item) => new UserDeviceDataGridEntry(item))
  }, [userDevices])

  const handleView = (id: string) => {
    navigate({ to: `/userDevice/${id}` })
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
                {t("userDevices.actions.view")}
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

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  const bulkActions = undefined

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
        emptyMessage={t("userDevices.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        bulkActions={bulkActions}
        renderCell={renderCell}
      />
    </div>
  )
}
