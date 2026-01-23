import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditCompanyVerificationRequest } from "@/shared/api"
import { zEditCompanyVerificationRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getCompanyOptionsQuery } from "@/features/companyverification/hooks/useCompanyVerificationOptions"

interface CompanyVerificationEditFormProps {
  onSubmit: (data: EditCompanyVerificationRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditCompanyVerificationRequest>
  initialData?: Partial<EditCompanyVerificationRequest>
}

export const CompanyVerificationEditForm: React.FC<CompanyVerificationEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditCompanyVerificationRequest>({
    resolver: zodResolver(zEditCompanyVerificationRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: companyDropdownData, isLoading: isCompanyLoading } = getCompanyOptionsQuery()
        const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditCompanyVerificationRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("companyVerification.form.edit.title")}</CardTitle>
        <CardDescription>{t("companyVerification.form.edit.description")}</CardDescription>
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
            <FormLabel>{t("CompanyVerification.form.companyIdLabel")}</FormLabel>
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
                        )?.label || t("CompanyVerification.form.companyIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("CompanyVerification.form.companyIdPlaceholder")} />
                  <CommandEmpty>t("CompanyVerification.form.companyIdOptionsNotFound") .</CommandEmpty>
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
      name="verificationType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CompanyVerification.form.verificationTypeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CompanyVerification.form.verificationTypePlaceholder")}
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
      name="documentUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CompanyVerification.form.documentUrlLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CompanyVerification.form.documentUrlPlaceholder")}
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
          <FormLabel>{t("CompanyVerification.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CompanyVerification.form.statusPlaceholder")}
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
      name="verifiedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CompanyVerification.form.verifiedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("CompanyVerification.form.verifiedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="rejectionAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CompanyVerification.form.rejectionAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("CompanyVerification.form.rejectionAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="verifiedBy"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CompanyVerification.form.verifiedByLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CompanyVerification.form.verifiedByPlaceholder")}
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
      name="rejectionReason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CompanyVerification.form.rejectionReasonLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CompanyVerification.form.rejectionReasonPlaceholder")}
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
                {t("companyVerification.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
