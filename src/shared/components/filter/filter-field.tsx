import React from "react"
import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { cn } from "@/shared/lib/utils"
import { FilterFieldConfig } from "../../types/filter"
import { FilterFieldControl } from "./filter-field-controls"

interface FilterFieldProps {
  field: FilterFieldConfig
  control: Control
  isLoading?: boolean
}

export const FilterField: React.FC<FilterFieldProps> = ({ field, control, isLoading = false }) => {
  return (
    <FormField
      key={field.key}
      control={control}
      name={field.key}
      render={({ field: formField }) => (
        <FormItem className={cn("gap-y-2", field.className)}>
          <FormControl>
            <FilterFieldControl field={field} formField={formField} isLoading={isLoading} />
          </FormControl>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
