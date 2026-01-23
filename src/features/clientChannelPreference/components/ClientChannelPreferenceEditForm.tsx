import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditClientChannelPreferenceRequest } from "@/shared/api"
import { zEditClientChannelPreferenceRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getClientOptionsQuery } from "@/features/clientchannelpreference/hooks/useClientChannelPreferenceOptions"
import { getChannelOptionsQuery } from "@/features/clientchannelpreference/hooks/useClientChannelPreferenceOptions"

interface ClientChannelPreferenceEditFormProps {
  onSubmit: (data: EditClientChannelPreferenceRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditClientChannelPreferenceRequest>
  initialData?: Partial<EditClientChannelPreferenceRequest>
  style?: string
}

export const ClientChannelPreferenceEditForm: React.FC<ClientChannelPreferenceEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<EditClientChannelPreferenceRequest>({
    resolver: zodResolver(zEditClientChannelPreferenceRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: clientDropdownData, isLoading: isClientLoading } = getClientOptionsQuery()
        const clientOptions = clientDropdownData && clientDropdownData.data ? clientDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: channelDropdownData, isLoading: isChannelLoading } = getChannelOptionsQuery()
        const channelOptions = channelDropdownData && channelDropdownData.data ? channelDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditClientChannelPreferenceRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("clientChannelPreference.form.edit.title")}</CardTitle>
        <CardDescription>{t("clientChannelPreference.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
      control={form.control}
      name="clientId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ClientChannelPreference.form.clientIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isClientLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? clientOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("ClientChannelPreference.form.clientIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ClientChannelPreference.form.clientIdPlaceholder")} />
                  <CommandEmpty>t("ClientChannelPreference.form.clientIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {clientOptions.map((option) => (
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
      name="channelId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ClientChannelPreference.form.channelIdLabel")}</FormLabel>
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
                        )?.label || t("ClientChannelPreference.form.channelIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ClientChannelPreference.form.channelIdPlaceholder")} />
                  <CommandEmpty>t("ClientChannelPreference.form.channelIdOptionsNotFound") .</CommandEmpty>
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
      name="isOptedIn"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientChannelPreference.form.isOptedInLabel")}</FormLabel>
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
      name="optedInAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientChannelPreference.form.optedInAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("ClientChannelPreference.form.optedInAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="optedOutAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientChannelPreference.form.optedOutAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("ClientChannelPreference.form.optedOutAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="optOutReason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientChannelPreference.form.optOutReasonLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ClientChannelPreference.form.optOutReasonPlaceholder")}
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
                {t("clientChannelPreference.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
