import { ACTION, DataGridRowEntry } from "@/shared/types/data-grid"
import buttonStyles from "./styles/data-grid.module.css"
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

const DataGridRowActionIcon = ({ row, action, dispatch, isLoading = false, disabled = false, shouldCollapseTextOnMobile }: DataGridRowActionIconType) => {
  return (
    <div className="tooltip" data-tip={action.tooltip}>
      <button
        disabled={disabled}
        type="button"
        data-test-id={`action-${action.key}`}
        onClick={() => dispatch(action.key, row.getId())}
        className={`btn border w-full lg:auto btn-sm px-2 lg:px-1.5 lg:max-h-4 bg-transparent relative border-transparent shadow-none ${buttonStyles[action.key]}`}
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
