import React, { useState } from "react"
import { Control } from "react-hook-form"
import { ChevronDown, ChevronUp } from "lucide-react"
import { FilterSection as FilterSectionType } from "@/shared/types/filter"
import { FilterField } from "./filter-field"

interface FilterSectionProps {
  section: FilterSectionType
  control: Control<any>
  isLoading?: boolean
}

export const FilterSection: React.FC<FilterSectionProps> = ({ section, control, isLoading = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed ?? false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="space-y-3 py-2">
      {section.collapsible ? (
        <div className="flex items-center justify-between cursor-pointer hover:opacity-75 transition-opacity" onClick={toggleCollapse}>
          <h4 className="text-xs font-light text-muted-foreground capitalize tracking-wide">{section.title}</h4>
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      ) : (
        section.title && <h4 className="text-xs font-light text-muted-foreground capitalize tracking-wide">{section.title}</h4>
      )}

      {(!section.collapsible || !isCollapsed) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 2xl:grid-cols-5">
          {section.fields.map((field) => (
            <FilterField key={field.key} field={field} control={control} isLoading={isLoading} />
          ))}
        </div>
      )}
    </div>
  )
}
