import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditPaymentMethodRequest } from "@/shared/api"
import { zEditPaymentMethodRequest } from "@/shared/api/zod.gen"



interface PaymentMethodEditFormProps {
  onSubmit: (data: EditPaymentMethodRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditPaymentMethodRequest>
  initialData?: Partial<EditPaymentMethodRequest>
}

export const PaymentMethodEditForm: React.FC<PaymentMethodEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditPaymentMethodRequest>({
    resolver: zodResolver(zEditPaymentMethodRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  

  const handleSubmit = (values: EditPaymentMethodRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("paymentMethod.form.edit.title")}</CardTitle>
        <CardDescription>{t("paymentMethod.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.codeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("PaymentMethod.form.codePlaceholder")}
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
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("PaymentMethod.form.namePlaceholder")}
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
          <FormLabel>{t("PaymentMethod.form.descriptionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("PaymentMethod.form.descriptionPlaceholder")}
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
      name="logoUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.logoUrlLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("PaymentMethod.form.logoUrlPlaceholder")}
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
      name="requiresPhoneNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.requiresPhoneNumberLabel")}</FormLabel>
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
      name="minimumAmount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.minimumAmountLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("PaymentMethod.form.minimumAmountPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
              onChange={(e) => field.onChange(Number(e.target.value))}
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
          <FormLabel>{t("PaymentMethod.form.maximumAmountLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("PaymentMethod.form.maximumAmountPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
              onChange={(e) => field.onChange(Number(e.target.value))}
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
          <FormLabel>{t("PaymentMethod.form.settlementPeriodLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("PaymentMethod.form.settlementPeriodPlaceholder")}
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
      name="isActive"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.isActiveLabel")}</FormLabel>
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
      name="sortOrder"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("PaymentMethod.form.sortOrderLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("PaymentMethod.form.sortOrderPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
              onChange={(e) => field.onChange(Number(e.target.value))}
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
                {t("paymentMethod.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
