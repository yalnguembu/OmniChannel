import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCompanyAppLimitRequest } from "@/shared/api"
import { zCreateCompanyAppLimitRequest } from "@/shared/api/zod.gen"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { useApplication } from "@/features/companies/hooks/useApplication"

interface CompanyAppLimitCreateFormProps {
  onSubmit: (data: CreateCompanyAppLimitRequest) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateCompanyAppLimitRequest>
  companyId?: string
}

export const CompanyAppLimitCreateForm: React.FC<CompanyAppLimitCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, companyId }) => {
  const { t } = useTranslation()

  const form = useForm<CreateCompanyAppLimitRequest>({
    resolver: zodResolver(zCreateCompanyAppLimitRequest),
    defaultValues: {
      ...defaultValues,
      companyId: companyId ?? defaultValues?.companyId,
    },
  })

  const handleSubmit = (values: CreateCompanyAppLimitRequest) => {
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
        <CardTitle>{t("companyAppLimits.form.create.title")}</CardTitle>
        <CardDescription>{t("companyAppLimits.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companyAppLimits.form.companyIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={companyOptions}
                        placeholder={t("companyAppLimits.form.companyIdPlaceholder")}
                        disabled={isCompanyLoading}
                        isLoading={isCompanyLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companyAppLimits.form.applicationIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={applicationOptions}
                        placeholder={t("companyAppLimits.form.applicationIdPlaceholder")}
                        disabled={isApplicationLoading}
                        isLoading={isApplicationLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiRequestsLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companyAppLimits.form.apiRequestsLimitLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("companyAppLimits.form.apiRequestsLimitPlaceholder")}
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultDailyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companyAppLimits.form.defaultDailyLimitLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("companyAppLimits.form.defaultDailyLimitPlaceholder")}
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultMonthlyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Monthly Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Default Monthly Limit"
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultSingleTransactionLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Single Transaction Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Default Single Transaction Limit"
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
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
                {t("companyAppLimits.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
