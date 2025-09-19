import { useTranslation } from "react-i18next"
import DataGridActionButton from "./DataGridActionButton"
import { ElementType, useState } from "react"
import { ACTION, DataGridRowEntry, ViewMode } from "@/shared/types"
import { PencilIcon, TrashIcon, EyeIcon, CheckIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Button } from "../ui/button"

type ActionButtonGroupType = {
  row: DataGridRowEntry
  actions: ACTION[]
  dispatch: (action: ACTION, id: string) => void
  isLoading?: boolean
  shouldCollapseTextOnMobile?: boolean
  view: ViewMode
}

const DataGridRowActionIcon: Record<ACTION, ElementType> = {
  view: EyeIcon,
  edit: PencilIcon,
  delete: TrashIcon,
  activate: CheckIcon,
  deactivate: CheckIcon,
  ROW_CLICK: EyeIcon,
}

const ActionButtonGroup = ({ row, actions, dispatch, isLoading, shouldCollapseTextOnMobile = true, view = "grid" }: ActionButtonGroupType) => {
  const { t } = useTranslation()

  const [activeAction, setActiveAction] = useState<string>("")

  const handleDispatch = (action: ACTION, id: string) => {
    setActiveAction(action)
    dispatch(action, id)
  }

  return (
    <div className="rounded-lg">
      {view === "list" && actions?.length > 3 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t("actions.openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions
              ?.map((action) => ({
                icon: DataGridRowActionIcon[action],
                key: action,
              }))
              .map((action) => (
                <DropdownMenuItem key={action.key} onClick={() => handleDispatch(action.key, row.getId())}>
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {t(`actions.tooltip.${action.key}` as any)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 items-center">
          {actions
            ?.map((action) => ({
              icon: DataGridRowActionIcon[action],
              key: action,
              tooltip: t(`actions.tooltip.${action}` as any),
            }))
            .map((action, index) => (
              <DataGridActionButton
                row={row}
                key={index}
                action={action}
                disabled={activeAction === action.key && isLoading}
                isLoading={isLoading}
                dispatch={handleDispatch}
                shouldCollapseTextOnMobile={shouldCollapseTextOnMobile}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default ActionButtonGroup
