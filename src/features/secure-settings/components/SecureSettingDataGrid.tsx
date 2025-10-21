import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useSecureSetting } from "../hooks/useSecureSetting"
import { SecureSettingDataGridEntry } from "../lib/data-grid/SecureSettingDataGridEntry"

export const SecureSettingDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    secureSettings,
    searchSecureSettings,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
  } = useSecureSetting()

  useEffect(() => {
    searchSecureSettings()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "systemName",
      label: t("securesettings.headers.systemName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("securesettings.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("securesettings.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("common.actions.more"),
      sortable: false,
      width: 120,
    },
  ]

  const gridItems = useMemo(() => {
    return Array.from(new Map(secureSettings.map((item) => [item.systemName, item])).values()).map((item) => new SecureSettingDataGridEntry(item))
  }, [secureSettings])

  const handleView = (id: string) => {
    navigate({ to: `/administration/secure-settings/${id}` })
  }

  const handleEdit = (id: string) => {
    const settingName = gridItems.find((setting) => setting.getId() == id)?.getTextFor("systemName")
    navigate({ to: `/administration/secure-settings/${settingName}/edit` })
  }
  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "view":
        handleView(id)
        break
      case "edit":
        handleEdit(id)
        break
      // case "delete":
      // handleDelete(id)
      // break
      default:
        return
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
        emptyMessage={t("secureSettings.messages.noData")}
        enableSelection={false}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        actions={["edit", "delete"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
