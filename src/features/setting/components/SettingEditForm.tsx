import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditSettingRequest } from "@/shared/api"
import { zEditSettingRequest } from "@/shared/api/zod.gen"



interface SettingEditFormProps {
  onSubmit: (data: EditSettingRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditSettingRequest>
  initialData?: Partial<EditSettingRequest>
}

export const SettingEditForm: React.FC<SettingEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditSettingRequest>({
    resolver: zodResolver(zEditSettingRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  

  const handleSubmit = (values: EditSettingRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("setting.form.edit.title")}</CardTitle>
        <CardDescription>{t("setting.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="value"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.valueLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Setting.form.valuePlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="dataType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.dataTypeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Setting.form.dataTypePlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="isEncrypted"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.isEncryptedLabel")}</FormLabel>
          <FormControl>
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
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
          <FormLabel>{t("Setting.form.descriptionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Setting.form.descriptionPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.categoryLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Setting.form.categoryPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="isReadOnly"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.isReadOnlyLabel")}</FormLabel>
          <FormControl>
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="isSystemSetting"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.isSystemSettingLabel")}</FormLabel>
          <FormControl>
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="allowedValues"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.allowedValuesLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Setting.form.allowedValuesPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="validationRegex"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Setting.form.validationRegexLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Setting.form.validationRegexPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
            </div>

            {form.formState.errors.root && (
              <div className="bg-destructive/15 text-destructive text-sm font-medium p-3 rounded-md animate-in fade-in slide-in-from-top-1">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("setting.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
