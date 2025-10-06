import { useTranslation } from "react-i18next"
import DataGridActionButton from "./DataGridActionButton"
import { ElementType, useState } from "react"
import { ACTION, DataGridRowEntry, ViewMode } from "@/shared/types"
import { PencilIcon, TrashIcon, EyeIcon, X, CheckIcon, EllipsisVertical, RotateCcw, Cog, Power } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"

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
  deactivate: X,
  ROW_CLICK: EyeIcon,
  "regen-secret": RotateCcw,
  checkStatus: RotateCcw,
  changeStatus: PencilIcon,
  config: Cog,
  toggle_status: Power,
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
      {view === "grid" ? (
        <div className="flex gap-x-2 gap-y-1 items-center pb-2">
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
      ) : view === "list" && actions?.length > 3 ? (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 justify-center items-center">
          {actions
            .slice(0, 2)
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
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-background cursor-pointer p-2 lg:p-1.5 rounded-md border border-transparent shadow-none hover:shadow-md">
              <EllipsisVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions
                .slice(2)
                ?.map((action) => ({
                  icon: DataGridRowActionIcon[action],
                  key: action,
                }))
                .map((action) => (
                  <DropdownMenuItem key={action.key} onClick={() => handleDispatch(action.key, row.getId())}>
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {t(`common.actions.${action.key}` as any)}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 justify-center items-center">
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
