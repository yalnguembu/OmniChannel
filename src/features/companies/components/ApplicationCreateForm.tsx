import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateApplicationRequest } from "@/shared/api"
import { zCreateApplicationRequest } from "@/shared/api/zod.gen"

interface ApplicationCreateFormProps {
  onSubmit: (data: CreateApplicationRequest) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateApplicationRequest>
  companyId?: string
  style?: string
}

export const ApplicationCreateForm: React.FC<ApplicationCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, companyId, style }) => {
  const { t } = useTranslation()
  const { dropdownQuery } = useCompany()
  const { data: companyDropdownData, isLoading: isCompanyLoading } = dropdownQuery()
  const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const form = useForm<CreateApplicationRequest>({
    resolver: zodResolver(zCreateApplicationRequest),
    defaultValues: {
      ...defaultValues,
      environment: "PRODUCTION",
      status: "ACTIVE",
      companyId: companyId || undefined,
    },
  })

  const handleSubmit = (values: CreateApplicationRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("applications.form.create.title")}</CardTitle>
        <CardDescription>{t("applications.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {companyId ? (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("applications.form.companyIdLabel")}</FormLabel>
                      <FormControl>
                        <SearchDropdown
                          value={field.value || null}
                          onChange={(val) => field.onChange(val)}
                          options={companyOptions}
                          placeholder={t("applications.form.companyIdPlaceholder") || "Select company"}
                          disabled={isCompanyLoading}
                          isLoading={isCompanyLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("applications.form.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("applications.form.namePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("applications.form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("applications.form.descriptionPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                {t("applications.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
