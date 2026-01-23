import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateNotificationRequest } from "@/shared/api"
import { zCreateNotificationRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getUserOptionsQuery } from "@/features/notification/hooks/useNotificationOptions"

interface NotificationCreateFormProps {
  onSubmit: (data: CreateNotificationRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateNotificationRequest>
  
}

export const NotificationCreateForm: React.FC<NotificationCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateNotificationRequest>({
    resolver: zodResolver(zCreateNotificationRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const { data: userDropdownData, isLoading: isUserLoading } = getUserOptionsQuery()
        const userOptions = userDropdownData && userDropdownData.data ? userDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateNotificationRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("notification.form.create.title")}</CardTitle>
        <CardDescription>{t("notification.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="userId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Notification.form.userIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isUserLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? userOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("Notification.form.userIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Notification.form.userIdPlaceholder")} />
                  <CommandEmpty>t("Notification.form.userIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {userOptions.map((option) => (
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
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.typeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Notification.form.typePlaceholder")}
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
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.titleLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Notification.form.titlePlaceholder")}
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
      name="message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.messageLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Notification.form.messagePlaceholder")}
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
      name="alertType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.alertTypeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Notification.form.alertTypePlaceholder")}
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
      name="isRead"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.isReadLabel")}</FormLabel>
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
      name="readAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.readAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Notification.form.readAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="actionUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.actionUrlLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Notification.form.actionUrlPlaceholder")}
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
      name="actionLabel"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Notification.form.actionLabelLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Notification.form.actionLabelPlaceholder")}
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
                {t("notification.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
