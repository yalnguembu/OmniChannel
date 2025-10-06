import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useSetting } from "../hooks/useSetting"
import { SettingDataGridEntry } from "../lib/data-grid/SettingDataGridEntry"
import { useViewMode } from "@/shared/hooks/use-view-mode"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"

export const SettingDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    settings,
    searchSettings,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    deleteSetting,
    bulkDeleteMutation,
  } = useSetting()

  useEffect(() => {
    searchSettings()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "value",
      label: t("settings.headers.value"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("settings.headers.description"),
      sortable: true,
      resizable: true,
      style: "max-w-[100px] xl:max-w-[150px] 2xl:max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap",
    },
    {
      key: "dataType",
      label: t("settings.headers.dataType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "category",
      label: t("settings.headers.category"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("settings.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("settings.actions.more"),
      sortable: false,
      width: 110,
    },
  ]

  const gridItems = useMemo(() => {
    return settings.map((item) => new SettingDataGridEntry(item))
  }, [settings])

  const handleView = (id: string) => {
    navigate({ to: `/administration/settings/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/settings/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("settings.messages.delete.confirm"))) {
      deleteSetting(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("settings.bulk.deleteConfirm", { count: selectedRows.length }))) {
      bulkDeleteMutation.mutate(selectedRows)
    }
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "view":
        handleView(id)
        break
      case "edit":
        handleEdit(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
    }
  }

  const view = useViewMode()
  const actions = ["edit", "delete"] as ACTION[]

  const renderCell = (item: DataGridRowEntry, column: DataGridColumnHeader) => {
    if (view == "list") {
      switch (column.key) {
        case "actions":
          return <ActionButtonGroup isLoading={isLoading} row={item} actions={actions} dispatch={handleDispatch} view={view} />
        case "value":
          return (
            <div className="flex flex-col">
              <span className="text-blue-700 font-semibold">{item.getTextFor("value")}</span>
            </div>
          )
        case "dataType":
          return (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <div className="w-min">
                <StatusBadge theme={BadgeStyles.BLUE} text={item.getTextFor("dataType") as string} />
              </div>

              {JSON.parse(item.getTextFor("isEncrypted") as string) && (
                <div className="w-min">
                  <StatusBadge theme={BadgeStyles.BLUE} text={t("encrypted")} />
                </div>
              )}
              {JSON.parse(item.getTextFor("isSystemSetting") as string) && (
                <div className="w-min">
                  <StatusBadge theme={BadgeStyles.GREEN} text={t("system")} />
                </div>
              )}
              {JSON.parse(item.getTextFor("isReadOnly") as string) && (
                <div className="w-min">
                  <StatusBadge theme={BadgeStyles.YELLOW} text={t("readonly")} />
                </div>
              )}
            </div>
          )
        case "category":
          return (
            <div className="flex flex-col gap-y-1">
              <span className="flex gap-x-1 xl:gap-x-2">
                <span className="text-foreground/50">Cat:</span>
                <span className="text-green-500 font-semibold"> {item.getTextFor("category")}</span>
              </span>
              <span className="flex justify-between gap-x-1">
                <span className="text-foreground/50">Regex:</span>
                <span className="text-blue-500"> {item.getTextFor("validationRegex")}</span>
              </span>
              <span className="flex justify-between gap-x-1">
                <span className="text-foreground/50">Vals:</span>
                <span className="text-orange-500 font-semibold"> {item.getTextFor("allowedValues")}</span>
              </span>
            </div>
          )
        default:
          return item.getTextFor(column.key) || "N/A"
      }
    } else {
      const rowItem = {
        label: column.label,
        value: item.getTextFor(column.key),
        key: column.key,
        isBadge: column.isBadge,
        theme: column.badgeTheme,
        shouldClick: column.shouldClick,
      }
      if (rowItem.key === "actions")
        return (
          <div className="flex flex-row justify-end px-4 pt-2 border-t">
            {/* <span className="px-2 h-min text-sm font-semibold block min-w-14">{rowItem.label}</span> */}
            <ActionButtonGroup isLoading={isLoading} row={item} actions={actions} dispatch={handleDispatch} view={view} />
          </div>
        )
      else if (rowItem.key === "id") return <></>
      else
        return (
          <DetailsCardItem
            onClick={() => rowItem.shouldClick && handleDispatch("ROW_CLICK", item.getId())}
            shouldClick={rowItem.shouldClick}
            key={rowItem.key}
            label={rowItem.label ?? ""}
            value={`${rowItem.value || "N/A"}`}
            isBadge={rowItem.isBadge}
            theme={rowItem.theme}
            className={`mx-3 border-b border-b-foreground/5`}
          />
        )
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

  const bulkActions = hasSelection
    ? [
        {
          label: bulkDeleteMutation.isPending ? t("settings.bulk.deleting") : t("settings.bulk.delete", { count: selectedRows.length }),
          action: handleBulkDelete,
          variant: "destructive" as const,
          loading: bulkDeleteMutation.isPending,
        },
      ]
    : undefined

  return (
    <div className="w-full overflow-hidden">
      <DataGrid
        columnHeaders={columnHeaders}
        items={gridItems}
        total={totalItems}
        page={currentPage}
        limit={pageSize}
        hasPagination={true}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage={t("settings.messages.noData")}
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
        actions={actions}
        dispatch={handleDispatch}
        renderCell={renderCell}
      />
    </div>
  )
}
