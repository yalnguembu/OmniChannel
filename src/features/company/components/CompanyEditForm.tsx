import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { LoaderIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { EditCompanyRequest } from "@/shared/api"
import { zEditCompanyRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getCountryOptionsQuery } from "@/features/company/hooks/useCompanyOptions"

interface CompanyEditFormProps {
  onSubmit: (data: EditCompanyRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<EditCompanyRequest>
  initialData?: Partial<EditCompanyRequest>
}

export const CompanyEditForm: React.FC<CompanyEditFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  initialData,
}) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<EditCompanyRequest>({
    resolver: zodResolver(zEditCompanyRequest),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  const steps = [
    {
      title: t("Step 1"),
      fields: ["name", "legalName", "taxNumber", "countryId", "status", "email"],
      content: (
        <>
          {/* Field: name */}
          {/* Field: legalName */}
          {/* Field: taxNumber */}
          {/* Field: countryId */}
          {/* Field: status */}
          {/* Field: email */}
        </>
      )
    },
    {
      title: t("Step 2"),
      fields: ["phone", "website", "address", "city", "postalCode", "country"],
      content: (
        <>
          {/* Field: phone */}
          {/* Field: website */}
          {/* Field: address */}
          {/* Field: city */}
          {/* Field: postalCode */}
          {/* Field: country */}
        </>
      )
    },
    {
      title: t("Step 3"),
      fields: ["billingMode", "timezone", "defaultLanguage", "isSandbox"],
      content: (
        <>
          {/* Field: billingMode */}
          {/* Field: timezone */}
          {/* Field: defaultLanguage */}
          {/* Field: isSandbox */}
        </>
      )
    }
  ]

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields
    const isValid = await form.trigger(fieldsToValidate as any)
    
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const { data: countryDropdownData, isLoading: isCountryLoading } = getCountryOptionsQuery()
        const countryOptions = countryDropdownData && countryDropdownData.data ? countryDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: EditCompanyRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("company.form.edit.title")}</CardTitle>
        <CardDescription>{t("company.form.edit.description")}</CardDescription>
        
        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{steps[currentStep].title}</span>
            <span>
              {t("common.step")} {currentStep + 1} {t("common.of")} {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps[currentStep].content}
            </div>

            {form.formState.errors.root && (
              <div className="bg-destructive/15 text-destructive text-sm font-medium p-3 rounded-md animate-in fade-in slide-in-from-top-1">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <div>
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={isLoading}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t("common.previous")}
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                  {t("common.cancel")}
                </Button>
                
                {currentStep < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNext} disabled={isLoading}>
                    {t("common.next")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    {t("company.form.edit.submit")}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
