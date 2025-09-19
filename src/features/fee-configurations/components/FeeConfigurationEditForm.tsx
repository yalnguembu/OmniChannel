import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CalendarIcon, LoaderIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { useApplication } from "@/features/companies/hooks/useApplication"
import { useFeeType } from "@/features/fee-types/hooks/useFeeType"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { useCurrency } from "@/features/currencies/hooks/useCurrency"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { cn } from "@/shared/lib/utils"
import { format } from "date-fns"

const enum OWNER_TYPE {
  SYSTEM = "SYSTEM",
  COMPANY = "COMPANY",
  APPLICATION = "APPLICATION",
}

import { UpdateFeeConfigurationRequest } from "@/shared/api"
import { zUpdateFeeConfigurationRequest } from "@/shared/api/zod.gen"

interface FeeConfigurationEditFormProps {
  feeConfigurationId: string
  initialData: UpdateFeeConfigurationRequest
  onSubmit: (data: UpdateFeeConfigurationRequest) => void
  onCancel: () => void
  isLoading?: boolean
  companyId?: string
  applicationId?: string
}

export const FeeConfigurationEditForm: React.FC<FeeConfigurationEditFormProps> = ({
  feeConfigurationId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  companyId,
  applicationId,
}) => {
  const { t } = useTranslation()

  const form = useForm<UpdateFeeConfigurationRequest>({
    resolver: zodResolver(zUpdateFeeConfigurationRequest),
    defaultValues: companyId
      ? { ...initialData, ownerType: OWNER_TYPE.COMPANY, ownerId: companyId }
      : applicationId
        ? { ...initialData, ownerType: OWNER_TYPE.APPLICATION, ownerId: applicationId }
        : {
            ...initialData,
          },
  })

  const [ownerType, setOwnerType] = useState<OWNER_TYPE>(OWNER_TYPE.SYSTEM)

  useEffect(() => {
    form.reset({ ...initialData })
  }, [initialData, form])

  const handleSubmit = (values: UpdateFeeConfigurationRequest) => {
    if (onSubmit) {
      onSubmit({ ...values, id: feeConfigurationId })
    }
  }
  const { dropdownQuery: companyDropdownQuery } = useCompany()
  const { data: companyDropdownData, isLoading: isCompanyLoading } = companyDropdownQuery()
  const companyOptions = companyDropdownData && companyDropdownData.data ? companyDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const { dropdownQuery: applicationDropdownQuery } = useApplication()
  const { data: applicationDropdownData, isLoading: isApplicationLoading } = applicationDropdownQuery()
  const applicationOptions = applicationDropdownData && applicationDropdownData.data ? applicationDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const { dropdownQuery: feeTypeDropdownQuery } = useFeeType()
  const { data: feeTypeDropdownData, isLoading: isFeeTypeLoading } = feeTypeDropdownQuery()
  const feeTypeOptions = feeTypeDropdownData && feeTypeDropdownData.data ? feeTypeDropdownData.data.map((c) => ({ value: c.id, label: c.name })) : []

  const { dropdownQuery: currencyDropdownQuery } = useCurrency()
  const { data: currencyDropdownData, isLoading: isCurrenciesLoading } = currencyDropdownQuery()
  const currencyOptions = currencyDropdownData && currencyDropdownData.data ? currencyDropdownData.data.map((c) => ({ value: c.code, label: c.name })) : []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("feeConfigurations.forms.edit.title")}</CardTitle>
        <CardDescription>{t("feeConfigurations.forms.edit.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="feeTypeId"
                render={({ field }) => (
                  <FormItem className="w-full overflow-hidden">
                    <FormLabel>{t("feeConfigurations.form.fields.feeTypeId")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={feeTypeOptions}
                        placeholder={t("feeConfigurations.form.companyId.placeholder") || "Select company"}
                        disabled={isFeeTypeLoading}
                        isLoading={isFeeTypeLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!!(companyId || applicationId) && (
                <FormField
                  control={form.control}
                  name="ownerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("feeConfigurations.form.fields.ownerType")}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setOwnerType(value as unknown as OWNER_TYPE)
                          }}
                          value={field.value ?? undefined}
                        >
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder={t("feeTypes.form.transactionType.placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OWNER_TYPE.SYSTEM}>{t("feeTypes.form.transactionType.system")}</SelectItem>
                            <SelectItem value={OWNER_TYPE.COMPANY}>{t("feeTypes.form.transactionType.company")}</SelectItem>
                            <SelectItem value={OWNER_TYPE.APPLICATION}>{t("feeTypes.form.transactionType.application")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {ownerType !== OWNER_TYPE.SYSTEM ? (
                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("feeConfigurations.form.fields.ownerId")}</FormLabel>
                      <FormControl>
                        {ownerType === OWNER_TYPE.COMPANY ? (
                          <SearchDropdown
                            value={field.value || null}
                            onChange={(val) => field.onChange(val)}
                            options={companyOptions}
                            placeholder={t("feeConfigurations.form.companyId.placeholder") || "Select company"}
                            disabled={isCompanyLoading}
                            isLoading={isCompanyLoading}
                          />
                        ) : (
                          <SearchDropdown
                            value={field.value || null}
                            onChange={(val) => field.onChange(val)}
                            options={applicationOptions}
                            placeholder={t("feeConfigurations.form.companyId.placeholder") || "Select company"}
                            disabled={isApplicationLoading}
                            isLoading={isApplicationLoading}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <></>
              )}

              <FormField
                control={form.control}
                name="fixedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.fixedAmount")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("feeConfigurations.form.placeholders.fixedAmount")}
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="percentageRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.percentageRate")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("feeConfigurations.form.placeholders.percentageRate")}
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.minAmount")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("feeConfigurations.form.placeholders.minAmount")}
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.maxAmount")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("feeConfigurations.form.placeholders.maxAmount")}
                        value={field.value !== undefined ? field.value?.toString() : ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        ref={field.ref}
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.currency")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={currencyOptions}
                        placeholder={t("feeConfigurations.form.companyId.placeholder") || "Select company"}
                        disabled={isApplicationLoading}
                        isLoading={isCurrenciesLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.startDate")}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            disabled={field.disabled || isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>{t("feeConfigurations.form.companyId.placeholder") || "Select company"}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? date.toISOString() : "")} />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeConfigurations.form.fields.endDate")}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            disabled={field.disabled || isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>{t("feeConfigurations.form.companyId.placeholder") || "Select company"}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? date.toISOString() : "")} />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("feeConfigurations.form.fields.isActive")}</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("feeConfigurations.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
