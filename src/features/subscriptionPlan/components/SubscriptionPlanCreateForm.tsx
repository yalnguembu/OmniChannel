import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateSubscriptionPlanRequest } from "@/shared/api"
import { zCreateSubscriptionPlanRequest } from "@/shared/api/zod.gen"



interface SubscriptionPlanCreateFormProps {
  onSubmit: (data: CreateSubscriptionPlanRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateSubscriptionPlanRequest>
  
}

export const SubscriptionPlanCreateForm: React.FC<SubscriptionPlanCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateSubscriptionPlanRequest>({
    resolver: zodResolver(zCreateSubscriptionPlanRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  

  const handleSubmit = (values: CreateSubscriptionPlanRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("subscriptionPlan.form.create.title")}</CardTitle>
        <CardDescription>{t("subscriptionPlan.form.create.description")}</CardDescription>
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
          <FormLabel>{t("SubscriptionPlan.form.codeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("SubscriptionPlan.form.codePlaceholder")}
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
          <FormLabel>{t("SubscriptionPlan.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("SubscriptionPlan.form.namePlaceholder")}
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
          <FormLabel>{t("SubscriptionPlan.form.descriptionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("SubscriptionPlan.form.descriptionPlaceholder")}
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
      name="monthlyPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SubscriptionPlan.form.monthlyPriceLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("SubscriptionPlan.form.monthlyPricePlaceholder")}
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
      name="yearlyPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SubscriptionPlan.form.yearlyPriceLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("SubscriptionPlan.form.yearlyPricePlaceholder")}
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
      name="monthlyQuota"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SubscriptionPlan.form.monthlyQuotaLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("SubscriptionPlan.form.monthlyQuotaPlaceholder")}
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
      name="maxProducts"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SubscriptionPlan.form.maxProductsLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("SubscriptionPlan.form.maxProductsPlaceholder")}
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
      name="maxUsers"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SubscriptionPlan.form.maxUsersLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("SubscriptionPlan.form.maxUsersPlaceholder")}
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
      name="features"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SubscriptionPlan.form.featuresLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("SubscriptionPlan.form.featuresPlaceholder")}
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
          <FormLabel>{t("SubscriptionPlan.form.isActiveLabel")}</FormLabel>
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
                {t("subscriptionPlan.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
