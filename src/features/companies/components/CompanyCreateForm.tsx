import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCompanyRequest } from "@/shared/api"
import { zCreateCompanyRequest } from "@/shared/api/zod.gen"
import { useCompanyOptions } from "../hooks/useCompanyOptions"

interface CompanyCreateFormProps {
  onSubmit: (data: CreateCompanyRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean

  defaultValues?: Partial<CreateCompanyRequest>
}

export const CompanyCreateForm: React.FC<CompanyCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues }) => {
  const { t } = useTranslation()

  const form = useForm<CreateCompanyRequest>({
    resolver: zodResolver(zCreateCompanyRequest),
    defaultValues: {
      ...defaultValues,
    },
  })

  const { getAllCompanyStatusQuery, getAllCompanyTypesQuery, getCountryOptionsQuery } = useCompanyOptions()

  const { data: countryDropdownData, isLoading: isCountryLoading } = getCountryOptionsQuery()
  const countryOptions = countryDropdownData?.data?.map((c) => ({ value: c.id, label: c.name })) || []

  const { data: companyStatusDropdownData, isLoading: isCompanyStatusLoading } = getAllCompanyStatusQuery()
  const companyStatusOptions = companyStatusDropdownData?.data?.map((c) => ({ value: c.code, label: c.displayName })) || []

  const { data: companyTypesDropdownData, isLoading: isCompanyTypesLoading } = getAllCompanyTypesQuery()
  const companyTypesOptions = companyTypesDropdownData?.data?.map((c) => ({ value: c.code, label: c.displayName })) || []

  const handleSubmit = (values: CreateCompanyRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        {/* <CardTitle>{ t("companies.form.create.title") */}
        <CardDescription>{t("companies.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.namePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("companies.form.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.emailPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("companies.form.phoneNumberLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.phoneNumberPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.websiteLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.websitePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.businessRegistrationNumberLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.businessRegistrationNumberPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.taxNumberLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.taxNumberPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.adressLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.adressPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.countryIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={countryOptions}
                        placeholder={t("companies.form.countryIdPlaceholder")}
                        disabled={isCountryLoading}
                        isLoading={isCountryLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.companySizeLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.companySizePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.companyTypeLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={companyTypesOptions}
                        placeholder={t("companies.form.companyTypePlaceholder")}
                        disabled={isCompanyTypesLoading}
                        isLoading={isCompanyTypesLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("countries.form.fields.isVerified")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.statusLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={companyStatusOptions}
                        placeholder={t("companies.form.statusPlaceholder")}
                        disabled={isCompanyStatusLoading}
                        isLoading={isCompanyStatusLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.contactPersonLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.contactPersonPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("companies.form.conctactPhoneLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("companies.form.contactPhonePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                {t("companies.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
