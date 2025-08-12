import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { UpdateSettingRequest } from "@/shared/api"
import { zUpdateSettingRequest } from "@/shared/api/zod.gen"

interface SettingEditFormProps {
  settingId: string
  initialData: UpdateSettingRequest
  onSubmit: (data: UpdateSettingRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const SettingEditForm: React.FC<SettingEditFormProps> = ({ settingId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdateSettingRequest>({
    resolver: zodResolver(zUpdateSettingRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateSettingRequest) => {
    if (onSubmit) {
      onSubmit({ id: settingId, value: values.value || "" })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("settings.form.edit.title")}</CardTitle>
        <CardDescription>{t("settings.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="value"
                rules={{
                  validate: (value: string | null | undefined) => {
                    if (typeof value !== "string") {
                      return "Value is required"
                    }
                    if (initialData.allowedValues && Array.isArray(initialData.allowedValues) && !initialData.allowedValues.includes(value)) {
                      return "Value must be one of the allowed values"
                    }
                    if (initialData.validationRegex) {
                      const regex = new RegExp(initialData.validationRegex)
                      if (!regex.test(value)) {
                        return "Value does not match the required format"
                      }
                    }
                    return true
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.form.valueLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("settings.form.valuePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                      <Input type="text" placeholder={t("settings.form.descriptionLabel")} {...field} value={field.value || ""} required={false} />
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
                {t("settings.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
