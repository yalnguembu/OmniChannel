import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { UpdateBlockedIpRequest } from "@/shared/api"
import { zUpdateBlockedIpRequest } from "@/shared/api/zod.gen"

interface BlockedIpEditFormProps {
  blockedIpId: string
  initialData: UpdateBlockedIpRequest
  onSubmit: (data: UpdateBlockedIpRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const BlockedIpEditForm: React.FC<BlockedIpEditFormProps> = ({ blockedIpId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdateBlockedIpRequest>({
    resolver: zodResolver(zUpdateBlockedIpRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateBlockedIpRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: blockedIpId })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("blockedIps.form.edit.title")}</CardTitle>
        <CardDescription>{t("blockedIps.form.edit.description")}</CardDescription>
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
                    <FormLabel>{t("blockedIps.form.applicationIdLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("blockedIps.form.applicationIdPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("blockedIps.form.ipdAdressLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("blockedIps.form.ipdAdressPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("blockedIps.form.reasonLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("blockedIps.form.reasonPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                {t("blockedIp.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
