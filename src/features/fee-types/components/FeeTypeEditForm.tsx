import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { UpdateFeeTypeRequest } from "@/shared/api"
import { zUpdateFeeTypeRequest } from "@/shared/api/zod.gen"
import { usePaymentMethod } from "@/features/payment-methods/hooks/usePayMentmethod"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"

interface FeeTypeEditFormProps {
  feeTypeId: string
  initialData: UpdateFeeTypeRequest
  onSubmit: (data: UpdateFeeTypeRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const FeeTypeEditForm: React.FC<FeeTypeEditFormProps> = ({ feeTypeId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdateFeeTypeRequest>({
    resolver: zodResolver(zUpdateFeeTypeRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateFeeTypeRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: feeTypeId })
    }
  }

  const { dropdownQuery: paymentMethodDropdownQuery } = usePaymentMethod()
  const { data: paymentMethodDropdownData, isLoading: isPaymentMethodLoading } = paymentMethodDropdownQuery()
  const paymentMethodOptions = paymentMethodDropdownData && paymentMethodDropdownData.data ? paymentMethodDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("feeTypes.form.edit.title")}</CardTitle>
        <CardDescription>{t("feeTypes.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeTypes.form.codeLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("feeTypes.form.codePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("feeTypes.form.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("feeTypes.form.namePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("feeTypes.form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("feeTypes.form.codePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeTypes.form.transactionTypeLabel")}</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value)} value={field.value ?? undefined}>
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={t("feeTypes.form.transactionTypePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECEIPT">{t("feeTypes.form.transactionType.receipt")}</SelectItem>
                          <SelectItem value="WITHDRWAL">{t("feeTypes.form.transactionType.withdrawal")}</SelectItem>
                          <SelectItem value="TRANSFER">{t("feeTypes.form.transactionType.transfer")}</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel>{t("feeConfigurations.form.fields.feeTypeId")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={paymentMethodOptions}
                        placeholder={t("feeConfigurations.form.companyId.placeholder") || "Select company"}
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("feeTypes.form.isActiveLabel")}</FormLabel>
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
                {t("feeTypes.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
