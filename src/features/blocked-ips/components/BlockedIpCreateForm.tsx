import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateBlockedIpRequest } from "@/shared/api"
import { zCreateBlockedIpRequest } from "@/shared/api/zod.gen"

interface BlockedIpCreateFormProps {
  onSubmit: (data: CreateBlockedIpRequest) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateBlockedIpRequest>
}

export const BlockedIpCreateForm: React.FC<BlockedIpCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues }) => {
  const { t } = useTranslation()

  const form = useForm<CreateBlockedIpRequest>({
    resolver: zodResolver(zCreateBlockedIpRequest),
    defaultValues: {
      ...defaultValues,
    },
  })

  useEffect(() => {
    form.reset({ ...defaultValues })
  }, [defaultValues, form])

  const handleSubmit = (values: CreateBlockedIpRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("blockedIp.form.create.title")}</CardTitle>
        <CardDescription>{t("blockedIp.form.create.description")}</CardDescription>
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
                {t("blockedIp.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
