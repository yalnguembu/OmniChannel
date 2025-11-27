import React, { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon, CalendarIcon } from "lucide-react"
import { getApiBalancesReadModelDropdown } from "@/shared/api"
import { useCompany } from "@/features/companies/hooks/useCompany"
import { SearchDropdown } from "@/shared/components/dropdowns/search-dropdown"
import { useApplication } from "@/features/companies/hooks/useApplication"
import { useWithdrawalMethod } from "@/features/withdrawal-methods/hooks/useWithdrawalMethod"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { cn } from "@/shared/lib/utils"
import { format } from "date-fns"
import { z } from "zod"

type WithdrawalsInitRequest = {
  balanceId: string
  companyId: string
  applicationId: string
  withdrawalMethodId: string
  amount: number
  notes?: string
  withdrawalsAt: string
}

const zWithdrawalsInitRequest = z.object({
  balanceId: z.string().uuid(),
  companyId: z.string().uuid(),
  applicationId: z.string().uuid(),
  withdrawalMethodId: z.string().uuid(),
  amount: z.number(),
  notes: z.string().optional(),
  withdrawalsAt: z.string(),
})

interface WithdrawalInitFormProps {
  onSubmit: (data: WithdrawalsInitRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<WithdrawalsInitRequest>
}

export const WithdrawalInitForm: React.FC<WithdrawalInitFormProps> = ({ onSubmit, onCancel, isLoading = false, defaultValues }) => {
  const { t } = useTranslation()

  const [balancesResponse, setBalances] = React.useState({})
  const [isBalancesLoading, setIsBalancesLoading] = React.useState<boolean>(false)

  const form = useForm<WithdrawalsInitRequest>({
    resolver: zodResolver(zWithdrawalsInitRequest),
    defaultValues: {
      ...defaultValues,
    },
  })

  const { dropdownQuery: getCompanies } = useCompany()
  const { dropdownQuery: getApplications } = useApplication()
  const { dropdownQuery: getWithdrawalMethods } = useWithdrawalMethod()

  const { data: companiesResponse, isLoading: isCompaniesLoading } = getCompanies()
  const { data: applicationsResponse, isLoading: isApplicationsLoading } = getApplications()
  const { data: withdrawalMethodsResponse, isLoading: isWithdrawalMethodsLoading } = getWithdrawalMethods()

  const balanceOptions = useMemo(
    () =>
      balancesResponse?.data?.map((balance) => ({
        value: balance.id ?? "",
        label: `${balance.paymentMethodName} ${balance.currentBalance} ${balance.currency}` ?? "",
      })) ?? [],
    [balancesResponse],
  )
  const companyOptions = useMemo(() => companiesResponse?.data?.map((company) => ({ value: company.id ?? "", label: company.name ?? "" })) ?? [], [companiesResponse])
  const applicationOptions = useMemo(() => applicationsResponse?.data?.map((app) => ({ value: app.id ?? "", label: app.name ?? "" })) ?? [], [applicationsResponse])
  const withdrawalMethodOptions = useMemo(() => withdrawalMethodsResponse?.data?.map((app) => ({ value: app.id ?? "", label: app.name ?? "" })) ?? [], [withdrawalMethodsResponse])

  const handleSubmit = (values: WithdrawalsInitRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  const fetchBalances = async () => {
    setIsBalancesLoading(true)
    const response = await getApiBalancesReadModelDropdown({
      query: {
        balancetype: "MAIN",
        applicationid: form.getValues("applicationId") ?? "",
      },
    })
    setIsBalancesLoading(false)
    console.log(response.data)

    if (response.data) setBalances(response.data)
  }

  useEffect(() => {
    if (form.getValues("withdrawalMethodId")) {
      fetchBalances()
    }
  }, [form.watch("withdrawalMethodId"), form.watch("applicationId")])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("withdrawals.form.init.systemTitle")}</CardTitle>
        <CardDescription>{t("withdrawals.form.init.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawals.form.companyIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={companyOptions}
                        placeholder={t("withdrawals.form.companyIdPlaceholder")}
                        disabled={isCompaniesLoading}
                        isLoading={isCompaniesLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawals.form.applicationIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={applicationOptions}
                        placeholder={t("withdrawals.form.applicationIdPlaceholder")}
                        disabled={isApplicationsLoading}
                        isLoading={isApplicationsLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="withdrawalMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawals.form.withdrawalMethodIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={withdrawalMethodOptions}
                        placeholder={t("withdrawals.form.withdrawalMethodIdPlaceholder")}
                        disabled={isWithdrawalMethodsLoading}
                        isLoading={isWithdrawalMethodsLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balanceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawals.form.balanceIdLabel")}</FormLabel>
                    <FormControl>
                      <SearchDropdown
                        value={field.value || null}
                        onChange={(val) => field.onChange(val)}
                        options={balanceOptions}
                        placeholder={t("withdrawals.form.balanceIdPlaceholder")}
                        disabled={isBalancesLoading}
                        isLoading={isBalancesLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawals.form.amountLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("withdrawals.form.amountPlaceholder")}
                        {...field}
                        value={field.value || ""}
                        required={false}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="withdrawalsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("withdrawals.form.dateLabel")}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            disabled={field.disabled || isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "yyyy-MM-dd") : <span>{t("withdrawals.form.datePlaceholder")}</span>}
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
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("withdrawals.form.init.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
