import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { LoaderIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { CreateClientImportRequest } from "@/shared/api"
import { zCreateClientImportRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getProductOptionsQuery } from "@/features/clientimport/hooks/useClientImportOptions"

interface ClientImportCreateFormProps {
  onSubmit: (data: CreateClientImportRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateClientImportRequest>
  
}

export const ClientImportCreateForm: React.FC<ClientImportCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<CreateClientImportRequest>({
    resolver: zodResolver(zCreateClientImportRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const steps = [
    {
      title: t("Step 1"),
      fields: ["productId", "fileName", "fileSize", "fileUrl", "status", "totalRows"],
      content: (
        <>
          {/* Field: productId */}
          {/* Field: fileName */}
          {/* Field: fileSize */}
          {/* Field: fileUrl */}
          {/* Field: status */}
          {/* Field: totalRows */}
        </>
      )
    },
    {
      title: t("Step 2"),
      fields: ["successfulRows", "failedRows", "duplicateRows", "mappingConfiguration", "errorLog", "startedAt"],
      content: (
        <>
          {/* Field: successfulRows */}
          {/* Field: failedRows */}
          {/* Field: duplicateRows */}
          {/* Field: mappingConfiguration */}
          {/* Field: errorLog */}
          {/* Field: startedAt */}
        </>
      )
    },
    {
      title: t("Step 3"),
      fields: ["completedAt"],
      content: (
        <>
          {/* Field: completedAt */}
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

  const { data: productDropdownData, isLoading: isProductLoading } = getProductOptionsQuery()
        const productOptions = productDropdownData && productDropdownData.data ? productDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateClientImportRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("clientImport.form.create.title")}</CardTitle>
        <CardDescription>{t("clientImport.form.create.description")}</CardDescription>
        
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
                    {t("clientImport.form.create.submit")}
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
