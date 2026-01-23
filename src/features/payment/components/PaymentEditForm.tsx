import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditPaymentRequest } from "@/shared/api"
import { zEditPaymentRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getCompanyOptionsQuery } from "@/features/payment/hooks/usePaymentOptions"
import { getInvoiceOptionsQuery } from "@/features/payment/hooks/usePaymentOptions"
import { getPaymentMethodOptionsQuery } from "@/features/payment/hooks/usePaymentOptions"
import { getExternalTransactionOptionsQuery } from "@/features/payment/hooks/usePaymentOptions"
import { getFinalTransactionOptionsQuery } from "@/features/payment/hooks/usePaymentOptions"

interface PaymentEditFormProps {
  onSubmit: (data: EditPaymentRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditPaymentRequest>
  initialData?: Partial<EditPaymentRequest>
}

export const PaymentEditForm: React.FC<PaymentEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditPaymentRequest>({
    resolver: zodResolver(zEditPaymentRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: companyDropdownData, isLoading: isCompanyLoading } = getCompanyOptionsQuery()
        const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: invoiceDropdownData, isLoading: isInvoiceLoading } = getInvoiceOptionsQuery()
        const invoiceOptions = invoiceDropdownData && invoiceDropdownData.data ? invoiceDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: paymentmethodDropdownData, isLoading: isPaymentMethodLoading } = getPaymentMethodOptionsQuery()
        const paymentmethodOptions = paymentmethodDropdownData && paymentmethodDropdownData.data ? paymentmethodDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: externaltransactionDropdownData, isLoading: isExternalTransactionLoading } = getExternalTransactionOptionsQuery()
        const externaltransactionOptions = externaltransactionDropdownData && externaltransactionDropdownData.data ? externaltransactionDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: finaltransactionDropdownData, isLoading: isFinalTransactionLoading } = getFinalTransactionOptionsQuery()
        const finaltransactionOptions = finaltransactionDropdownData && finaltransactionDropdownData.data ? finaltransactionDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditPaymentRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("payment.form.edit.title")}</CardTitle>
        <CardDescription>{t("payment.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="companyId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Payment.form.companyIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isCompanyLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? companyOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Payment.form.companyIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Payment.form.companyIdPlaceholder")} />
                  <CommandEmpty>t("Payment.form.companyIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {companyOptions.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />

<FormField
      control={form.control}
      name="invoiceId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Payment.form.invoiceIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isInvoiceLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? invoiceOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Payment.form.invoiceIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Payment.form.invoiceIdPlaceholder")} />
                  <CommandEmpty>t("Payment.form.invoiceIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {invoiceOptions.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />

<FormField
      control={form.control}
      name="paymentMethodId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Payment.form.paymentMethodIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isPaymentMethodLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? paymentmethodOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Payment.form.paymentMethodIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Payment.form.paymentMethodIdPlaceholder")} />
                  <CommandEmpty>t("Payment.form.paymentMethodIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {paymentmethodOptions.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />

<FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.amountLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Payment.form.amountPlaceholder")}
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
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.currencyLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Payment.form.currencyPlaceholder")}
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
      name="method"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.methodLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Payment.form.methodPlaceholder")}
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
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Payment.form.statusPlaceholder")}
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
      name="externalTransactionId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Payment.form.externalTransactionIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isExternalTransactionLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? externaltransactionOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Payment.form.externalTransactionIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Payment.form.externalTransactionIdPlaceholder")} />
                  <CommandEmpty>t("Payment.form.externalTransactionIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {externaltransactionOptions.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />

<FormField
      control={form.control}
      name="finalTransactionId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Payment.form.finalTransactionIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isFinalTransactionLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? finaltransactionOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Payment.form.finalTransactionIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Payment.form.finalTransactionIdPlaceholder")} />
                  <CommandEmpty>t("Payment.form.finalTransactionIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {finaltransactionOptions.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />

<FormField
      control={form.control}
      name="metadata"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.metadataLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Payment.form.metadataPlaceholder")}
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
      name="processedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.processedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Payment.form.processedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="failureReason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Payment.form.failureReasonLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Payment.form.failureReasonPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
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
                {t("payment.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
