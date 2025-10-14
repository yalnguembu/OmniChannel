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
import { CreateWithdrawalMethodRequest } from "@/shared/api"
import { zCreateWithdrawalMethodRequest } from "@/shared/api/zod.gen"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { usePaymentMethod } from "@/features/payment-methods/hooks/usePayMentmethod"

interface WithdrawalMethodCreateFormProps {
  onSubmit: (data: CreateWithdrawalMethodRequest) => void
  onCancel: () => void
  isLoading?: boolean

  companyId?: string
  defaultValues?: Partial<CreateWithdrawalMethodRequest>
}

export const WithdrawalMethodCreateForm: React.FC<WithdrawalMethodCreateFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues, companyId }) => {
  const { t } = useTranslation()

  const form = useForm<CreateWithdrawalMethodRequest>({
    resolver: zodResolver(zCreateWithdrawalMethodRequest),
    defaultValues: {
      ...defaultValues,
      companyId: companyId || undefined,
    },
  })

  const handleSubmit = (values: CreateWithdrawalMethodRequest) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }
  const { dropdownQuery: companyDropdownQuery } = useCompany()
  const { data: companyDropdownData, isLoading: isCompanyLoading } = companyDropdownQuery()
  const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const { dropdownQuery: paymentMethodDropdownQuery } = usePaymentMethod()
  const { data: paymentMethodDropdownData, isLoading: isPaymentMethodLoading } = paymentMethodDropdownQuery()
  const paymentMethodOptions = paymentMethodDropdownData && paymentMethodDropdownData.data ? paymentMethodDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("withdrawalMethods.form.create.title")}</CardTitle>
        <CardDescription>{t("withdrawalMethods.form.create.description")}</CardDescription>
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
                    <FormLabel>{t("withdrawalMethods.form.companyIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={companyOptions}
                        placeholder={t("withdrawalMethods.form.companyIdPlaceholder")}
                        disabled={isCompanyLoading}
                        isLoading={isCompanyLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("withdrawalMethods.form.namePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("withdrawalMethods.form.phoneNumberLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("withdrawalMethods.form.phoneNumberPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.paymentMethodIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={paymentMethodOptions}
                        placeholder={t("withdrawalMethods.form.paymentMethodIdPlaceholder")}
                        disabled={isPaymentMethodLoading}
                        isLoading={isPaymentMethodLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.dailyLimitLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t("withdrawalMethods.form.dailyLimitPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.monthlyLimitLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t("withdrawalMethods.form.monthlyLimitPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="singleWithdrawalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.singleWithdrawalLimitLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t("withdrawalMethods.form.singleWithdrawalLimitPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="verificationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.verificationDateLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("withdrawalMethods.form.verificationDatePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="verificationReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawalMethods.form.verificationDateLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("withdrawalMethods.form.verificationDatePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("withdrawalMethods.form.fields.isVerified")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("withdrawalMethods.form.fields.isDefault")}</FormLabel>
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
                {t("withdrawalMethod.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
