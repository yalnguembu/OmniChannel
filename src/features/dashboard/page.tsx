import { useTranslation } from "react-i18next"
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { useMemo } from "react"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { BarChartStacked, LineChartMultiAxis, generateChartConfig } from "@/features/dashboard/components"
import { TrendingUp, Activity, CreditCard, PiggyBank, TrendingDown, Loader } from "lucide-react"
import { BalancesReadModelDto } from "@/shared/api/types.gen"
import { useDashboard } from "./hooks/useDashboard"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { formatCurrency, formatAmount } from "@/shared/utils/formatCurrency"

export function DashboardPage() {
  const { t } = useTranslation()
  const {
    metrics,
    paymentMethodMetrics,
    balances: apiBalances,
    isLoadingMetrics,
    isLoadingPaymentMethods,
    isLoadingBalances,
    dateRange,
    setDateRange,
    timeRange,
    setTimeRange,
  } = useDashboard()

  const loading = isLoadingMetrics || isLoadingPaymentMethods || isLoadingBalances

  const currentMetrics = metrics[0]
  // Create default metrics for when no data is available
  const defaultMetrics = {
    totalVolume: 0,
    netRevenue: 0,
    activeUsers: 0,
    newUsers: 0,
    totalReceipts: 0,
    successfulReceipts: 0,
    totalWithdrawals: 0,
    successfulWithdrawals: 0,
    totalFundTransfers: 0,
    successfulFundTransfers: 0,
    receiptsSuccessRate: 0,
    withdrawalsSuccessRate: 0,
    fundTransfersSuccessRate: 0,
    totalFees: 0,
    totalProviderFees: 0,
    failureRate: 0,
  }

  const effectiveMetrics = currentMetrics || defaultMetrics
  const effectiveMetricsArray = metrics.length > 0 ? metrics : []

  // Use API balances or fallback to empty array
  const effectiveBalances = useMemo(() => {
    return apiBalances.length > 0 ? apiBalances : ([] as BalancesReadModelDto[])
  }, [apiBalances])

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const totalBalance = effectiveBalances.filter((bal) => bal.balanceType === "MAIN").reduce((sum, bal) => sum + (bal.currentBalance || 0), 0)
    const totalAllTimeBalance = effectiveBalances.filter((bal) => bal.balanceType === "MAIN").reduce((sum, bal) => sum + (bal.totalCredits || 0), 0)
    const omBalance = effectiveBalances.filter((bal) => bal.paymentMethodCode === "ORANGE_MONEY").reduce((sum, bal) => sum + (bal.currentBalance || 0), 0)
    const omAllTimeBalance = effectiveBalances.filter((bal) => bal.paymentMethodCode === "ORANGE_MONEY").reduce((sum, bal) => sum + (bal.totalCredits || 0), 0)
    const omAllTimeCount = effectiveBalances.filter((bal) => bal.paymentMethodCode === "ORANGE_MONEY").reduce((sum, bal) => sum + (bal.transactionCount || 0), 0)
    const momoBalance = effectiveBalances.filter((bal) => bal.paymentMethodCode === "MTN_MOMO").reduce((sum, bal) => sum + (bal.currentBalance || 0), 0)
    const momoAllTimeBalance = effectiveBalances.filter((bal) => bal.paymentMethodCode === "MTN_MOMO").reduce((sum, bal) => sum + (bal.totalCredits || 0), 0)
    const momoAllTimeCount = effectiveBalances.filter((bal) => bal.paymentMethodCode === "MTN_MOMO").reduce((sum, bal) => sum + (bal.transactionCount || 0), 0)
    const totalAvailable = effectiveBalances.reduce((sum, bal) => sum + (bal.availableBalance || 0), 0)
    const totalReserved = effectiveBalances.reduce((sum, bal) => sum + (bal.reservedBalance || 0), 0)

    const liquidityRatio = totalBalance > 0 ? (totalAvailable / totalBalance) * 100 : 0
    const reserveRatio = totalBalance > 0 ? (totalReserved / totalBalance) * 100 : 0

    // Risk assessment based on balances and metrics
    const reconciliationRisk = effectiveBalances.filter((bal) => bal.reconciliationStatus !== "RECONCILED").length
    const riskLevel = reconciliationRisk > 0 ? "MEDIUM" : effectiveMetrics.failureRate > 5 ? "HIGH" : "LOW"

    return {
      totalBalance,
      totalAvailable,
      totalReserved,
      liquidityRatio,
      reserveRatio,
      reconciliationRisk,
      riskLevel,
      omBalance,
      momoBalance,
      omAllTimeBalance,
      omAllTimeCount,
      momoAllTimeBalance,
      momoAllTimeCount,
      totalAllTimeBalance,
    }
  }, [effectiveBalances, effectiveMetrics])

  const transactionTrendsData = effectiveMetricsArray.slice(-7).map((metric) => ({
    date: new Date(metric.metricDate).toLocaleDateString("en", { month: "short", day: "numeric" }),
    receipts: metric.totalReceipts || 0,
    withdrawals: metric.totalWithdrawals || 0,
    transfers: metric.totalFundTransfers || 0,
    volume: (metric.totalVolume || 0) / 1000000,
  }))

  const performanceMetricsData = effectiveMetricsArray.map((metric) => ({
    date: new Date(metric.metricDate).toLocaleDateString("fr", { month: "short", day: "numeric" }),
    global: metric.totalReceiptsAmount,
    count: metric.totalReceipts,
  }))

  const trendsConfig = generateChartConfig(["receipts", "withdrawals", "transfers", "volume"])
  const performanceConfig = generateChartConfig(["date", "global", "count"])

  const chartConfig = {
    global: {
      label: "Amount (XAF)",
      color: "var(--chart-1)",
    },
    count: {
      label: "Count",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  const enum paymentMethodCode {
    MTN_MOMO = "/icons/momo.png",
    ORANGE_MONEY = "/icons/om.png",
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-y-auto h-max">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <p className="flex-1 min-w-0 text-muted-foreground text-sm xl:text-base">{t("analytics.description")}</p>
      </div>

      <div className="space-y-6">
        {/* Enhanced KPI Cards with Advanced Metrics */}
        <div className="grid gap-4 lg:gap-2 xl:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.transactions.cummulatedBalance")}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold text-primary">{formatCurrency(analytics.totalBalance?.toFixed(2))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">{analytics.omAllTimeCount + analytics.momoAllTimeCount} (100%)</span>
                    {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("analytics.enhanced.balance")} {t("analytics.transactions.om")}
              </CardTitle>
              <img src="/icons/om.png" className="h-6 w-6 text-muted- rounded-lg" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold">{formatCurrency(analytics?.omBalance?.toFixed(2))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {(analytics?.omAllTimeBalance / analytics.totalAllTimeBalance) * 100 > (analytics?.momoAllTimeBalance / analytics.totalAllTimeBalance) * 100 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {analytics?.omAllTimeCount} ({((analytics?.omAllTimeBalance / analytics.totalAllTimeBalance) * 100)?.toFixed(2)}%)
                    </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("analytics.enhanced.balance")} {t("analytics.transactions.momo")}
              </CardTitle>
              <img src="/icons/momo.png" className="h-6 w-6 text-muted- rounded-lg" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold">{formatCurrency(analytics?.momoBalance?.toFixed(2))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {(analytics?.momoAllTimeBalance * 100) / analytics.totalAllTimeBalance > (analytics?.omAllTimeBalance * 100) / analytics.totalAllTimeBalance ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {analytics?.momoAllTimeCount} ({((analytics?.momoAllTimeBalance * 100) / analytics.totalAllTimeBalance)?.toFixed(2)}%)
                    </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* <Card className="lg:col-span-2">
            <CardContent className="min-h-[220px]">
              {loading ? (
                <div className="flex items-center justify-center h-54">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DonutChart data={balanceDistributionData} config={balanceConfig} dataKey="value" nameKey="name" height={250} />
              )}
            </CardContent>
          </Card> */}
        </div>
        {/* Enhanced Transaction Trends */}
        <Card>
          <CardHeader className="block lg:flex items- justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("analytics.description")}
            </CardTitle>
            <CardAction>
              <div className="mt-4 lg:mt-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 flex-shrink-0">
                <ToggleGroup type="single" value={timeRange} onValueChange={setTimeRange} variant="outline" className="flex-wrap bg-background">
                  <ToggleGroupItem value="7d" className="text-[8px] lg:text-[9px] xl:text-sm">
                    {t("analytics.timeRange.7days")}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="30d" className="text[8px] lg:text-[9px] xl:text-sm">
                    {t("analytics.timeRange.30days")}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="90d" className="text-[8px] lg:text-[9px] xl:text-sm">
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
            </CardAction>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    height={300}
                    accessibilityLayer
                    data={performanceMetricsData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="global" type="basis" stroke="var(--primary)" strokeWidth={2} dot={false}>
                      {/* <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} /> */}
                    </Line>
                    <Line dataKey="count" type="monotone" stroke="var(--secondary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-indigo-500" />
              {t("analytics.enhanced.balanceHealthDashboard")}
            </CardTitle>
            <CardDescription>{t("analytics.enhanced.balanceHealthDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">{t("analytics.enhanced.provider")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.balanceType")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.currentBalance")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.available")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.reserved")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.credit")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.debit")}</th>
                      <th className="text-right p-2 font-medium">{t("analytics.enhanced.transaction")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveBalances.map((balance, index) => (
                      <tr key={balance.id || index} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex gap-2">
                            <img src={`${paymentMethodCode[balance.paymentMethodCode]}`} className="h-6 w-6 text-muted- rounded-lg" />
                            <div>
                              <div className="font-medium">{balance.paymentMethodName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono">{<div className="text-xs text-muted-foreground">{balance.balanceName}</div>}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(balance.currentBalance || 0)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(balance.availableBalance || 0)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(balance.reservedBalance || 0)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(balance.totalCredits || 0)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(balance.totalDebits || 0)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(balance.transactionCount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="hidden">
          {/* Advanced Financial Visualizations */}
          <div className="grid gap-6 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.overview.transactionBreakdown.title")}</CardTitle>
                <CardDescription>{t("analytics.overview.transactionBreakdown.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                      <div>{t("analytics.overview.transactionBreakdown.type")}</div>
                      <div>{t("analytics.overview.transactionBreakdown.total")}</div>
                      <div>{t("analytics.overview.transactionBreakdown.success")}</div>
                      <div>{t("analytics.overview.transactionBreakdown.rate")}</div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-4 py-2">
                        <div className="font-medium">{t("analytics.overview.transactionBreakdown.receipts")}</div>
                        <div>{effectiveMetrics.totalReceipts.toLocaleString()}</div>
                        <div>{effectiveMetrics.successfulReceipts.toLocaleString()}</div>
                        <div>
                          <Badge variant="outline" className="bg-green-50 text-green-600">
                            {effectiveMetrics.receiptsSuccessRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 py-2">
                        <div className="font-medium">{t("analytics.overview.transactionBreakdown.withdrawals")}</div>
                        <div>{effectiveMetrics.totalWithdrawals.toLocaleString()}</div>
                        <div>{effectiveMetrics.successfulWithdrawals.toLocaleString()}</div>
                        <div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600">
                            {effectiveMetrics.withdrawalsSuccessRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 py-2">
                        <div className="font-medium">{t("analytics.overview.transactionBreakdown.fundTransfers")}</div>
                        <div>{effectiveMetrics.totalFundTransfers.toLocaleString()}</div>
                        <div>{effectiveMetrics.successfulFundTransfers.toLocaleString()}</div>
                        <div>
                          <Badge variant="outline" className="bg-purple-50 text-purple-600">
                            {effectiveMetrics.fundTransfersSuccessRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Performance */}
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.overview.paymentMethods.title")}</CardTitle>
                <CardDescription>{t("analytics.overview.paymentMethods.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                      <div>{t("analytics.overview.paymentMethods.provider")}</div>
                      <div>{t("analytics.overview.paymentMethods.volume")}</div>
                      <div>{t("analytics.overview.paymentMethods.amount")}</div>
                      <div>{t("analytics.overview.paymentMethods.rate")}</div>
                    </div>
                    <div className="space-y-3 text-sm">
                      {paymentMethodMetrics.map((method) => (
                        <div key={method.paymentMethodId} className="grid grid-cols-4 gap-4 py-2">
                          <div className="font-medium">{method.paymentMethodName}</div>
                          <div>{method.transactionCount.toLocaleString()}</div>
                          <div>{formatAmount(method.totalAmount)} XAF</div>
                          <div>
                            <Badge variant="outline" className="bg-green-50 text-green-600">
                              {method.successRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Transaction Trends */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t("analytics.enhanced.transactionTrends")}
                </CardTitle>
                <CardDescription>{t("analytics.enhanced.transactionTrendsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <BarChartStacked data={transactionTrendsData} config={trendsConfig} dataKeys={["receipts", "withdrawals", "transfers"]} height={300} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t("analytics.enhanced.performanceMetrics")}
                </CardTitle>
                <CardDescription>{t("analytics.enhanced.performanceMetricsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <LineChartMultiAxis data={performanceMetricsData} config={performanceConfig} dataKeys={["successRate", "revenue"]} height={300} />
                )}
              </CardContent>
            </Card>
          </div>
          {/* </div> */}

          {/* Balance Health Dashboard */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-indigo-500" />
                {t("analytics.enhanced.balanceHealthDashboard")}
              </CardTitle>
              <CardDescription>{t("analytics.enhanced.balanceHealthDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">{t("analytics.enhanced.provider")}</th>
                        <th className="text-right p-2 font-medium">{t("analytics.enhanced.balance")}</th>
                        <th className="text-right p-2 font-medium">{t("analytics.enhanced.currentBalance")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveBalances.map((balance, index) => (
                        <tr key={balance.id || index} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--${balance.paymentMethodCode}))` }} />
                              <div>
                                <div className="font-medium">{balance.paymentMethodName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-right font-mono">{<div className="text-xs text-muted-foreground">{balance.balanceName}</div>}</td>
                          <td className="p-2 text-right font-mono">{formatAmount(balance.currentBalance || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
