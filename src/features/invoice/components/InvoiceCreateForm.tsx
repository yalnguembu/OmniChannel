import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateInvoiceRequest } from "@/shared/api"
import { zCreateInvoiceRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getCompanyOptionsQuery } from "@/features/invoice/hooks/useInvoiceOptions"

interface InvoiceCreateFormProps {
  onSubmit: (data: CreateInvoiceRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateInvoiceRequest>
  
}

export const InvoiceCreateForm: React.FC<InvoiceCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateInvoiceRequest>({
    resolver: zodResolver(zCreateInvoiceRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const { data: companyDropdownData, isLoading: isCompanyLoading } = getCompanyOptionsQuery()
        const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateInvoiceRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("invoice.form.create.title")}</CardTitle>
        <CardDescription>{t("invoice.form.create.description")}</CardDescription>
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
            <FormLabel>{t("Invoice.form.companyIdLabel")}</FormLabel>
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
                        )?.label || t("Invoice.form.companyIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Invoice.form.companyIdPlaceholder")} />
                  <CommandEmpty>t("Invoice.form.companyIdOptionsNotFound") .</CommandEmpty>
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
      name="invoiceNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.invoiceNumberLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Invoice.form.invoiceNumberPlaceholder")}
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
      name="billingPeriodStart"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.billingPeriodStartLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Invoice.form.billingPeriodStartPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="billingPeriodEnd"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.billingPeriodEndLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Invoice.form.billingPeriodEndPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="subTotal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.subTotalLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Invoice.form.subTotalPlaceholder")}
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
      name="taxAmount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.taxAmountLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Invoice.form.taxAmountPlaceholder")}
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
      name="taxRate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.taxRateLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Invoice.form.taxRatePlaceholder")}
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
      name="total"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.totalLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Invoice.form.totalPlaceholder")}
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
          <FormLabel>{t("Invoice.form.currencyLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Invoice.form.currencyPlaceholder")}
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
          <FormLabel>{t("Invoice.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Invoice.form.statusPlaceholder")}
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
      name="dueDate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.dueDateLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Invoice.form.dueDatePlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="paidAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Invoice.form.paidAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Invoice.form.paidAtPlaceholder")}
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
                {t("invoice.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
