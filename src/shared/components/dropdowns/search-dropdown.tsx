import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { cn } from "@/shared/lib/utils"

export interface SearchDropdownOption {
  value?: string | null
  label?: string | null
  [key: string]: unknown
}

export interface SearchDropdownProps {
  value: string | null
  onChange: (value: string | null, option?: SearchDropdownOption) => void
  placeholder?: string
  disabled?: boolean
  options: SearchDropdownOption[]
  maxResults?: number
  searchTerm?: string
  debounce?: boolean
  isLoading?: boolean
  onSearch?: (search: string) => void
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select option",
  disabled = false,
  options,
  maxResults = 50,
  debounce = false,
  isLoading = false,
  onSearch,
}) => {
  const [input, setInput] = useState("")
  const [localOptions, setLocalOptions] = useState<SearchDropdownOption[]>(options)
  const [debouncedInput, setDebouncedInput] = useState("")

  useEffect(() => {
    if (debounce) {
      const handler = setTimeout(() => {
        setDebouncedInput(input)
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [input, debounce])

  useEffect(() => {
    if (debounce && onSearch && debouncedInput.length >= 3) {
      onSearch(debouncedInput)
    }
  }, [debouncedInput, debounce, onSearch])

  useEffect(() => {
    if (debounce) {
      if (input.length < 3) {
        setLocalOptions(options.filter((opt) => opt.label?.toLowerCase().includes(input.toLowerCase())).slice(0, maxResults))
      } else {
        setLocalOptions(options.slice(0, maxResults))
      }
    } else {
      setLocalOptions(options.filter((opt) => opt.label?.toLowerCase().includes(input.toLowerCase())).slice(0, maxResults))
    }
  }, [input, options, debounce, maxResults])

  useEffect(() => {
    setLocalOptions(options.slice(0, maxResults))
  }, [options, maxResults])

  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label || placeholder
  }, [options, value, placeholder])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !value && "text-muted-foreground")} disabled={disabled || isLoading}>
          {selectedLabel}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput value={input} onValueChange={setInput} placeholder={`Search...`} disabled={disabled || isLoading} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {localOptions.map((option) => (
              <CommandItem key={option.value} value={option.value || ""} onSelect={() => onChange(option.value || null, option)}>
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
