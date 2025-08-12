import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateSettingRequest } from "@/shared/api"
import { zCreateSettingRequest } from "@/shared/api/zod.gen"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { useApplication } from "@/features/companies/hooks/useApplication"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

interface SettingCreateFormProps {
  onSubmit: (data: CreateSettingRequest) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateSettingRequest>
  companyId?: string
  applicationId?: string
}

export const SettingCreateForm: React.FC<SettingCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, companyId, applicationId }) => {
  const { t } = useTranslation()

  const form = useForm<CreateSettingRequest>({
    resolver: zodResolver(zCreateSettingRequest),
    defaultValues: {
      ...defaultValues,
      applicationId: applicationId ?? defaultValues?.applicationId,
      companyId: companyId ?? defaultValues?.companyId,
    },
  })

  const handleSubmit = (values: CreateSettingRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }
  const { dropdownQuery: companyDropdownQuery } = useCompany()
  const { data: companyDropdownData, isLoading: isCompanyLoading } = companyDropdownQuery()
  const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const { dropdownQuery: applicationDropdownQuery } = useApplication()
  const { data: applicationDropdownData, isLoading: isApplicationLoading } = applicationDropdownQuery()
  const applicationOptions = applicationDropdownData && applicationDropdownData.data ? applicationDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("settings.form.create.title")}</CardTitle>
        <CardDescription>{t("settings.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!!companyId && (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("settings.form.companyLabel")}</FormLabel>
                      <FormControl>
                        <SearchDropdown
                          value={field.value || null}
                          onChange={(val) => field.onChange(val)}
                          options={companyOptions}
                          placeholder={t("settings.form.companyPlaceholder") || "Select company"}
                          disabled={isCompanyLoading}
                          isLoading={isCompanyLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!!applicationId && (
                <FormField
                  control={form.control}
                  name="applicationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("settings.form.applicationLabel")}</FormLabel>
                      <FormControl>
                        <SearchDropdown
                          value={field.value || null}
                          onChange={(val) => field.onChange(val)}
                          options={applicationOptions}
                          placeholder={t("settings.form.applicationPlaceholder") || "Select company"}
                          disabled={isApplicationLoading}
                          isLoading={isApplicationLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="value"
                rules={{
                  validate: (value: string | null | undefined) => {
                    if (typeof value !== "string") {
                      return "Value is required"
                    }
                    const { allowedValues, validationRegex } = form.getValues()
                    if (allowedValues && Array.isArray(allowedValues) && !allowedValues.includes(value)) {
                      return "Value must be one of the allowed values"
                    }
                    if (validationRegex) {
                      const regex = new RegExp(validationRegex)
                      if (!regex.test(value)) {
                        return "Value does not match the required format"
                      }
                    }
                    return true
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.form.valueLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("settings.form.valuePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.form.dataTypeLabel")}</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value)} value={field.value ?? undefined}>
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={t("settings.form.dataType.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INT">{t("settings.form.dataType.int")}</SelectItem>
                          <SelectItem value="FLOAT">{t("settings.form.dataType.float")}</SelectItem>
                          <SelectItem value="BOOL">{t("settings.form.dataType.bool")}</SelectItem>
                          <SelectItem value="CHAR">{t("settings.form.dataType.char")}</SelectItem>
                          <SelectItem value="STRING">{t("settings.form.dataType.string")}</SelectItem>
                          <SelectItem value="DOUBLE">{t("settings.form.dataType.double")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("settings.form.descriptionPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.form.categoryLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("settings.form.categoryPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowedValues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.form.allowedValuesLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("settings.form.allowedValuesPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validationRegex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.form.validationRegexLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Validation Regex" {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEncrypted"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("settings.form.isEncryptedLabel")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isReadOnly"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("settings.form.isReadOnlyLabel")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSystemSetting"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("settings.form.isSystemSettingLabel")}</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("settings.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
