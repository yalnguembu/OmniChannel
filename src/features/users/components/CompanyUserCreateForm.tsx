import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCompanyUserRequest } from "@/shared/api"
import { zCreateCompanyUserRequest } from "@/shared/api/zod.gen"
import { useUserProfile } from "@/features/user-profiles/hooks/useUserProfile"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"

interface CompanyUserCreateFormProps {
  onSubmit: (data: CreateCompanyUserRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateCompanyUserRequest>
  companyId?: string
}

export const CompanyUserCreateForm: React.FC<CompanyUserCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, companyId }) => {
  const { t } = useTranslation()

  const form = useForm<CreateCompanyUserRequest>({
    resolver: zodResolver(zCreateCompanyUserRequest),
    defaultValues: {
      ...defaultValues,
      forcePasswordChange: true,
      companyId: companyId || "",
    },
  })

  const { getDropdownQuery: getUserProfiles } = useUserProfile()
  const { dropdownQuery: getCompanies } = useCompany()

  const { data: companiesResponse, isLoading: isCompaniesLoading } = getCompanies()
  const { data: userProfileResponse, isLoading: isUserProfilesLoading } = getUserProfiles()

  const userProfileOptions = useMemo(
    () => userProfileResponse?.data.map((userProfile) => ({ value: userProfile.id ?? "", label: userProfile.name ?? "" })) ?? [],
    [userProfileResponse],
  )
  const userCompanyOptions = useMemo(() => companiesResponse?.data?.map((app) => ({ value: app.id ?? "", label: app.name ?? "" })) ?? [], [companiesResponse])

  const handleSubmit = (values: CreateCompanyUserRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("users.form.create.systemTitle")}</CardTitle>
        <CardDescription>{t("users.form.create.description")}</CardDescription>
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
                    <FormLabel>{t("users.form.companyIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={userCompanyOptions}
                        placeholder={t("users.form.companyIdPlaceholder")}
                        disabled={isCompaniesLoading}
                        isLoading={isCompaniesLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
      </CardContent>
    </Card>
  )
}
