import React from "react"
import { TableBody, TableRow, TableCell } from "@/shared/components/ui/table"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataGridColumnHeader, ACTION, ViewMode } from "@/shared/types/data-grid"
import { DataGridCell } from "./DataGridCell"

interface DataGridListBodyProps<T> {
    items: T[]
    columns: DataGridColumnHeader<T>[]
    enableSelection?: boolean
    selectedRows: string[]
    handleRowSelect: (id: string) => void
    getRowId: (item: T) => string
    isLoading?: boolean
    actions?: ACTION[]
    dispatch?: (action: ACTION, id: string) => void
    renderCell?: (item: T, column: DataGridColumnHeader<T>, view: ViewMode) => React.ReactNode
}

export const DataGridListBody = <T,>({
    items,
    columns,
    enableSelection,
    selectedRows,
    handleRowSelect,
    getRowId,
    isLoading,
    actions,
    dispatch,
    renderCell,
}: DataGridListBodyProps<T>) => {
    return (
        <TableBody>
            {items.map((item) => {
                const id = getRowId(item)
                return (
                    <TableRow key={id} data-test={id} className="hover:bg-muted transition-colors">
                        {enableSelection && (
                            <TableCell className="w-12 px-2 py-2">
                                <Checkbox
                                    checked={selectedRows.includes(id)}
                                    onCheckedChange={() => handleRowSelect(id)}
                                    aria-label={`Select row ${id}`}
                                />
                            </TableCell>
                        )}
                        {columns.map((column) => (
                            <TableCell
                                key={column.key as string}
                                className="text-xs xl:text-sm font-normal px-2 py-2"
                                style={{
                                    width: column.width,
                                    minWidth: column.minWidth,
                                }}
                            >
                                <DataGridCell
                                    item={item}
                                    column={column}
                                    view="list"
                                    isLoading={isLoading}
                                    actions={actions}
                                    dispatch={dispatch}
                                    renderCell={renderCell}
                                    getRowId={getRowId}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                )
            })}
        </TableBody>
    )
}
