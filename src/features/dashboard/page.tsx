import { useTranslation } from "react-i18next"
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { AreaChartGradient, BarChartStacked, LineChartMultiAxis, HalfDonutChart, generateChartConfig } from "@/features/dashboard/components"
import { TrendingUp, Activity, CreditCard, Wallet, PiggyBank, Zap, ArrowDown, ArrowUp, TrendingDown, ArrowLeftRight, Loader } from "lucide-react"
import { BalancesReadModelDto } from "@/shared/api/types.gen"
import { useDashboard } from "./hooks/useDashboard"
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
  const totalTransactions = currentMetrics ? currentMetrics.totalReceipts + currentMetrics.totalWithdrawals + currentMetrics.totalFundTransfers : 0
  const totalSuccessfulTransactions = currentMetrics ? currentMetrics.successfulReceipts + currentMetrics.successfulWithdrawals + currentMetrics.successfulFundTransfers : 0
  const overallSuccessRate = totalTransactions > 0 ? (totalSuccessfulTransactions / totalTransactions) * 100 : 0

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
    }
  }, [effectiveBalances, effectiveMetrics])

  // Chart data preparations
  const liquidityData = [{ name: "Liquidity", value: analytics.liquidityRatio }]

  const balanceDistributionData = effectiveBalances.map((balance, index) => ({
    name: balance.paymentMethodName || "Unknown",
    value: balance.currentBalance || 0,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  const transactionTrendsData = effectiveMetricsArray.slice(-7).map((metric) => ({
    date: new Date(metric.metricDate).toLocaleDateString("en", { month: "short", day: "numeric" }),
    receipts: metric.totalReceipts || 0,
    withdrawals: metric.totalWithdrawals || 0,
    transfers: metric.totalFundTransfers || 0,
    volume: (metric.totalVolume || 0) / 1000000,
  }))

  const performanceMetricsData = effectiveMetricsArray.slice(-7).map((metric) => ({
    date: new Date(metric.metricDate).toLocaleDateString("en", { month: "short", day: "numeric" }),
    successRate: overallSuccessRate,
    revenue: (metric.netRevenue || 0) / 1000,
    users: metric.activeUsers || 0,
  }))

  // Chart configurations
  const liquidityConfig = generateChartConfig(["value"])
  const balanceConfig = generateChartConfig(balanceDistributionData.map((d) => d.name))
  const trendsConfig = generateChartConfig(["receipts", "withdrawals", "transfers", "volume"])
  const performanceConfig = generateChartConfig(["successRate", "revenue", "users"])

  return (
    <div className="space-y-4 sm:space-y-6 overflow-y-auto h-max">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center hidden">
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

      <div className="space-y-6">
        {/* Enhanced KPI Cards with Advanced Metrics */}
        <div className="grid gap-4 lg:gap-2 xl:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.transactions.totalVolume")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold text-primary">{currentMetrics?.totalVolume?.toFixed(2)} XAF</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">
                      {(currentMetrics?.totalReceipts || 0) + (currentMetrics?.totalWithdrawals || 0) + (currentMetrics?.totalFundTransfers || 0)}
                    </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.enhanced.balance")}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold">{parseInt(analytics?.totalBalance?.toFixed(2))} XAF</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">
                      {(currentMetrics?.totalReceipts || 0) + (currentMetrics?.totalWithdrawals || 0) + (currentMetrics?.totalFundTransfers || 0)}
                    </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.transactions.receipts")}</CardTitle>
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold text-green-600">{currentMetrics?.totalReceiptsAmount?.toFixed(2)} XAF</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">{currentMetrics?.totalReceipts || 0}</span> {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.transactions.withdrawals")}</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold text-orange-600">{currentMetrics?.totalWithdrawalsAmount} XAF</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3 text-orange-600" />
                    <span className="font-semibold">{currentMetrics?.totalWithdrawals || 0}</span> {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.transactions.fundTransfers")}</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-base xl:text-2xl font-bold text-blue-500">{currentMetrics?.totalFundTransfersAmount?.toFixed(2) || 0} XAF</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-semibold">{currentMetrics?.totalFundTransfers || 0} </span>
                    {t("analytics.transactions.counts")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="hidden">
          {/* Advanced Financial Visualizations */}
          <div className="grid gap-6 xl:grid-cols-3">
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
                          <div>{formatAmount(method.totalAmount)}</div>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  {t("analytics.enhanced.balanceDistribution")}
                </CardTitle>
                <CardDescription>{t("analytics.enhanced.balanceDistributionDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <HalfDonutChart data={balanceDistributionData} config={balanceConfig} dataKey="value" nameKey="name" height={250} />
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

          {/* Balance Health Dashboard */}
          <div className="grid xl:grid-cols-3 gap-8">
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
                          <th className="text-right p-2 font-medium">{t("analytics.enhanced.currentBalance")}</th>
                          <th className="text-right p-2 font-medium">{t("analytics.enhanced.available")}</th>
                          <th className="text-right p-2 font-medium">{t("analytics.enhanced.reserved")}</th>
                          <th className="text-right p-2 font-medium">{t("analytics.enhanced.utilizationRate")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {effectiveBalances.map((balance, index) => {
                          const utilizationRate = balance.currentBalance ? ((balance.currentBalance - (balance.availableBalance || 0)) / balance.currentBalance) * 100 : 0

                          return (
                            <tr key={balance.id || index} className="border-b hover:bg-muted/50">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                                  <div>
                                    <div className="font-medium">{balance.paymentMethodName}</div>
                                    <div className="text-xs text-muted-foreground">{balance.paymentMethodCode}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-right font-mono">{formatAmount(balance.currentBalance || 0)}</td>
                              <td className="p-2 text-right font-mono">{formatAmount(balance.availableBalance || 0)}</td>
                              <td className="p-2 text-right font-mono">{formatAmount(balance.reservedBalance || 0)}</td>
                              <td className="p-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${utilizationRate > 80 ? "bg-red-500" : utilizationRate > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium w-10 text-right">{utilizationRate.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-500" />
                  {t("analytics.enhanced.liquidityRatio")}
                </CardTitle>
                <CardDescription>{t("analytics.enhanced.liquidityDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <HalfDonutChart
                      data={liquidityData}
                      config={liquidityConfig}
                      dataKey="value"
                      nameKey="name"
                      height={150}
                      centerLabel={`${analytics.liquidityRatio.toFixed(1)}%`}
                    />
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("analytics.enhanced.available")}:</span>
                        <span className="font-bold">{formatCurrency(analytics.totalAvailable)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("analytics.enhanced.reserved")}:</span>
                        <span className="font-bold">{formatCurrency(analytics.totalReserved)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Volume Trend with Advanced Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("analytics.enhanced.volumeTrendAnalysis")}
              </CardTitle>
              <CardDescription>{t("analytics.enhanced.volumeTrendDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <AreaChartGradient data={transactionTrendsData} config={trendsConfig} dataKey="volume" height={300} fillOpacity={0.6} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
