import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditUserProfileRequest } from "@/shared/api"
import { zEditUserProfileRequest } from "@/shared/api/zod.gen"



interface UserProfileEditFormProps {
  onSubmit: (data: EditUserProfileRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditUserProfileRequest>
  initialData?: Partial<EditUserProfileRequest>
  style?: string
}

export const UserProfileEditForm: React.FC<UserProfileEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<EditUserProfileRequest>({
    resolver: zodResolver(zEditUserProfileRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  

  const handleSubmit = (values: EditUserProfileRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("userProfile.form.edit.title")}</CardTitle>
        <CardDescription>{t("userProfile.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("UserProfile.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("UserProfile.form.namePlaceholder")}
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
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("UserProfile.form.descriptionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("UserProfile.form.descriptionPlaceholder")}
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
      name="permissions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("UserProfile.form.permissionsLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("UserProfile.form.permissionsPlaceholder")}
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
      name="isSystemProfile"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("UserProfile.form.isSystemProfileLabel")}</FormLabel>
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
      name="isActive"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("UserProfile.form.isActiveLabel")}</FormLabel>
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
                {t("userProfile.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
