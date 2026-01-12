import React from "react"
import { DataGridColumnHeader, ACTION, ViewMode } from "@/shared/types/data-grid"
import { DataGridCell } from "./DataGridCell"

interface DataGridCardBodyProps<T> {
    items: T[]
    columns: DataGridColumnHeader<T>[]
    gridSize?: string
    getRowId: (item: T) => string
    isLoading?: boolean
    actions?: ACTION[]
    dispatch?: (action: ACTION, id: string) => void
    renderCell?: (item: T, column: DataGridColumnHeader<T>, view: ViewMode) => React.ReactNode
}

export const DataGridCardBody = <T,>({
    items,
    columns,
    gridSize,
    getRowId,
    isLoading,
    actions,
    dispatch,
    renderCell,
}: DataGridCardBodyProps<T>) => {
    return (
        <div className={`grid ${gridSize}`}>
            {items.map((item) => {
                const id = getRowId(item)
                return (
                    <div
                        key={id}
                        data-test={id}
                        className="w-full mb-4 flex flex-col justify-between rounded-xl relative gap-x-4 gap-y-2 pt-4 pb-1 bg-background shadow-sm border"
                    >
                        {columns.map((column, index) => (
                            <DataGridCell
                                key={`${id}-${index}`}
                                item={item}
                                column={column}
                                view="grid"
                                isLoading={isLoading}
                                actions={actions}
                                dispatch={dispatch}
                                renderCell={renderCell}
                                getRowId={getRowId}
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
