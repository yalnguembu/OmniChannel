import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { EditTemplateRequest } from "@/shared/api"
import { zEditTemplateRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getProductOptionsQuery } from "@/features/template/hooks/useTemplateOptions"

interface TemplateEditFormProps {
  onSubmit: (data: EditTemplateRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditTemplateRequest>
  initialData?: Partial<EditTemplateRequest>
}

export const TemplateEditForm: React.FC<TemplateEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()

  const form = useForm<EditTemplateRequest>({
    resolver: zodResolver(zEditTemplateRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const { data: productDropdownData, isLoading: isProductLoading } = getProductOptionsQuery()
        const productOptions = productDropdownData && productDropdownData.data ? productDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditTemplateRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("template.form.edit.title")}</CardTitle>
        <CardDescription>{t("template.form.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="productId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("Template.form.productIdLabel")}</FormLabel>
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
                        )?.label || t("Template.form.productIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("Template.form.productIdPlaceholder")} />
                  <CommandEmpty>t("Template.form.productIdOptionsNotFound") .</CommandEmpty>
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
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.namePlaceholder")}
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
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.descriptionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.descriptionPlaceholder")}
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
          <FormLabel>{t("Template.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.statusPlaceholder")}
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
      name="subject"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.subjectLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.subjectPlaceholder")}
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
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.contentLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.contentPlaceholder")}
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
      name="language"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.languageLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.languagePlaceholder")}
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
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.categoryLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Template.form.categoryPlaceholder")}
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
      name="version"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Template.form.versionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Template.form.versionPlaceholder")}
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
                {t("template.form.edit.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
