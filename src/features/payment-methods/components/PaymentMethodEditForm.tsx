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
import { UpdatePaymentMethodRequest } from "@/shared/api"
import { zUpdatePaymentMethodRequest } from "@/shared/api/zod.gen"

interface PaymentMethodEditFormProps {
  paymentMethodId: string
  initialData: UpdatePaymentMethodRequest
  onSubmit: (data: UpdatePaymentMethodRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const PaymentMethodEditForm: React.FC<PaymentMethodEditFormProps> = ({ paymentMethodId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const form = useForm<UpdatePaymentMethodRequest>({
    resolver: zodResolver(zUpdatePaymentMethodRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdatePaymentMethodRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: paymentMethodId })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("paymentMethods.form.edit.title")}</CardTitle>
        <CardDescription>{t("paymentMethods.form.edit.description")}</CardDescription>
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
                    <FormLabel>{t("paymentMethods.form.codeLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("paymentMethods.form.codePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("paymentMethods.form.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("paymentMethods.form.namePlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("paymentMethods.form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("paymentMethods.form.descriptionPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requiresPhoneNumber"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("paymentMethods.form.requiresPhoneNumberLabel")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentMethods.form.minimumAmountLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("paymentMethods.form.codePlaceholder")}
                        {...field}
                        value={field.value || ""}
                        required={false}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentMethods.form.maximumAmountLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("paymentMethods.form.maximumAmountPlaceholder")}
                        {...field}
                        value={field.value || ""}
                        required={false}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settlementPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentMethods.formsettlementLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("paymentMethods.formsettlementPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                    <FormLabel>{t("paymentMethods.form.isActiveLabel")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentMethods.form.sortOrderLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("paymentMethods.form.sortOrderPlaceholder")}
                        {...field}
                        value={field.value || ""}
                        required={false}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
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
                {t("paymentMethods.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
