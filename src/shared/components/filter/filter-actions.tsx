import React from "react"
import { Filter as FilterIcon } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useTranslation } from "react-i18next"

interface FilterActionsProps {
  onSubmit: () => void
  onReset: () => void
  isLoading?: boolean
  showFilterButton?: boolean
  showResetButton?: boolean
  filterButtonText?: string
  resetButtonText?: string
}

export const FilterActions: React.FC<FilterActionsProps> = ({ onSubmit, onReset, isLoading = false, showFilterButton = true, showResetButton = true }) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center space-x-2 pt-4 border-t">
      {showFilterButton && (
        <Button type="submit" disabled={isLoading} className="min-w-[120px]" onClick={onSubmit}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </>
          ) : (
            <>
              <FilterIcon className="h-4 w-4 mr-2" />
              {t("common.filter.actions.filter")}
            </>
          )}
        </Button>
      )}

      {showResetButton && (
        <Button type="button" variant="outline" onClick={onReset} disabled={isLoading}>
          {t("common.filter.actions.reset")}
        </Button>
      )}
    </div>
  )
}
