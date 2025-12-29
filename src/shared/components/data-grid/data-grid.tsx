import React, { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataTablePagination } from "./data-table-pagination"
import { ChevronDown, ChevronUp, ChevronsUpDown, Settings2 } from "lucide-react"
import { DataGridColumnHeader, DataGridProps, DataGridRowEntry, DataGridViewMode } from "@/shared/types/data-grid"
import { SortDirection } from "@/shared/enums/data-grid"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { useTranslation } from "react-i18next"
import { Badge } from "../ui/badge"
import DetailsCardItem from "../DetailsCardItem"
import { useViewMode } from "@/shared/hooks/use-view-mode"
import ActionButtonGroup from "./ActionButtonGroup"
import StatusBadge from "../StatusBadge"
import { BadgeStyles } from "../../types/enums"

const defaultViewMode: DataGridViewMode = {
  sm: "grid",
  md: "grid",
  lg: "list",
  xl: "list",
  xl2: "list",
}

export const DataGrid: React.FC<DataGridProps> = ({
  columnHeaders,
  items,
  total = 0,
  page = 1,
  limit = 10,
  hasPagination = false,
  onPageChange,
  isLoading = false,
  emptyMessage,
  enableSelection = false,
  selectedRows = [],
  onSelectionChange,
  enableSorting = false,
  sortConfig,
  onSortChange,
  enableColumnVisibility = false,
  hiddenColumns = [],
  onColumnVisibilityChange,
  bulkActions,
  renderCell,
  dispatch,
  actions = [],
  viewMode = defaultViewMode,
  showTitle = true,
  gridSize = "grid-cols-1 gap-y-2 gap-x-2 md:grid-cols-2 md:gap-y-4 md:gap-x-4 lg:grid-cols-3 lg:gap-y-3 lg:gap-x-3 xl:grid-cols-4 xl:gap-y-3 xl:gap-x-3 2xl:grid-cols-5 2xl:gap-y-4 2xl:gap-x-4",
}) => {
  const { t } = useTranslation()

  const hasData = items.length > 0

  const visibleColumns = useMemo(() => columnHeaders.filter((col) => !hiddenColumns.includes(col.key)), [columnHeaders, hiddenColumns])

  const view = useViewMode(viewMode)

  const handleSelectAll = () => {
    if (!onSelectionChange) return

    if (selectedRows.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map((item) => item.getId()))
    }
  }

  const handleRowSelect = (rowId: string) => {
    if (!onSelectionChange) return

    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId))
    } else {
      onSelectionChange([...selectedRows, rowId])
    }
  }

  const handleSort = (columnKey: string) => {
    if (!enableSorting || !onSortChange) return

    const column = columnHeaders.find((col) => col.key === columnKey)
    if (!column?.sortable) return

    let newDirection: SortDirection | null = SortDirection.ASC

    if (sortConfig?.column === columnKey) {
      if (sortConfig.direction === SortDirection.ASC) {
        newDirection = SortDirection.DESC
      } else if (sortConfig.direction === SortDirection.DESC) {
        newDirection = null
      }
    }

    onSortChange({
      column: newDirection ? columnKey : "",
      direction: newDirection,
    })
  }

  const getSortIcon = (columnKey: string) => {
    if (!enableSorting) return null

    const column = columnHeaders.find((col) => col.key === columnKey)
    if (!column?.sortable) return null

    if (sortConfig?.column === columnKey) {
      if (sortConfig.direction === "asc") {
        return <ChevronUp className="h-4 w-4" />
      } else if (sortConfig.direction === "desc") {
        return <ChevronDown className="h-4 w-4" />
      }
    }

    return <ChevronsUpDown className="h-4 w-4 opacity-50" />
  }

  const defaultRenderCell = (item: DataGridRowEntry, column: DataGridColumnHeader) => {
    if (view == "list") {
      switch (column.key) {
        case "actions":
          return <ActionButtonGroup isLoading={isLoading} row={item} actions={actions} dispatch={dispatch} view={view} />
        case "isActive":
          const isActive = item.getTextFor("isActive") == "true"
          return <StatusBadge text={isActive ? t("statusBadges.active") : t("statusBadges.inactive")} theme={isActive ? BadgeStyles.OLD_GREEN : BadgeStyles.OLD_YELLOW} />
        default:
          return column?.isBadge ? <StatusBadge t={t} text={item.getTextFor(column.key) as string} theme={column.badgeTheme} /> : item.getTextFor(column.key) || "N/A"
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
          <div className="flex flex-row justify-end px-4 -mt-2 pt-2 border-t">
            {/* <span className="px-2 h-min text-sm font-semibold block min-w-14">{rowItem.label}</span> */}
            <ActionButtonGroup isLoading={isLoading} row={item} actions={actions} dispatch={dispatch} view={view} />
          </div>
        )
      else if (rowItem.key === "id") return <></>
      else
        return (
          <DetailsCardItem
            onClick={() => rowItem.shouldClick && dispatch?.("ROW_CLICK", item.getId())}
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

  const isAllSelected = selectedRows.length === items.length && items.length > 0
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < items.length

  const Header = () => {
    return (
      (showTitle || enableSelection || enableColumnVisibility) && (
        <div className="bg-background flex items-center justify-between py-2 mb-4 rounded-lg">
          {showTitle && (
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-primary px-4">{t("common.dataGrid.items")}</h1>
              {!!total && total > 0 && (
                <Badge variant="secondary" className="text-sm">
                  <span className="mr-2">{total}</span>
                  {t("common.dataGrid.total")}
                </Badge>
              )}
            </div>
          )}

          {enableSelection && selectedRows.length > 0 && bulkActions && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{selectedRows.length} row(s) selected</span>
                {bulkActions.map((button, idx) => (
                  <Button key={idx} onClick={button.action} variant={button.variant || "default"} size="sm" value={button.label} disabled={button.loading}>
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {enableColumnVisibility && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="mr-4">
                  <Settings2 className="h-4 w-4" />
                  Hidde
                </Button>
              </HoverCardTrigger>
              <HoverCardContent align="end" className="max-w-40">
                {columnHeaders.map((column) => (
                  <div key={column.key} className="flex items-center px-2 py-1">
                    <Checkbox
                      checked={!hiddenColumns.includes(column.key)}
                      onCheckedChange={(value) => {
                        if (!onColumnVisibilityChange) return
                        if (value) {
                          onColumnVisibilityChange(hiddenColumns.filter((col) => col !== column.key))
                        } else {
                          onColumnVisibilityChange([...hiddenColumns, column.key])
                        }
                      }}
                      id={`col-visibility-${column.key}`}
                    />
                    <label htmlFor={`col-visibility-${column.key}`} className="ml-2 capitalize cursor-pointer text-sm">
                      {column.label}
                    </label>
                  </div>
                ))}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      )
    )
  }

  const colSpan = useMemo(() => visibleColumns.length + (enableSelection ? 1 : 0), [visibleColumns, enableSelection])

  const DataTableHeader = () => {
    return (
      <TableHeader>
        <TableRow className="border-b border-gray-300 bg-secondary/50 hover:bg-secondary/60">
          {enableSelection && (
            <TableHead className="w-12 px-2 py-4">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Select all" className={isIndeterminate ? "indeterminate" : ""} />
            </TableHead>
          )}
          {visibleColumns.map((columnHeader) => (
            <TableHead
              key={columnHeader.key}
              className={`text-left px-2 py-4 text-xs xl:text-sm font-semibold ${columnHeader.style}`}
              style={{
                width: columnHeader.width,
                minWidth: columnHeader.minWidth,
              }}
              data-test={columnHeader.key}
            >
              <div
                className={`flex items-center justify-between ${enableSorting && columnHeader.sortable ? "cursor-pointer select-none" : ""}`}
                onClick={() => handleSort(columnHeader.key)}
              >
                <div data-test="header-col-label">{columnHeader.label}</div>
                {getSortIcon(columnHeader.key)}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    )
  }

  const DataGridRows = () => {
    if (view === "list")
      return items.map((item) => (
        <TableRow key={item.getId()} data-test={item.getId()} className="hover:bg-muted transition-colors">
          {enableSelection && (
            <TableCell className="w-12 px-2 py-2">
              <Checkbox checked={selectedRows.includes(item.getId())} onCheckedChange={() => handleRowSelect(item.getId())} aria-label={`Select row ${item.getId()}`} />
            </TableCell>
          )}
          {visibleColumns.map((columnHeader) => (
            <TableCell
              key={columnHeader.key}
              className="text-xs xl:text-sm  font-normal px-2 py-2"
              style={{
                width: columnHeader.width,
                minWidth: columnHeader.minWidth,
              }}
            >
              {renderCell ? renderCell(item, columnHeader, view) : defaultRenderCell(item, columnHeader)}
            </TableCell>
          ))}
        </TableRow>
      ))

    return (
      <div className={`grid ${gridSize}`}>
        {items.map((item) => (
          <div key={item.getId()} data-test={item.getId()} className="w-full mb-4 flex flex-col justify-between rounded-xl relative gap-x-4 gap-y-2 pt-4 pb-1 bg-background">
            {columnHeaders.map((columnHeader, index) => (
              <div key={index}>{renderCell ? renderCell(item, columnHeader, view) : defaultRenderCell(item, columnHeader)}</div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full data-grid flex flex-col justify-between">
      <Header />
      {view == "list" ? (
        <div className="rounded-lg border bg-background relative">
          <Table className="w-full border">
            <DataTableHeader />

            <TableBody>
              {isLoading && (
                <TableRow className="h-0">
                  <TableCell colSpan={colSpan}>
                    <div className="w-full flex items-center justify-center absolute top-0 left-0 h-full bg-background/10 z-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {hasData ? (
                <DataGridRows />
              ) : (
                <TableRow>
                  <TableCell colSpan={colSpan} className="text-center py-8 font-light text-sm xl:text-xl" data-test="nothing-data">
                    {emptyMessage || t("dataGrid.emptyMessage")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}
          {hasData ? (
            <DataGridRows />
          ) : (
            <div className="text-center py-8 font-light text-sm xl:text-xl" data-test="nothing-data">
              {emptyMessage || t("dataGrid.emptyMessage")}
            </div>
          )}
        </>
      )}

      {hasPagination && <DataTablePagination page={page} pageSize={limit} total={total} onPageChange={onPageChange} className="py-2 bg-background mt-2" />}
    </div>
  )
}
