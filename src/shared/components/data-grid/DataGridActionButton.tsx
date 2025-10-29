import { ACTION, DataGridRowEntry } from "@/shared/types/data-grid"

export type DataGridRowActionIconType = {
  row: DataGridRowEntry
  action: {
    key: ACTION
    icon: React.ElementType
    tooltip: string
  }
  dispatch: (action: ACTION, id: string) => void
  isLoading?: boolean
  disabled?: boolean
  shouldCollapseTextOnMobile?: boolean
}

const enum ActionButtonStyles {
  view = "hover:bg-primary/20 text-primary",
  edit = "hover:bg-blue-200 text-blue-600",
  changeStatus = "hover:bg-blue-200 text-blue-800",
  delete = "hover:bg-red-200 text-red-600",
  deactivate = "hover:bg-red-200 text-red-700",
  activate = "hover:bg-green-200 text-green-600",
  config = "hover:bg-accent/20 text-accent",
  checkStatus = "hover:bg-yellow-200 text-yellow-500",
  aprove = "hover:bg-blue-200 text-blue-700",
  cancel = "hover:bg-red-200 text-red-700/90",
  complete = "hover:bg-green-200 text-green-700",
  // view = "bg-primary/10 hover:bg-primary/20 text-primary",
  // edit = "bg-blue-100 hover:bg-blue-200 text-blue-600",
  // changeStatus = "bg-blue-100 hover:bg-blue-200 text-blue-800",
  // delete = "bg-red-100 hover:bg-red-200 text-red-600",
  // deactivate = "bg-red-100 hover:bg-red-200 text-red-700",
  // activate = "bg-green-100 hover:bg-green-200 text-green-600",
  // config = "bg-accent/10 hover:bg-accent/20 text-accent",
  // checkStatus = "bg-yellow-100 hover:bg-yellow-200 text-yellow-500",
}

const DataGridRowActionIcon = ({ row, action, dispatch, isLoading = false, disabled = false, shouldCollapseTextOnMobile }: DataGridRowActionIconType) => {
  return (
    <div className="tooltip" data-tip={action.tooltip}>
      <button
        disabled={disabled}
        type="button"
        data-test-id={`action-${action.key}`}
        onClick={() => dispatch(action.key, row.getId())}
        className={`btn border w-full lg:auto btn-sm p-2 lg:p-1 rounded-md relative border-transparent shadow-none cursor-pointer hover:shadow-md ${ActionButtonStyles[action.key]}`}
      >
        {isLoading && (
          <div className="bg-background opacity-60 h-5 w-5 absolute flex justify-center items-center">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-secondary"></div>
          </div>
        )}
        {!shouldCollapseTextOnMobile && <span className="lg:hidden">{action.tooltip}</span>}

        <action.icon className="w-5 h-5 lg:w-4 lg:h-4" />
      </button>
    </div>
  )
}

export default DataGridRowActionIcon
