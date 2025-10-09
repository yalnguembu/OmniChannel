import { useCallback, useMemo, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form } from "@/shared/components/ui/form"
import { BaseFilterProps, FilterFieldConfig, type FilterSection as FilterSectionType } from "@/shared/types"
import { FilterHeader } from "./filter-header"
import { FilterSection } from "./filter-section"
import { FilterActions } from "./filter-actions"
import { CollapsibleContainer } from "./collapsible-container"
import { EXCLUDED_FIELDS } from "@/shared/lib/constant"
import { FilterSectionBuilder, generateFilterFieldsFromSchema } from "../../lib/filter"
import { FilterFieldType } from "@/shared/enums/filter"

export function BaseFilter<T extends Record<string, unknown>>({
  schema,
  onFilter,
  onReset,
  defaultValues,
  isLoading = false,
  enableDateRange = true,
  showResetButton = true,
  showFilterButton = true,
  className,
  collapsible = true,
  defaultCollapsed = true,
  viewMode,
  setViewMode,
  refreshData,
  hasSelection,
  selectionCount,
  onImport,
  onExport,
  selectedRows,
  sections,
  fieldTranslationPrefix = "common",
}: BaseFilterProps<T>) {
  // Simple auto-collapse state
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [wasAutoCollapsed, setWasAutoCollapsed] = useState(false)

  // Auto-collapse on scroll functionality
  useEffect(() => {
    if (!collapsible) return

    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Scrolling down and past threshold - auto collapse if not already collapsed
      if (currentScrollY > lastScrollY && currentScrollY > 100 && !isCollapsed) {
        setIsCollapsed(true)
        setWasAutoCollapsed(true)
      }

      // Scrolling up to near top - reopen if was auto-collapsed and originally expanded
      if (currentScrollY < lastScrollY && currentScrollY <= 50 && wasAutoCollapsed && !defaultCollapsed) {
        setIsCollapsed(false)
        setWasAutoCollapsed(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [collapsible, isCollapsed, wasAutoCollapsed, defaultCollapsed])

  const handleCollapsedChange = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (!collapsed) {
      setWasAutoCollapsed(false)
    }
  }, [])

  const filteredSchema = useMemo(() => {
    if (!("shape" in schema)) {
      return schema
    }

    const shape = (schema as any).shape as Record<string, z.ZodType<any>>
    const filteredShape = Object.keys(shape).reduce(
      (acc, key) => {
        if (!EXCLUDED_FIELDS.includes(key)) {
          acc[key] = shape[key]
        }
        return acc
      },
      {} as Record<string, z.ZodType<any>>,
    )

    return z.object(filteredShape) as any
  }, [schema])

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  })

  const handleSubmit = useCallback(
    (values: T) => {
      const cleanedValues = Object.entries(values).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            if (Array.isArray(value) && value.length === 0) {
              return acc
            }
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>,
      )

      onFilter(cleanedValues as T)
    },
    [onFilter],
  )

  const handleReset = useCallback(() => {
    form.reset()
    onReset?.()
  }, [form, onReset])

  const handleClear = useCallback(() => {
    form.reset()
  }, [form])

  const hasValues = useMemo(() => {
    const values = form.getValues()
    return Object.values(values).some((value) => value !== "" && value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0))
  }, [form.watch()])

  const handleSearch = (text: string) => {
    form.setValue("searchTerm" as keyof T as any, text as any)
  }

  const filterFields: FilterFieldConfig[] = []
  if (enableDateRange)
    filterFields.push({
      key: "dateRange",
      label: "dateRange".replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      type: FilterFieldType.DATERANGE,
      placeholder: "dateRange",
    } as FilterFieldConfig)

  generateFilterFieldsFromSchema({ schema: filteredSchema, fieldTranslationPrefix }).forEach((filterField) => filterFields.push(filterField))

  const generatedSections: FilterSectionType[] = sections?.length ? sections : [new FilterSectionBuilder().addFields(filterFields).build()]

  const filterHeader = (
    <FilterHeader
      selectedRows={selectedRows}
      viewMode={viewMode}
      setViewMode={setViewMode}
      refreshData={refreshData}
      hasSelection={hasSelection}
      selectionCount={selectionCount}
      onImport={onImport}
      onExport={onExport}
      hasValues={hasValues}
      onReset={handleReset}
      onClear={handleClear}
      isLoading={isLoading}
      showClearButton={hasValues}
      onSearchChange={handleSearch}
      enableSearch
    />
  )

  const filterContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 pt-2 space-y-2 border-t">
        {generatedSections.map((section) => (
          <FilterSection key={section.title} section={section} control={form.control} isLoading={isLoading} />
        ))}

        <FilterActions
          onSubmit={form.handleSubmit(handleSubmit)}
          onReset={handleReset}
          isLoading={isLoading}
          showFilterButton={showFilterButton}
          showResetButton={showResetButton}
        />
      </form>
    </Form>
  )

  return (
    <CollapsibleContainer
      isCollapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      collapsed={isCollapsed}
      onCollapsedChange={handleCollapsedChange}
      className={className}
      header={filterHeader}
    >
      {filterContent}
    </CollapsibleContainer>
  )
}
