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
import { CreateSmsmailTemplateRequest } from "@/shared/api"
import { zCreateSmsmailTemplateRequest } from "@/shared/api/zod.gen"

interface SmsmailTemplateCreateFormProps {
  onSubmit: (data: CreateSmsmailTemplateRequest) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateSmsmailTemplateRequest>
}

export const SmsmailTemplateCreateForm: React.FC<SmsmailTemplateCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues }) => {
  const { t } = useTranslation()

  const form = useForm<CreateSmsmailTemplateRequest>({
    resolver: zodResolver(zCreateSmsmailTemplateRequest),
    defaultValues: {
      ...defaultValues,
    },
  })

  const handleSubmit = (values: CreateSmsmailTemplateRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("smsmailTemplates.form.create.title")}</CardTitle>
        <CardDescription>{t("smsmailTemplates.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("smsmailTemplates.form.localeLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("smsmailTemplates.form.localePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("smsmailTemplates.form.typeLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("smsmailTemplates.form.typePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("smsmailTemplates.form.subjectLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("smsmailTemplates.form.subjectPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("smsmailTemplates.form.bodyLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("smsmailTemplates.form.bodyPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("smsmailTemplates.form.isActiveLabel")}</FormLabel>
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
                {t("smsmailTemplates.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
