import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditProviderCallbackRequest } from "@/shared/api"
import { zEditProviderCallbackRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getProviderOptionsQuery } from "@/features/providercallback/hooks/useProviderCallbackOptions"
import { getMessageOptionsQuery } from "@/features/providercallback/hooks/useProviderCallbackOptions"
import { getExternalMessageOptionsQuery } from "@/features/providercallback/hooks/useProviderCallbackOptions"

interface ProviderCallbackEditFormProps {
  onSubmit: (data: EditProviderCallbackRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditProviderCallbackRequest>
  initialData?: Partial<EditProviderCallbackRequest>
  style?: string
}

export const ProviderCallbackEditForm: React.FC<ProviderCallbackEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<EditProviderCallbackRequest>({
    resolver: zodResolver(zEditProviderCallbackRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: providerDropdownData, isLoading: isProviderLoading } = getProviderOptionsQuery()
        const providerOptions = providerDropdownData && providerDropdownData.data ? providerDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: messageDropdownData, isLoading: isMessageLoading } = getMessageOptionsQuery()
        const messageOptions = messageDropdownData && messageDropdownData.data ? messageDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: externalmessageDropdownData, isLoading: isExternalMessageLoading } = getExternalMessageOptionsQuery()
        const externalmessageOptions = externalmessageDropdownData && externalmessageDropdownData.data ? externalmessageDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditProviderCallbackRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("providerCallback.form.edit.title")}</CardTitle>
        <CardDescription>{t("providerCallback.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
      control={form.control}
      name="providerId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ProviderCallback.form.providerIdLabel")}</FormLabel>
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
                        )?.label || t("ProviderCallback.form.providerIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ProviderCallback.form.providerIdPlaceholder")} />
                  <CommandEmpty>t("ProviderCallback.form.providerIdOptionsNotFound") .</CommandEmpty>
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
      name="messageId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ProviderCallback.form.messageIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isMessageLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? messageOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("ProviderCallback.form.messageIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ProviderCallback.form.messageIdPlaceholder")} />
                  <CommandEmpty>t("ProviderCallback.form.messageIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {messageOptions.map((option) => (
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
      name="externalMessageId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ProviderCallback.form.externalMessageIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isExternalMessageLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? externalmessageOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("ProviderCallback.form.externalMessageIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ProviderCallback.form.externalMessageIdPlaceholder")} />
                  <CommandEmpty>t("ProviderCallback.form.externalMessageIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {externalmessageOptions.map((option) => (
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
      name="rawPayload"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ProviderCallback.form.rawPayloadLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ProviderCallback.form.rawPayloadPlaceholder")}
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
          <FormLabel>{t("ProviderCallback.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ProviderCallback.form.statusPlaceholder")}
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
          <FormLabel>{t("ProviderCallback.form.processedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("ProviderCallback.form.processedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="errorMessage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ProviderCallback.form.errorMessageLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ProviderCallback.form.errorMessagePlaceholder")}
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
                {t("providerCallback.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
