import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditPricingRequest } from "@/shared/api"
import { zEditPricingRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getChannelOptionsQuery } from "@/features/pricing/hooks/usePricingOptions"
import { getProviderOptionsQuery } from "@/features/pricing/hooks/usePricingOptions"
import { getCompanyOptionsQuery } from "@/features/pricing/hooks/usePricingOptions"

interface PricingEditFormProps {
  onSubmit: (data: EditPricingRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditPricingRequest>
  initialData?: Partial<EditPricingRequest>
}

export const PricingEditForm: React.FC<PricingEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditPricingRequest>({
    resolver: zodResolver(zEditPricingRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: channelDropdownData, isLoading: isChannelLoading } = getChannelOptionsQuery()
        const channelOptions = channelDropdownData && channelDropdownData.data ? channelDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: providerDropdownData, isLoading: isProviderLoading } = getProviderOptionsQuery()
        const providerOptions = providerDropdownData && providerDropdownData.data ? providerDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: companyDropdownData, isLoading: isCompanyLoading } = getCompanyOptionsQuery()
        const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditPricingRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("pricing.form.edit.title")}</CardTitle>
        <CardDescription>{t("pricing.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="channelId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Pricing.form.channelIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isChannelLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? channelOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Pricing.form.channelIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Pricing.form.channelIdPlaceholder")} />
                  <CommandEmpty>t("Pricing.form.channelIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {channelOptions.map((option) => (
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
      name="providerId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Pricing.form.providerIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isProviderLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? providerOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Pricing.form.providerIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Pricing.form.providerIdPlaceholder")} />
                  <CommandEmpty>t("Pricing.form.providerIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {providerOptions.map((option) => (
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
      name="companyId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Pricing.form.companyIdLabel")}</FormLabel>
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
                        )?.label || t("Pricing.form.companyIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Pricing.form.companyIdPlaceholder")} />
                  <CommandEmpty>t("Pricing.form.companyIdOptionsNotFound") .</CommandEmpty>
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
      name="unitPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Pricing.form.unitPriceLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Pricing.form.unitPricePlaceholder")}
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
          <FormLabel>{t("Pricing.form.currencyLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Pricing.form.currencyPlaceholder")}
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
      name="platformFee"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Pricing.form.platformFeeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Pricing.form.platformFeePlaceholder")}
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
      name="platformFeeType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Pricing.form.platformFeeTypeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Pricing.form.platformFeeTypePlaceholder")}
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
      name="effectiveFrom"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Pricing.form.effectiveFromLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Pricing.form.effectiveFromPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="effectiveTo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Pricing.form.effectiveToLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Pricing.form.effectiveToPlaceholder")}
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
                {t("pricing.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
