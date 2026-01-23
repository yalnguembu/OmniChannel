import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateConnectorRequest } from "@/shared/api"
import { zCreateConnectorRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getProviderOptionsQuery } from "@/features/connector/hooks/useConnectorOptions"
import { getProductOptionsQuery } from "@/features/connector/hooks/useConnectorOptions"
import { getCompanyOptionsQuery } from "@/features/connector/hooks/useConnectorOptions"

interface ConnectorCreateFormProps {
  onSubmit: (data: CreateConnectorRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateConnectorRequest>
  
}

export const ConnectorCreateForm: React.FC<ConnectorCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateConnectorRequest>({
    resolver: zodResolver(zCreateConnectorRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const { data: providerDropdownData, isLoading: isProviderLoading } = getProviderOptionsQuery()
        const providerOptions = providerDropdownData && providerDropdownData.data ? providerDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: productDropdownData, isLoading: isProductLoading } = getProductOptionsQuery()
        const productOptions = productDropdownData && productDropdownData.data ? productDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: companyDropdownData, isLoading: isCompanyLoading } = getCompanyOptionsQuery()
        const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateConnectorRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("connector.form.create.title")}</CardTitle>
        <CardDescription>{t("connector.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="providerId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Connector.form.providerIdLabel")}</FormLabel>
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
                        )?.label || t("Connector.form.providerIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Connector.form.providerIdPlaceholder")} />
                  <CommandEmpty>t("Connector.form.providerIdOptionsNotFound") .</CommandEmpty>
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
      name="productId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Connector.form.productIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isProductLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? productOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Connector.form.productIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Connector.form.productIdPlaceholder")} />
                  <CommandEmpty>t("Connector.form.productIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {productOptions.map((option) => (
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
            <FormLabel>{t("Connector.form.companyIdLabel")}</FormLabel>
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
                        )?.label || t("Connector.form.companyIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Connector.form.companyIdPlaceholder")} />
                  <CommandEmpty>t("Connector.form.companyIdOptionsNotFound") .</CommandEmpty>
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
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Connector.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Connector.form.namePlaceholder")}
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
          <FormLabel>{t("Connector.form.isActiveLabel")}</FormLabel>
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
      name="isDefault"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Connector.form.isDefaultLabel")}</FormLabel>
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
      name="configuration"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Connector.form.configurationLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Connector.form.configurationPlaceholder")}
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
      name="priority"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Connector.form.priorityLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Connector.form.priorityPlaceholder")}
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
      name="lastTestAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Connector.form.lastTestAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Connector.form.lastTestAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="lastTestStatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Connector.form.lastTestStatusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Connector.form.lastTestStatusPlaceholder")}
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
                {t("connector.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
