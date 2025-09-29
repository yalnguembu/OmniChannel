import React, { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { EyeIcon, EyeOffIcon, LoaderIcon, PlusCircleIcon, XCircleIcon } from "lucide-react"
import { SecureSettingRequest } from "@/shared/api"
import { zSecureSettingRequest } from "@/shared/api/zod.gen"
import * as z from "zod"
import { getUUID } from "@/shared/lib/uuid4"

interface SecureSettingEditFormProps {
  onSubmit: (data: SecureSettingRequest[]) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues: Partial<SecureSettingRequest>[]
  systemName: string
}

const multiSecureSettingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  settings: z.array(zSecureSettingRequest).min(1, "At least one setting is required"),
})

type SecureSettingsFormValues = z.infer<typeof multiSecureSettingSchema>

export const SecureSettingEditForm: React.FC<SecureSettingEditFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, systemName }) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<SecureSettingsFormValues>({
    resolver: zodResolver(multiSecureSettingSchema),
    defaultValues: {
      name: systemName,
      settings: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "settings",
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: systemName,
        settings: defaultValues,
      })
    }
  }, [defaultValues, form, systemName])

  const handleSubmit = (values: SecureSettingsFormValues) => {
    if (onSubmit) {
      onSubmit(
        values.settings.map((setting) => ({
          ...setting,
          systemName,
        })),
      )
    }
  }

  const addSetting = () => {
    append({ systemName, value: "", description: "", key: "" })
  }

  const removeSetting = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const areAllSettingsValid = useMemo(() => {
    const values = form.getValues()
    return values.settings.every((setting) => setting.key && setting.value)
  }, [form])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("secureSettings.form.edit.title")}</CardTitle>
        <CardDescription>{t("secureSettings.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("secureSettings.form.nameLabel")}</FormLabel>
                  <FormControl>
                    <Input disabled type="text" placeholder={t("secureSettings.form.namePlaceholder", "Enter setting group name")} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mb-6 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{t("secureSettings.form.elementsTitle", "Elements")}</h3>
                {areAllSettingsValid && (
                  <Button type="button" variant="outline" size="icon" onClick={addSetting}>
                    <PlusCircleIcon className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {fields.map((_, index) => (
                  <div key={getUUID()} className="p-4 border rounded-md bg-muted/20 relative">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background shadow"
                        onClick={() => removeSetting(index)}
                      >
                        <XCircleIcon className="h-5 w-5 text-destructive" />
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`settings.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("secureSettings.form.keyLabel", "Key")}</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder={t("secureSettings.form.keyPlaceholder", "Enter key")}
                                disabled={defaultValues[index]?.key === field.value}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`settings.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("secureSettings.form.secureValueLabel", "Value")}</FormLabel>
                            <FormControl>
                              {(() => {
                                return (
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder={t("secureSettings.form.secureValuePlaceholder", "Enter value")}
                                      {...field}
                                      value={field.value || ""}
                                    />

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => setShowPassword((prev) => !prev)}
                                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    >
                                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </Button>
                                  </div>
                                )
                              })()}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`settings.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("secureSettings.form.descriptionLabel", "Description")}</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder={t("secureSettings.form.descriptionPlaceholder", "Enter description")} {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading || !areAllSettingsValid}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("secureSettings.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
