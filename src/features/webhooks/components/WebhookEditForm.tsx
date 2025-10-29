import React, { useEffect } from "react"
import { useForm, UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { UpdateWebhookRequest } from "@/shared/api"
import { zUpdateWebhookRequest } from "@/shared/api/zod.gen"

interface WebhookEditFormProps {
  webhookId: string
  initialData: UpdateWebhookRequest
  onSubmit: (data: UpdateWebhookRequest, setError: UseFormSetError<UpdateWebhookRequest>) => void
  onCancel: () => void
  isLoading?: boolean
}

export const WebhookEditForm: React.FC<WebhookEditFormProps> = ({ webhookId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdateWebhookRequest>({
    resolver: zodResolver(zUpdateWebhookRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateWebhookRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: webhookId }, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("webhooks.form.edit.title")}</CardTitle>
        <CardDescription>{t("webhooks.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("webhooks.form.urlLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("webhooks.form.urlPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxRetries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("webhooks.form.maxRetriesIdLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("webhooks.form.maxRetriesIdPlaceholder")}
                        {...field}
                        value={field.value || ""}
                        required={false}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                {t("webhooks.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
