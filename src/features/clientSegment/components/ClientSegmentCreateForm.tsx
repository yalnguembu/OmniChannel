import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateClientSegmentRequest } from "@/shared/api"
import { zCreateClientSegmentRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getProductOptionsQuery } from "@/features/clientsegment/hooks/useClientSegmentOptions"

interface ClientSegmentCreateFormProps {
  onSubmit: (data: CreateClientSegmentRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateClientSegmentRequest>
  
  style?: string
}

export const ClientSegmentCreateForm: React.FC<ClientSegmentCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateClientSegmentRequest>({
    resolver: zodResolver(zCreateClientSegmentRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const { data: productDropdownData, isLoading: isProductLoading } = getProductOptionsQuery()
        const productOptions = productDropdownData && productDropdownData.data ? productDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateClientSegmentRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("clientSegment.form.create.title")}</CardTitle>
        <CardDescription>{t("clientSegment.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
      control={form.control}
      name="productId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("ClientSegment.form.productIdLabel")}</FormLabel>
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
                        )?.label || t("ClientSegment.form.productIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("ClientSegment.form.productIdPlaceholder")} />
                  <CommandEmpty>t("ClientSegment.form.productIdOptionsNotFound") .</CommandEmpty>
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
          <FormLabel>{t("ClientSegment.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ClientSegment.form.namePlaceholder")}
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
          <FormLabel>{t("ClientSegment.form.descriptionLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ClientSegment.form.descriptionPlaceholder")}
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
      name="criteria"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientSegment.form.criteriaLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("ClientSegment.form.criteriaPlaceholder")}
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
      name="isDynamic"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientSegment.form.isDynamicLabel")}</FormLabel>
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
      name="lastCalculatedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientSegment.form.lastCalculatedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("ClientSegment.form.lastCalculatedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="clientCount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("ClientSegment.form.clientCountLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("ClientSegment.form.clientCountPlaceholder")}
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
                {t("clientSegment.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
