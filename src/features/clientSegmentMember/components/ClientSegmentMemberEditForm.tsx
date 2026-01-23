import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditClientSegmentMemberRequest } from "@/shared/api"
import { zEditClientSegmentMemberRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getClientOptionsQuery } from "@/features/clientsegmentmember/hooks/useClientSegmentMemberOptions"
import { getSegmentOptionsQuery } from "@/features/clientsegmentmember/hooks/useClientSegmentMemberOptions"

interface ClientSegmentMemberEditFormProps {
  onSubmit: (data: EditClientSegmentMemberRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditClientSegmentMemberRequest>
  initialData?: Partial<EditClientSegmentMemberRequest>
  style?: string
}

export const ClientSegmentMemberEditForm: React.FC<ClientSegmentMemberEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<EditClientSegmentMemberRequest>({
    resolver: zodResolver(zEditClientSegmentMemberRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: clientDropdownData, isLoading: isClientLoading } = getClientOptionsQuery()
        const clientOptions = clientDropdownData && clientDropdownData.data ? clientDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: segmentDropdownData, isLoading: isSegmentLoading } = getSegmentOptionsQuery()
        const segmentOptions = segmentDropdownData && segmentDropdownData.data ? segmentDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditClientSegmentMemberRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("clientSegmentMember.form.edit.title")}</CardTitle>
        <CardDescription>{t("clientSegmentMember.form.edit.description")}</CardDescription>
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
            <FormLabel>{t("ClientSegmentMember.form.clientIdLabel")}</FormLabel>
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
                        )?.label || t("ClientSegmentMember.form.clientIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ClientSegmentMember.form.clientIdPlaceholder")} />
                  <CommandEmpty>t("ClientSegmentMember.form.clientIdOptionsNotFound") .</CommandEmpty>
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
      name="segmentId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ClientSegmentMember.form.segmentIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isSegmentLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? segmentOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("ClientSegmentMember.form.segmentIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ClientSegmentMember.form.segmentIdPlaceholder")} />
                  <CommandEmpty>t("ClientSegmentMember.form.segmentIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {segmentOptions.map((option) => (
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
      name="addedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientSegmentMember.form.addedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("ClientSegmentMember.form.addedAtPlaceholder")}
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
                {t("clientSegmentMember.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
