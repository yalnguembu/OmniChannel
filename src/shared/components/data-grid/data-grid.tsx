import { useCallback, useMemo } from "react"
import { Table, TableCell, TableRow } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataTablePagination } from "./data-table-pagination"
import { Settings2 } from "lucide-react"
import { DataGridProps, DataGridViewMode } from "@/shared/types/data-grid"
import { SortDirection } from "@/shared/enums/data-grid"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { useTranslation } from "react-i18next"
import { Badge } from "../ui/badge"
import { useViewMode } from "@/shared/hooks/use-view-mode"
import { DataGridHeader } from "./DataGridHeader"
import { DataGridListBody } from "./DataGridListBody"
import { DataGridCardBody } from "./DataGridCardBody"

const defaultViewMode: DataGridViewMode = {
  sm: "grid",
  md: "grid",
  lg: "list",
  xl: "list",
  xl2: "list",
}

export const DataGrid = <T,>({
  columnHeaders,
  items,
  total = 0,
  page = 1,
  limit = 10,
  hasPagination = false,
  paginationMetadata,
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
  getRowId = (item: any) => item?.id || item?.getId?.() || JSON.stringify(item),
}: DataGridProps<T>) => {
  const { t } = useTranslation()
  const view = useViewMode(viewMode)
  const hasData = items.length > 0
  const visibleColumns = useMemo(() => columnHeaders.filter((col) => !hiddenColumns.includes(col.key as string)), [columnHeaders, hiddenColumns])
  const colSpan = useMemo(() => visibleColumns.length + (enableSelection ? 1 : 0), [visibleColumns, enableSelection])

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return
    if (selectedRows.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map((item) => getRowId(item)))
    }
  }, [items, selectedRows, onSelectionChange, getRowId])

  const handleRowSelect = useCallback((rowId: string) => {
    if (!onSelectionChange) return
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId))
    } else {
      onSelectionChange([...selectedRows, rowId])
    }
  }, [selectedRows, onSelectionChange])

  const handleSort = useCallback((columnKey: string) => {
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
  }, [enableSorting, onSortChange, columnHeaders, sortConfig])

  const isAllSelected = selectedRows.length === items.length && items.length > 0
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < items.length

  const HeaderActions = () => (
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
            <span className="text-sm text-muted-foreground">{selectedRows.length} row(s) selected</span>
            {bulkActions.map((button, idx) => (
              <Button key={idx} onClick={button.action} variant={button.variant || "default"} size="sm" disabled={button.loading}>
                {button.label}
              </Button>
            ))}
          </div>
        )}

        {enableColumnVisibility && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" className="mr-4">
                <Settings2 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-48">
              {columnHeaders.map((column) => (
                <div key={column.key as string} className="flex items-center px-2 py-1">
                  <Checkbox
                    checked={!hiddenColumns.includes(column.key as string)}
                    onCheckedChange={(value) => {
                      if (!onColumnVisibilityChange) return
                      if (value) {
                        onColumnVisibilityChange(hiddenColumns.filter((col) => col !== column.key))
                      } else {
                        onColumnVisibilityChange([...hiddenColumns, column.key as string])
                      }
                    }}
                    id={`col-visibility-${column.key as string}`}
                  />
                  <label htmlFor={`col-visibility-${column.key as string}`} className="ml-2 capitalize cursor-pointer text-sm">
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

  const EmptyState = ({ isList = true }) => {
    const content = (
      <div className="text-center py-8 font-light text-sm xl:text-xl" data-test="nothing-data">
        {emptyMessage || t("dataGrid.emptyMessage")}
      </div>
    )
    if (isList) {
      return (
        <TableRow>
          <TableCell colSpan={colSpan}>{content}</TableCell>
        </TableRow>
      )
    }
    return content
  }

  const LoadingState = ({ isList = true }) => {
    const content = (
      <div className={`${isList ? "absolute inset-0 z-10" : "py-4"} flex items-center justify-center bg-background/10`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
    if (isList) {
      return (
        <TableRow className="h-0 relative">
          <TableCell colSpan={colSpan}>{content}</TableCell>
        </TableRow>
      )
    }
    return content
  }

  return (
    <div className="w-full data-grid flex flex-col justify-between">
      <HeaderActions />

      {view === "list" ? (
        <div className="rounded-lg border bg-background relative">
          <Table className="w-full border">
            <DataGridHeader
              columns={visibleColumns}
              enableSelection={enableSelection}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              handleSelectAll={handleSelectAll}
              enableSorting={enableSorting}
              sortConfig={sortConfig}
              onSortChange={handleSort}
            />
            {isLoading && <LoadingState />}
            {hasData ? (
              <DataGridListBody
                items={items}
                columns={visibleColumns}
                enableSelection={enableSelection}
                selectedRows={selectedRows}
                handleRowSelect={handleRowSelect}
                getRowId={getRowId}
                isLoading={isLoading}
                actions={actions}
                dispatch={dispatch}
                renderCell={renderCell}
              />
            ) : !isLoading && <EmptyState />}
          </Table>
        </div>
      ) : (
        <>
          {isLoading && <LoadingState isList={false} />}
          {hasData ? (
            <DataGridCardBody
              items={items}
              columns={columnHeaders}
              gridSize={gridSize}
              getRowId={getRowId}
              isLoading={isLoading}
              actions={actions}
              dispatch={dispatch}
              renderCell={renderCell}
            />
          ) : !isLoading && <EmptyState isList={false} />}
        </>
      )}

      {hasPagination && paginationMetadata && (
        <div className="px-4">
          <div className="text-xs text-muted-foreground">
            {t("companies.messages.pagination.info", {
              start: paginationMetadata.startIndex ?? ((paginationMetadata.pageNumber - 1) * paginationMetadata.pageSize) + 1,
              end: paginationMetadata.endIndex ?? Math.min(paginationMetadata.pageNumber * paginationMetadata.pageSize, paginationMetadata.totalCount),
              total: paginationMetadata.totalCount
            })}
          </div>
        </div>
      )}

      {hasPagination && (
        <DataTablePagination
          page={page}
          pageSize={limit}
          total={total}
          onPageChange={onPageChange}
          className="py-2 bg-background mt-2"
        />
      )}
    </div>
  )
}

