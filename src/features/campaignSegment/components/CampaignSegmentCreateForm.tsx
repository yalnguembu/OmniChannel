import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCampaignSegmentRequest } from "@/shared/api"
import { zCreateCampaignSegmentRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getCampaignOptionsQuery } from "@/features/campaignsegment/hooks/useCampaignSegmentOptions"
import { getSegmentOptionsQuery } from "@/features/campaignsegment/hooks/useCampaignSegmentOptions"

interface CampaignSegmentCreateFormProps {
  onSubmit: (data: CreateCampaignSegmentRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateCampaignSegmentRequest>
  
  style?: string
}

export const CampaignSegmentCreateForm: React.FC<CampaignSegmentCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateCampaignSegmentRequest>({
    resolver: zodResolver(zCreateCampaignSegmentRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const { data: campaignDropdownData, isLoading: isCampaignLoading } = getCampaignOptionsQuery()
        const campaignOptions = campaignDropdownData && campaignDropdownData.data ? campaignDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: segmentDropdownData, isLoading: isSegmentLoading } = getSegmentOptionsQuery()
        const segmentOptions = segmentDropdownData && segmentDropdownData.data ? segmentDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateCampaignSegmentRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("campaignSegment.form.create.title")}</CardTitle>
        <CardDescription>{t("campaignSegment.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
      control={form.control}
      name="campaignId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("CampaignSegment.form.campaignIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isCampaignLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? campaignOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("CampaignSegment.form.campaignIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("CampaignSegment.form.campaignIdPlaceholder")} />
                  <CommandEmpty>t("CampaignSegment.form.campaignIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {campaignOptions.map((option) => (
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
            <FormLabel>{t("CampaignSegment.form.segmentIdLabel")}</FormLabel>
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
                        )?.label || t("CampaignSegment.form.segmentIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("CampaignSegment.form.segmentIdPlaceholder")} />
                  <CommandEmpty>t("CampaignSegment.form.segmentIdOptionsNotFound") .</CommandEmpty>
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
                {t("campaignSegment.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
