import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { LoaderIcon } from "lucide-react"
import { CreateCompanyUserRequest } from "@/shared/api"
import { zCreateCompanyUserRequest } from "@/shared/api/zod.gen"
import { useUserProfile } from "@/features/user-profiles/hooks/useUserProfile"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"

interface UserCreateFormProps {
  onSubmit: (data: CreateCompanyUserRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateCompanyUserRequest>
  companyId: string
  style?: string
}

export const UserCreateForm: React.FC<UserCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, companyId }) => {
  const { t } = useTranslation()

  const form = useForm<CreateCompanyUserRequest>({
    resolver: zodResolver(zCreateCompanyUserRequest),
    defaultValues: {
      ...defaultValues,
      companyId: companyId || "",
      forcePasswordChange: true,
    },
  })

  const { userProfiles, isLoading: isUserProfilesLoading } = useUserProfile()

  const userProfileOptions = useMemo(() => userProfiles.map((userProfile) => ({ value: userProfile.id ?? "", label: userProfile.name ?? "" })) ?? [], [userProfiles])

  const handleSubmit = (values: CreateCompanyUserRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="profileId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.form.profileIdLabel")}</FormLabel>
                <FormControl>
                  <SearchDropdown
                    value={field.value || null}
                    onChange={(val) => field.onChange(val)}
                    options={userProfileOptions}
                    placeholder={t("users.form.profileIdPlaceholder")}
                    disabled={isUserProfilesLoading}
                    isLoading={isUserProfilesLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.form.firstNameLabel")}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder={t("users.form.firstNamePlaceholder")} {...field} value={field.value || ""} required={false} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.form.lastNameLabel")}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder={t("users.form.lastNamePlaceholder")} {...field} value={field.value || ""} required={false} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.form.emailLabel")}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder={t("users.form.emailPlaceholder")} {...field} value={field.value || ""} required={false} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.form.phoneNumberLabel")}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder={t("users.form.phoneNumberPlaceholder")} {...field} value={field.value || ""} required={false} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initialPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.form.initialPasswordLabel")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t("users.form.initialPasswordPlaceholder")} {...field} value={field.value || ""} required={false} />
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
            {t("users.form.create.submit")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
