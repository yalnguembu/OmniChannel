import React from "react"
import { ControllerRenderProps } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { cn } from "@/shared/lib/utils"

interface DateRangeInputProps {
  isLoading?: boolean
  placeholder?: string
  dateFormat?: "short" | "long"
  style?: string
  size?: "default" | "sm" | "lg" | "icon"
  formField: {
    name: ControllerRenderProps["name"]
    disabled?: ControllerRenderProps["disabled"]
    value: ControllerRenderProps["value"]
    onChange: ControllerRenderProps["onChange"]
    onBlur?: ControllerRenderProps["onBlur"]
    ref?: ControllerRenderProps["ref"]
  }
}
export const DateRangeInput: React.FC<DateRangeInputProps> = ({ formField, isLoading, placeholder, dateFormat = "long", style, size }) => {
  const formatValue = dateFormat === "long" ? "LLL dd, y" : "LLL dd"
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !formField.value && "text-muted-foreground", style)}
          disabled={formField.disabled || isLoading}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formField.value?.from ? (
            formField.value.to ? (
              <>
                {format(formField.value.from, formatValue)} - {format(formField.value.to, formatValue)}
              </>
            ) : (
              format(formField.value.from, formatValue)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="range" defaultMonth={formField.value?.from} selected={formField.value} onSelect={formField.onChange} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  )
}
