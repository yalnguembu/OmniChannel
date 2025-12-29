import React from "react"
import { ControllerRenderProps } from "react-hook-form"
import { CalendarIcon, ChevronDown, Search, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { cn } from "@/shared/lib/utils"
import { FilterFieldConfig } from "../../types/filter"
import { SearchDropdown, SearchDropdownOption } from "@/shared/components/dropdowns/search-dropdown"

interface FilterFieldControlProps {
  field: FilterFieldConfig
  formField: ControllerRenderProps
  isLoading?: boolean
}

export const FilterFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading = false }) => {
  switch (field.type) {
    case "text":
    case "email":
    case "search":
      return <TextFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "number":
      return <NumberFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "select":
      return <SelectFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "combobox":
      return <ComboboxFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "searchdropdown":
      return <SearchDropdownFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "checkbox":
      return <CheckboxFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "checkboxgroup":
      return <CheckboxGroupFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "date":
      return <DateFieldControl field={field} formField={formField} isLoading={isLoading} />

    case "daterange":
      return <DateRangeFieldControl field={field} formField={formField} isLoading={isLoading} />

    default:
      return <TextFieldControl field={field} formField={formField} isLoading={isLoading} />
  }
}

const TextFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <div className="relative">
    {field.type === "search" && <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
    <Input
      {...formField}
      type={field.type === "search" ? "text" : field.type}
      placeholder={field.placeholder || field.label}
      disabled={field.disabled || isLoading}
      className={field.type === "search" ? "pl-10" : ""}
    />
  </div>
)

const NumberFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <Input
    {...formField}
    type="number"
    placeholder={field.placeholder || field.label}
    disabled={field.disabled || isLoading}
    onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : "")}
  />
)

const SelectFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <Select value={formField.value || ""} onValueChange={formField.onChange} disabled={field.disabled || isLoading}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder={field.placeholder || field.label} />
    </SelectTrigger>
    <SelectContent>
      {field.options?.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const ComboboxFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" role="combobox" className={cn("w-full justify-between", !formField.value && "text-muted-foreground")} disabled={field.disabled || isLoading}>
        {formField.value ? field.options?.find((option) => option.value === formField.value)?.label : field.placeholder || field.label}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-full p-0">
      <Command>
        <CommandInput placeholder={field.label} />
        <CommandEmpty>No option found.</CommandEmpty>
        <CommandGroup>
          {field.options?.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => {
                formField.onChange(option.value === formField.value ? "" : option.value)
              }}
            >
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
)

const CheckboxFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <div className="flex items-center space-x-2">
    <Checkbox checked={formField.value || false} onCheckedChange={formField.onChange} disabled={field.disabled || isLoading} />
    <Label className="text-sm font-normal">{field.placeholder || field.label}</Label>
  </div>
)

const CheckboxGroupFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <div className="gap-y-2">
    {field.options?.map((option) => (
      <div key={option.value} className="flex items-center space-x-2">
        <Checkbox
          checked={(formField.value || []).includes(option.value)}
          onCheckedChange={(checked) => {
            const currentValues = formField.value || []
            if (checked) {
              formField.onChange([...currentValues, option.value])
            } else {
              formField.onChange(currentValues.filter((val: string) => val !== option.value))
            }
          }}
          disabled={field.disabled || isLoading}
        />
        <Label className="text-sm font-normal">{option.label}</Label>
      </div>
    ))}
  </div>
)

const DateFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formField.value && "text-muted-foreground")} disabled={field.disabled || isLoading}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formField.value ? format(formField.value, "PPP") : <span>{field.placeholder || field.label}</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar mode="single" selected={formField.value} onSelect={formField.onChange} initialFocus />
    </PopoverContent>
  </Popover>
)

const DateRangeFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => {
  const dateRange = React.useMemo(() => {
    if (typeof formField.value === "string" && formField.value.includes("_")) {
      const [from, to] = formField.value.split("_")
      return {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      }
    }
    return { from: undefined, to: undefined }
  }, [formField.value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !formField.value && "text-muted-foreground")}
            disabled={field.disabled || isLoading}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{field.placeholder || field.label}</span>
            )}
          </Button>
          {dateRange?.from && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                formField.onChange("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => formField.onChange(`${range?.from?.toISOString() || ""}_${range?.to?.toISOString() || ""}`)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

const SearchDropdownFieldControl: React.FC<FilterFieldControlProps> = ({ field, formField, isLoading }) => (
  <SearchDropdown
    value={formField.value || null}
    onChange={(val) => formField.onChange(val)}
    options={field.options as SearchDropdownOption[] || []}
    placeholder={field.placeholder || field.label}
    disabled={field.disabled || isLoading}
    isLoading={field.isLoadingOptions || isLoading}
  />
)
