import { z } from "zod"
import { FilterFieldConfig, FilterSection } from "../types/filter"
import { FilterFieldType } from "../enums/filter"
import { EXCLUDED_FIELDS } from "../lib/constant"

export function inferFilterTypeFromZodSchema(zodType: z.ZodType<any>): FilterFieldType {
  if (zodType instanceof z.ZodString) {
    return FilterFieldType.TEXT
  }
  if (zodType instanceof z.ZodNumber) {
    return FilterFieldType.NUMBER
  }
  if (zodType instanceof z.ZodBoolean) {
    return FilterFieldType.CHECKBOX
  }
  if (zodType instanceof z.ZodDate) {
    return FilterFieldType.DATE
  }
  if (zodType instanceof z.ZodArray) {
    return FilterFieldType.CHECKBOXGROUP
  }
  if (zodType instanceof z.ZodEnum) {
    return FilterFieldType.SELECT
  }
  if (zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable) {
    return inferFilterTypeFromZodSchema(zodType.unwrap())
  }
  if (zodType instanceof z.ZodUnion) {
    const options = zodType._def.options as z.ZodTypeAny[]
    for (const option of options) {
      if (!(option instanceof z.ZodNull) && !(option instanceof z.ZodUndefined)) {
        return inferFilterTypeFromZodSchema(option)
      }
    }
    return FilterFieldType.TEXT
  }
  return FilterFieldType.TEXT
}
type Props<T> = {
  schema?: z.ZodObject<any>
  fieldConfigs?: Partial<Record<keyof T, Partial<FilterFieldConfig>>>
  excludeFields?: string[]
  fieldTranslationPrefix: string
  t: (key: any) => string
}

export function generateFilterFieldsFromSchema<T extends Record<string, any>>({
  schema,
  fieldConfigs = {},
  excludeFields = EXCLUDED_FIELDS,
  fieldTranslationPrefix,
  t,
}: Props<T>): FilterFieldConfig[] {
  if (!schema) return []

  const shape = (schema as any).shape as Record<string, z.ZodType<any>>
  if (!shape) return []

  return Object.entries(shape)
    .filter(([key]) => !excludeFields.includes(key))
    .map(([key, zodType]) => {
      const userConfig = fieldConfigs[key as keyof T] || {}
      const inferredType = inferFilterTypeFromZodSchema(zodType)

      const label = userConfig.labelKey
        ? t(userConfig.labelKey as any)
        : userConfig.label
          ? t(userConfig.label as any)
          : t(`${fieldTranslationPrefix}.form.${key}Label` as any)

      const placeholder = userConfig.placeholderKey
        ? t(userConfig.placeholderKey as any)
        : userConfig.placeholder
          ? t(userConfig.placeholder as any)
          : undefined

      return {
        key,
        label,
        type: userConfig.type || inferredType,
        placeholder,
        options: userConfig.options,
        required: userConfig.required || false,
        disabled: userConfig.disabled || false,
        searchable: userConfig.searchable,
        multiple: userConfig.multiple,
        validation: zodType,
        className: userConfig.className,
        description: userConfig.description,
      } as FilterFieldConfig
    })
}

export class FilterSectionBuilder {
  private title: string
  private fields: FilterFieldConfig[] = []
  private collapsible: boolean = false
  private defaultCollapsed: boolean = false

  constructor(title: string = "", collapsible: boolean = false, defaultCollapsed: boolean = false) {
    this.title = title
    this.collapsible = collapsible
    this.defaultCollapsed = defaultCollapsed
  }

  addField(field: FilterFieldConfig): FilterSectionBuilder {
    this.fields.push(field)
    return this
  }

  addFields(fields: FilterFieldConfig[]): FilterSectionBuilder {
    this.fields.push(...fields)
    return this
  }

  build(): FilterSection {
    return {
      title: this.title,
      fields: this.fields,
      collapsible: this.collapsible,
      defaultCollapsed: this.defaultCollapsed,
    }
  }
}
