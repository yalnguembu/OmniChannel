import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { UpdateAllowedIpRequest } from "@/shared/api"
import { zUpdateAllowedIpRequest } from "@/shared/api/zod.gen"

interface AllowedIpEditFormProps {
  allowedIpId: string
  initialData: UpdateAllowedIpRequest
  onSubmit: (data: UpdateAllowedIpRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const AllowedIpEditForm: React.FC<AllowedIpEditFormProps> = ({ allowedIpId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdateAllowedIpRequest>({
    resolver: zodResolver(zUpdateAllowedIpRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateAllowedIpRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: allowedIpId })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("allowedIps.form.edit.title")}</CardTitle>
        <CardDescription>{t("allowedIps.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("allowedIps.form.applicationIdLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("allowedIps.form.applicationIdPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("allowedIps.form.ipAddressLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("allowedIps.form.ipAddressPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                {t("allowedIps.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
