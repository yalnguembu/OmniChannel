import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCountryRequest } from "@/shared/api"
import { zCreateCountryRequest } from "@/shared/api/zod.gen"



interface CountryCreateFormProps {
  onSubmit: (data: CreateCountryRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateCountryRequest>
  
  style?: string
}

export const CountryCreateForm: React.FC<CountryCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateCountryRequest>({
    resolver: zodResolver(zCreateCountryRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  

  const handleSubmit = (values: CreateCountryRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("country.form.create.title")}</CardTitle>
        <CardDescription>{t("country.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Country.form.codeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Country.form.codePlaceholder")}
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
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Country.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Country.form.namePlaceholder")}
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
          <FormLabel>{t("Country.form.isActiveLabel")}</FormLabel>
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
                {t("country.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
