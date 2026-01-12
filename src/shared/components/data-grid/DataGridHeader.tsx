import { TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types/data-grid"

interface DataGridHeaderProps<T> {
    columns: DataGridColumnHeader<T>[]
    enableSelection?: boolean
    isAllSelected: boolean
    isIndeterminate: boolean
    handleSelectAll: () => void
    enableSorting?: boolean
    sortConfig?: DataGridSort
    onSortChange: (columnKey: string) => void
}

export const DataGridHeader = <T,>({
    columns,
    enableSelection,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    enableSorting,
    sortConfig,
    onSortChange,
}: DataGridHeaderProps<T>) => {
    const getSortIcon = (columnKey: string) => {
        if (!enableSorting) return null

        const column = columns.find((col) => col.key === columnKey)
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

    return (
        <TableHeader>
            <TableRow className="border-b border-gray-300 bg-secondary/50 hover:bg-secondary/60">
                {enableSelection && (
                    <TableHead className="w-12 px-2 py-4">
                        <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            className={isIndeterminate ? "indeterminate" : ""}
                        />
                    </TableHead>
                )}
                {columns.map((column) => (
                    <TableHead
                        key={column.key as string}
                        className={`text-left px-2 py-4 text-xs xl:text-sm font-semibold ${column.style}`}
                        style={{
                            width: column.width,
                            minWidth: column.minWidth,
                        }}
                    >
                        <div
                            className={`flex items-center justify-between ${enableSorting && column.sortable ? "cursor-pointer select-none" : ""}`}
                            onClick={() => onSortChange(column.key as string)}
                        >
                            <div>{column.label}</div>
                            {getSortIcon(column.key as string)}
                        </div>
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    )
}
