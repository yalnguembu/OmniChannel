import React, { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataTablePagination } from "./data-table-pagination"
import { ChevronDown, ChevronUp, ChevronsUpDown, Settings2 } from "lucide-react"
import { DataGridProps, DataGridRowEntry } from "@/shared/types/data-grid"
import { SortDirection } from "@/shared/enums/data-grid"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { useTranslation } from "react-i18next"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"

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
  showTitle = true,
}) => {
  const { t } = useTranslation()

  const isMobile = useIsMobile()
  const hasData = items.length > 0

  const visibleColumns = useMemo(() => columnHeaders.filter((col) => !hiddenColumns.includes(col.key)), [columnHeaders, hiddenColumns])

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

  const defaultRenderCell = (item: DataGridRowEntry, columnKey: string) => {
    switch (columnKey) {
      case "actions":
        return isMobile || actions.length < 3 ? (
          <div>
            <></>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => dispatch?.("view", item.getId())}>
                <Eye className="mr-2 h-4 w-4" />
                {t("countries.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch?.("edit", item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("countries.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch?.("delete", item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("countries.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      default:
        return item.getTextFor(columnKey) || "N/A"
    }
  }

  const isAllSelected = selectedRows.length === items.length && items.length > 0
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < items.length

  return (
    <div className="w-full data-grid flex flex-col justify-between">
      {(showTitle || enableSelection || enableColumnVisibility) && (
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
      )}

      <div className="rounded-lg border overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-300 bg-secondary/50">
              {enableSelection && (
                <TableHead className="w-12 px-2 py-4">
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Select all" className={isIndeterminate ? "indeterminate" : ""} />
                </TableHead>
              )}
              {visibleColumns.map((columnHeader) => (
                <TableHead
                  key={columnHeader.key}
                  className="text-left px-2 py-4 text-xs xl:text-sm font-semibold"
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
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (enableSelection ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : hasData ? (
              items.map((item) => (
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
                      {renderCell ? renderCell(item, columnHeader.key) : defaultRenderCell(item, columnHeader.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (enableSelection ? 1 : 0)} className="text-center py-8 font-light text-sm xl:text-xl" data-test="nothing-data">
                  {emptyMessage || t("dataGrid.emptyMessage")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination && total > items.length && <DataTablePagination page={page} pageSize={limit} total={total} onPageChange={onPageChange} className="py-2 bg-background mt-2" />}
    </div>
  )
}
