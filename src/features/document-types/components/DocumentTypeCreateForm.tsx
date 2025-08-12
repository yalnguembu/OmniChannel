import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateDocumentsTypeRequest } from "@/shared/api"
import { zCreateDocumentsTypeRequest } from "@/shared/api/zod.gen"

interface DocumentsTypeCreateFormProps {
  onSubmit: (data: CreateDocumentsTypeRequest) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateDocumentsTypeRequest>
}

export const DocumentsTypeCreateForm: React.FC<DocumentsTypeCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues }) => {
  const { t } = useTranslation()

  const form = useForm<CreateDocumentsTypeRequest>({
    resolver: zodResolver(zCreateDocumentsTypeRequest),
    defaultValues: {
      ...defaultValues,
    },
  })

  useEffect(() => {
    form.reset({ ...defaultValues })
  }, [defaultValues, form])

  const handleSubmit = (values: CreateDocumentsTypeRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("documentsTypes.form.create.title")}</CardTitle>
        <CardDescription>{t("documentsTypes.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("documentsTypes.form.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("documentsTypes.form.namePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("documentsTypes.form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("documentsTypes.form.descriptionPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                {t("documentsTypes.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
