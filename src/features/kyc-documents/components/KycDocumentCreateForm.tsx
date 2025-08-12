import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateKycDocumentRequest } from "@/shared/api"
import { zCreateKycDocumentRequest } from "@/shared/api/zod.gen"

interface KycDocumentCreateFormProps {
  onSubmit: (data: CreateKycDocumentRequest) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateKycDocumentRequest>
}

export const KycDocumentCreateForm: React.FC<KycDocumentCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues }) => {
  const { t } = useTranslation()

  const form = useForm<CreateKycDocumentRequest>({
    resolver: zodResolver(zCreateKycDocumentRequest),
    defaultValues: {
      ...defaultValues,
    },
  })

  const handleSubmit = (values: CreateKycDocumentRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("kycDocuments.form.create.title")}</CardTitle>
        <CardDescription>{t("kycDocuments.form.create.description")}</CardDescription>
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
                    <FormLabel>{t("kycDocuments.form.companyIdLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("kycDocuments.form.companyIdPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("kycDocuments.form.documentTypeIdLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("kycDocuments.form.documentTypeIdPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("kycDocuments.form.documentUrlLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("kycDocuments.form.documentUrlPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("kycDocuments.form.statusLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("kycDocuments.form.statusPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                {t("kycDocuments.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
