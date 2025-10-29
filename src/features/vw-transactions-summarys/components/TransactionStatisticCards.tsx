import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { CollapsibleContainer } from "@/shared/components/filter/collapsible-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { TrendingUp, Activity, ArrowDown, ArrowUp, TrendingDown, ArrowLeftRight, Loader } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { postApiDailyMetricSearchOptions } from "@/shared/api/@tanstack/react-query.gen"
import { formatCurrency } from "@/shared/utils/formatCurrency"

export function TransactionStatisticCards() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState<any>()
  const [timeRange, setTimeRange] = useState("7d")

  // Memoize the effective date range to prevent infinite loops
  const effectiveDateRange = useMemo(() => {
    if (dateRange) return dateRange

    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    }
  }, [dateRange, timeRange])

  // Fetch daily metrics
  const { data, isLoading } = useQuery({
    ...postApiDailyMetricSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: 100,
      },
    }),
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })

  const currentMetrics = data?.data?.[0]

  return (
    <CollapsibleContainer
      isCollapsible={true}
      defaultCollapsed={true}
      className="bg-transparent border-none"
      header={
        <div className="flex justify-between items-center gap-x-2 w-full pb-2 pr-2">
          <div className="text-gray-500 font-semibold">Statistics</div>
          <div className="w-full border-[0.5px] border-muted-foreground/10 h-0"></div>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6 overflow-y-auto h-max pb-2">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <p className="flex-1 min-w-0 text-muted-foreground text-sm xl:text-base">{t("analytics.description")}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 flex-shrink-0">
            <ToggleGroup type="single" value={timeRange} onValueChange={setTimeRange} variant="outline" className="flex-wrap bg-background">
              <ToggleGroupItem value="7d" className="text-xs xl:text-sm">
                {t("analytics.timeRange.7days")}
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="text-xs xl:text-sm">
                {t("analytics.timeRange.30days")}
              </ToggleGroupItem>
              <ToggleGroupItem value="90d" className="text-xs xl:text-sm">
                {t("analytics.timeRange.90days")}
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="w-full sm:w-auto">
              <DateRangeInput
                size="sm"
                style="rounded-md h-8 w-full sm:w-auto"
                dateFormat="short"
                placeholder={t("analytics.selectRange")}
                formField={{
                  value: dateRange,
                  name: "date-range",
                  onChange: setDateRange,
                }}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">{t("analytics.loading")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced KPI Cards with Advanced Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("analytics.transactions.totalVolume")}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(currentMetrics?.totalVolume || 0)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">
                      {(currentMetrics?.totalReceipts || 0) + (currentMetrics?.totalWithdrawals || 0) + (currentMetrics?.totalFundTransfers || 0)}
                    </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("analytics.transactions.receipts")}</CardTitle>
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(currentMetrics?.totalReceiptsAmount || 0)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">{currentMetrics?.totalReceipts || 0}</span> {t("analytics.transactions.counts")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("analytics.transactions.withdrawals")}</CardTitle>
                  <ArrowUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(currentMetrics?.totalWithdrawalsAmount || 0)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3 text-orange-600" />
                    <span className="font-semibold">{currentMetrics?.totalWithdrawals || 0}</span> {t("analytics.transactions.counts")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("analytics.transactions.fundTransfers")}</CardTitle>
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{formatCurrency(currentMetrics?.totalFundTransfersAmount || 0)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">{currentMetrics?.totalFundTransfers || 0} </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </CollapsibleContainer>
  )
}
