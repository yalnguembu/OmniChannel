import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { UpdateCompanyAppLimitRequest } from "@/shared/api"
import { zUpdateCompanyAppLimitRequest } from "@/shared/api/zod.gen"

interface CompanyAppLimitEditFormProps {
  companyAppLimitId: string
  initialData: UpdateCompanyAppLimitRequest
  onSubmit: (data: UpdateCompanyAppLimitRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const CompanyAppLimitEditForm: React.FC<CompanyAppLimitEditFormProps> = ({ companyAppLimitId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdateCompanyAppLimitRequest>({
    resolver: zodResolver(zUpdateCompanyAppLimitRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateCompanyAppLimitRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: companyAppLimitId })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("companyAppLimits.form.edit.title")}</CardTitle>
        <CardDescription>{t("companyAppLimits.form.edit.description")}</CardDescription>
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
                    <FormLabel>Company Id</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Company Id" {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>Application Id</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Application Id" {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>Api Requests Limit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Api Requests Limit" {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>Default Daily Limit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Default Daily Limit" {...field} value={field.value || ""} required={false} />
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
                      <Input type="number" placeholder="Default Monthly Limit" {...field} value={field.value || ""} required={false} />
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
                      <Input type="number" placeholder="Default Single Transaction Limit" {...field} value={field.value || ""} required={false} />
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
                {t("companyAppLimits.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
