import { useCallback, useMemo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form } from "@/shared/components/ui/form"
import { BaseFilterProps, FilterFieldConfig, DateRangeValue, type FilterSection as FilterSectionType } from "../../types/filter"
import { FilterHeader } from "./filter-header"
import { FilterSection } from "./filter-section"
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
  className,
  collapsible = true,
  defaultCollapsed = true,
  viewMode,
  setViewMode,
  hasSelection,
  selectionCount,
  onImport,
  onExport,
  selectedRows = [],
  sections,
  fieldTranslationPrefix = "common",
  containerRef,
}: BaseFilterProps<T>) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [wasAutoCollapsed, setWasAutoCollapsed] = useState(false)

  const { t } = useTranslation()

  if (!schema) return null

  useEffect(() => {
    if (!collapsible) return

    const container = containerRef?.current
    if (!container) return

    let lastScrollY = container.scrollTop

    const handleScroll = () => {
      const currentScrollY = container.scrollTop

      if (currentScrollY > lastScrollY && currentScrollY > 100 && !isCollapsed) {
        setIsCollapsed(true)
        setWasAutoCollapsed(true)
      }

      if (currentScrollY < lastScrollY && currentScrollY <= 50 && wasAutoCollapsed && !defaultCollapsed) {
        setIsCollapsed(false)
        setWasAutoCollapsed(false)
      }

      lastScrollY = currentScrollY
    }

    container.addEventListener("scroll", handleScroll, { passive: true })

    return () => container.removeEventListener("scroll", handleScroll)
  }, [collapsible, isCollapsed, wasAutoCollapsed, defaultCollapsed, containerRef])

  const handleCollapsedChange = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (!collapsed) {
      setWasAutoCollapsed(false)
    }
  }, [])

  const filteredSchema = useMemo(() => {
    if (!schema || !("shape" in (schema as any))) {
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
    resolver: schema ? zodResolver(schema as any) : undefined,
    defaultValues: defaultValues as any,
  })

  const filterFields = useMemo(() => {
    const fields: FilterFieldConfig[] = []
    if (enableDateRange) {
      fields.push({
        key: "dateRange",
        label: t("common.fields.dateRange" as any),
        type: FilterFieldType.DATERANGE,
        placeholder: t("common.placeholders.dateRange" as any),
        transform: (value: DateRangeValue) => ({
          createdFrom: value.from instanceof Date ? value.from.toISOString() : value.from || null,
          createdTo: value.to instanceof Date ? value.to.toISOString() : value.to || null,
        }),
      } as FilterFieldConfig)
    }

    generateFilterFieldsFromSchema({ schema: filteredSchema, fieldTranslationPrefix, t }).forEach((filterField) => fields.push(filterField))
    return fields
  }, [enableDateRange, t, filteredSchema, fieldTranslationPrefix])

  const generatedSections: FilterSectionType[] = useMemo(() => {
    if (sections && Array.isArray(sections) && sections.length > 0) {
      return sections
    }
    return [new FilterSectionBuilder().addFields(filterFields || []).build()]
  }, [sections, filterFields])

  const handleSubmit = useCallback(
    (values: T) => {
      let processedValues = { ...values } as Record<string, any>

      // Apply field-specific transformations
      filterFields.forEach((field) => {
        if (field.transform && processedValues[field.key] !== undefined) {
          const transformed = field.transform(processedValues[field.key])
          delete processedValues[field.key]
          processedValues = { ...processedValues, ...transformed }
        }
      })

      const cleanedValues = Object.entries(processedValues || {}).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            if (Array.isArray(value) && value?.length === 0) {
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
    [onFilter, filterFields],
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
    const checkValue = (val: any): boolean => {
      if (val === "" || val === null || val === undefined) return false
      if (Array.isArray(val)) return (val?.length || 0) > 0
      if (typeof val === "object") {
        const entries = Object.entries(val)
        return entries.length > 0 && entries.some(([_, v]) => checkValue(v))
      }
      return true
    }
    return Object.values(values || {}).some(checkValue)
  }, [form.watch()])

  const handleSearch = (text: string) => {
    form.setValue("searchTerm" as keyof T as any, text as any)
  }

  const handleRefreshAndSubmit = () => {
    form.handleSubmit(handleSubmit)()
  }

  const filterHeader = (
    <FilterHeader
      selectedRows={selectedRows}
      viewMode={viewMode}
      setViewMode={setViewMode}
      refreshData={handleRefreshAndSubmit}
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
    <div className="p-4 pt-2 space-y-2 border-t">
      {generatedSections.map((section) => (
        <FilterSection key={section.title} section={section} control={form.control} isLoading={isLoading} />
      ))}
    </div>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
      </form>
    </Form>
  )
}
