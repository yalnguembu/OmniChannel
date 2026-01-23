import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditIntegrationSyncLogRequest } from "@/shared/api"
import { zEditIntegrationSyncLogRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getIntegrationOptionsQuery } from "@/features/integrationsynclog/hooks/useIntegrationSyncLogOptions"

interface IntegrationSyncLogEditFormProps {
  onSubmit: (data: EditIntegrationSyncLogRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditIntegrationSyncLogRequest>
  initialData?: Partial<EditIntegrationSyncLogRequest>
}

export const IntegrationSyncLogEditForm: React.FC<IntegrationSyncLogEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditIntegrationSyncLogRequest>({
    resolver: zodResolver(zEditIntegrationSyncLogRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: integrationDropdownData, isLoading: isIntegrationLoading } = getIntegrationOptionsQuery()
        const integrationOptions = integrationDropdownData && integrationDropdownData.data ? integrationDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditIntegrationSyncLogRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("integrationSyncLog.form.edit.title")}</CardTitle>
        <CardDescription>{t("integrationSyncLog.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="integrationId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("IntegrationSyncLog.form.integrationIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isIntegrationLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? integrationOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("IntegrationSyncLog.form.integrationIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("IntegrationSyncLog.form.integrationIdPlaceholder")} />
                  <CommandEmpty>t("IntegrationSyncLog.form.integrationIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {integrationOptions.map((option) => (
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
      name="syncType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.syncTypeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("IntegrationSyncLog.form.syncTypePlaceholder")}
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
          <FormLabel>{t("IntegrationSyncLog.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("IntegrationSyncLog.form.statusPlaceholder")}
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
      name="recordsProcessed"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.recordsProcessedLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("IntegrationSyncLog.form.recordsProcessedPlaceholder")}
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
      name="recordsSucceeded"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.recordsSucceededLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("IntegrationSyncLog.form.recordsSucceededPlaceholder")}
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
      name="recordsFailed"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.recordsFailedLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("IntegrationSyncLog.form.recordsFailedPlaceholder")}
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
      name="errorLog"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.errorLogLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("IntegrationSyncLog.form.errorLogPlaceholder")}
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
      name="startedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.startedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("IntegrationSyncLog.form.startedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="completedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("IntegrationSyncLog.form.completedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("IntegrationSyncLog.form.completedAtPlaceholder")}
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
                {t("integrationSyncLog.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
