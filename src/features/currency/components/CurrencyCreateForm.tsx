import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCurrencyRequest } from "@/shared/api"
import { zCreateCurrencyRequest } from "@/shared/api/zod.gen"



interface CurrencyCreateFormProps {
  onSubmit: (data: CreateCurrencyRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateCurrencyRequest>
  
}

export const CurrencyCreateForm: React.FC<CurrencyCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateCurrencyRequest>({
    resolver: zodResolver(zCreateCurrencyRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  

  const handleSubmit = (values: CreateCurrencyRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("currency.form.create.title")}</CardTitle>
        <CardDescription>{t("currency.form.create.description")}</CardDescription>
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
          <FormLabel>{t("Currency.form.codeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Currency.form.codePlaceholder")}
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
          <FormLabel>{t("Currency.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Currency.form.namePlaceholder")}
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
      name="symbol"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Currency.form.symbolLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Currency.form.symbolPlaceholder")}
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
      name="decimalPlaces"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Currency.form.decimalPlacesLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Currency.form.decimalPlacesPlaceholder")}
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
      name="exchangeRate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Currency.form.exchangeRateLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Currency.form.exchangeRatePlaceholder")}
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
      name="isBaseCurrency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Currency.form.isBaseCurrencyLabel")}</FormLabel>
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
          <FormLabel>{t("Currency.form.isActiveLabel")}</FormLabel>
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
      name="lastUpdated"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Currency.form.lastUpdatedLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Currency.form.lastUpdatedPlaceholder")}
            required={false}
          />
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
                {t("currency.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
