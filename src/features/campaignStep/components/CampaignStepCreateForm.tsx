import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateCampaignStepRequest } from "@/shared/api"
import { zCreateCampaignStepRequest } from "@/shared/api/zod.gen"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getCampaignOptionsQuery } from "@/features/campaignstep/hooks/useCampaignStepOptions"
import { getTemplateOptionsQuery } from "@/features/campaignstep/hooks/useCampaignStepOptions"
import { getChannelOptionsQuery } from "@/features/campaignstep/hooks/useCampaignStepOptions"

interface CampaignStepCreateFormProps {
  onSubmit: (data: CreateCampaignStepRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateCampaignStepRequest>
  
  style?: string
}

export const CampaignStepCreateForm: React.FC<CampaignStepCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
  style 
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateCampaignStepRequest>({
    resolver: zodResolver(zCreateCampaignStepRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  const { data: campaignDropdownData, isLoading: isCampaignLoading } = getCampaignOptionsQuery()
        const campaignOptions = campaignDropdownData && campaignDropdownData.data ? campaignDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: templateDropdownData, isLoading: isTemplateLoading } = getTemplateOptionsQuery()
        const templateOptions = templateDropdownData && templateDropdownData.data ? templateDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []
const { data: channelDropdownData, isLoading: isChannelLoading } = getChannelOptionsQuery()
        const channelOptions = channelDropdownData && channelDropdownData.data ? channelDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const handleSubmit = (values: CreateCampaignStepRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${style}`}>
      <CardHeader>
        <CardTitle>{t("campaignStep.form.create.title")}</CardTitle>
        <CardDescription>{t("campaignStep.form.create.description")}</CardDescription>
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
            <FormLabel>{t("CampaignStep.form.campaignIdLabel")}</FormLabel>
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
                        )?.label || t("CampaignStep.form.campaignIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("CampaignStep.form.campaignIdPlaceholder")} />
                  <CommandEmpty>t("CampaignStep.form.campaignIdOptionsNotFound") .</CommandEmpty>
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
      name="templateId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("CampaignStep.form.templateIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isTemplateLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? templateOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("CampaignStep.form.templateIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("CampaignStep.form.templateIdPlaceholder")} />
                  <CommandEmpty>t("CampaignStep.form.templateIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {templateOptions.map((option) => (
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
      name="channelId"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{t("CampaignStep.form.channelIdLabel")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isChannelLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? channelOptions.find(
                          (option) => option.value === field.value
                        )?.label || t("CampaignStep.form.channelIdPlaceholder")
                      : ""}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("CampaignStep.form.channelIdPlaceholder")} />
                  <CommandEmpty>t("CampaignStep.form.channelIdOptionsNotFound") .</CommandEmpty>
                  <CommandGroup>
                    {channelOptions.map((option) => (
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
      name="stepOrder"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CampaignStep.form.stepOrderLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("CampaignStep.form.stepOrderPlaceholder")}
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
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CampaignStep.form.nameLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CampaignStep.form.namePlaceholder")}
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
      name="delayInMinutes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CampaignStep.form.delayInMinutesLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("CampaignStep.form.delayInMinutesPlaceholder")}
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
      name="conditions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("CampaignStep.form.conditionsLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("CampaignStep.form.conditionsPlaceholder")}
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
                {t("campaignStep.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
