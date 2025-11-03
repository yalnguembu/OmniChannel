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
import { z } from "zod"

type UpdateWithdrawalMethodRequest = {
  id?: string
  companyId?: string
  name: string
  phoneNumber?: string
  paymentMethodId: string
  verificationReference?: string | null
  isDefault?: boolean
  isVerified?: boolean
  dailyLimit?: string | null
  monthlyLimit?: string | null
  singleWithdrawalLimit?: string | null
}

interface WithdrawalMethodEditFormProps {
  withdrawalMethodId: string
  initialData: UpdateWithdrawalMethodRequest
  onSubmit: (data: UpdateWithdrawalMethodRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const WithdrawalMethodEditForm: React.FC<WithdrawalMethodEditFormProps> = ({ withdrawalMethodId, initialData, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation()

  const zUpdateWithdrawalMethodRequest = z.object({
    companyId: z.string().uuid().optional(),
    name: z.string(),
    phoneNumber: z.string().optional(),
    paymentMethodId: z.string().uuid(),
    isVerified: z.boolean().optional(),
    verificationReference: z.union([z.string(), z.null()]).optional(),
    isDefault: z.boolean().optional(),
    dailyLimit: z.union([z.string(), z.null()]).optional(),
    monthlyLimit: z.union([z.string(), z.null()]).optional(),
    singleWithdrawalLimit: z.union([z.string(), z.null()]).optional(),
  })

  const form = useForm<UpdateWithdrawalMethodRequest>({
    resolver: zodResolver(zUpdateWithdrawalMethodRequest),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateWithdrawalMethodRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: withdrawalMethodId })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("withdrawalMethods.form.edit.title")}</CardTitle>
        <CardDescription>{t("withdrawalMethods.form.edit.description")}</CardDescription>
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
                      <Input type="text" placeholder={t("withdrawalMethods.form.companyIdPlaceholder")} {...field} value={field.value || ""} required={false} />
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
                      <Input type="text" placeholder={t("withdrawalMethods.form.paymentMethodIdPlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("withdrawalMethods.form.isVerifiedLabel")}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
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
                    <FormLabel>{t("withdrawalMethods.form.verificationReferenceLabel")}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t("withdrawalMethods.form.verificationReferencePlaceholder")} {...field} value={field.value || ""} required={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("withdrawalMethods.form.isDefaultLabel")}</FormLabel>
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
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("withdrawalMethod.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
