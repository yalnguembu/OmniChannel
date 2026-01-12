import { ReactNode } from "react"
import { DataGridColumnHeader, ViewMode, ACTION } from "@/shared/types/data-grid"
import StatusBadge from "../StatusBadge"
import { BadgeStyles } from "../../types/enums"
import { useTranslation } from "react-i18next"
import ActionButtonGroup from "./ActionButtonGroup"
import DetailsCardItem from "../DetailsCardItem"

interface DataGridCellProps<T> {
    item: T
    column: DataGridColumnHeader<T>
    view: ViewMode
    isLoading?: boolean
    actions?: ACTION[]
    dispatch?: (action: ACTION, id: string) => void
    renderCell?: (item: T, column: DataGridColumnHeader<T>, view: ViewMode) => ReactNode
    getRowId: (item: T) => string
}

export const DataGridCell = <T,>({
    item,
    column,
    view,
    isLoading,
    actions = [],
    dispatch,
    renderCell,
    getRowId,
}: DataGridCellProps<T>) => {
    const { t } = useTranslation()

    // Helper to get value safely from item
    const getValue = (item: any, key: string) => {
        if (item.getTextFor) {
            return item.getTextFor(key)
        }
        return item[key]
    }

    if (renderCell) {
        return renderCell(item, column, view)
    }

    if (column.render) {
        return column.render(getValue(item, column.key as string), item)
    }

    if (view === "list") {
        switch (column.key) {
            case "actions":
                return <ActionButtonGroup isLoading={isLoading} row={item as any} actions={actions} dispatch={dispatch!} view={view} />
            case "isActive":
                const val = getValue(item, "isActive")
                const isActive = val === "true" || val === true
                return <StatusBadge text={isActive ? t("statusBadges.active") : t("statusBadges.inactive")} theme={isActive ? BadgeStyles.OLD_GREEN : BadgeStyles.OLD_YELLOW} />
            default:
                const cellValue = getValue(item, column.key as string)
                return column?.isBadge ? (
                    <StatusBadge t={t} text={cellValue as string} theme={column.badgeTheme} />
                ) : (
                    (cellValue as string) || "N/A"
                )
        }
    }

    // Grid/Card View
    if (column.key === "actions") {
        return (
            <div className="flex flex-row justify-end px-4 -mt-2 pt-2 border-t">
                <ActionButtonGroup isLoading={isLoading} row={item as any} actions={actions} dispatch={dispatch!} view={view} />
            </div>
        )
    }

    if (column.key === "id") return null

    return (
        <DetailsCardItem
            onClick={() => column.shouldClick && dispatch?.("ROW_CLICK", getRowId(item))}
            shouldClick={column.shouldClick}
            key={column.key as string}
            label={column.label ?? ""}
            value={`${getValue(item, column.key as string) || "N/A"}`}
            isBadge={column.isBadge}
            theme={column.badgeTheme}
            className="mx-3 border-b border-b-foreground/5"
        />
    )
}
