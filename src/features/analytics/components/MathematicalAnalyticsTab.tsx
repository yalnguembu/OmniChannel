import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { BarChart2, Calculator, Brain, Gauge, Loader } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto } from "@/shared/api/types.gen"
import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Legend, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"

interface MathematicalAnalyticsTabProps {
  currentMetrics?: DailyMetricDto
  totalTransactions: number
  overallSuccessRate: number
  isLoading?: boolean
}

// Safe division helper to avoid NaN
const safeDivide = (numerator: number, denominator: number, defaultValue = 0): number => {
  if (!denominator || denominator === 0) return defaultValue
  return numerator / denominator
}

// Safe percentage helper
const safePercentage = (numerator: number, denominator: number, defaultValue = 0): number => {
  return safeDivide(numerator, denominator, defaultValue) * 100
}

export default function MathematicalAnalyticsTab({ currentMetrics, totalTransactions, overallSuccessRate, isLoading = false }: MathematicalAnalyticsTabProps) {
  const { t } = useTranslation()

  const effectiveMetrics = currentMetrics || {
    totalReceipts: 0,
    successfulReceipts: 0,
    failedReceipts: 0,
    receiptsSuccessRate: 0,
    totalWithdrawals: 0,
    successfulWithdrawals: 0,
    failedWithdrawals: 0,
    withdrawalsSuccessRate: 0,
    totalFundTransfers: 0,
    successfulFundTransfers: 0,
    failedFundTransfers: 0,
    fundTransfersSuccessRate: 0,
    totalFees: 0,
    totalProviderFees: 0,
    netRevenue: 0,
    totalVolume: 0,
    activeUsers: 0,
    newUsers: 0,
    apiCallsCount: 0,
    errorsCount: 0,
  }

  // Prepare data for band charts
  const transactionStatusData = [
    {
      name: t("analytics.mathematical.transactionStatus.receipts"),
      success: effectiveMetrics.successfulReceipts || 0,
      failed: effectiveMetrics.failedReceipts || 0,
      total: effectiveMetrics.totalReceipts || 0,
      successRate: effectiveMetrics.receiptsSuccessRate || 0,
      color: "#10b981", // green-500
    },
    {
      name: t("analytics.mathematical.transactionStatus.withdrawals"),
      success: effectiveMetrics.successfulWithdrawals || 0,
      failed: effectiveMetrics.failedWithdrawals || 0,
      total: effectiveMetrics.totalWithdrawals || 0,
      successRate: effectiveMetrics.withdrawalsSuccessRate || 0,
      color: "#3b82f6", // blue-500
    },
    {
      name: t("analytics.mathematical.transactionStatus.fundTransfers"),
      success: effectiveMetrics.successfulFundTransfers || 0,
      failed: effectiveMetrics.failedFundTransfers || 0,
      total: effectiveMetrics.totalFundTransfers || 0,
      successRate: effectiveMetrics.fundTransfersSuccessRate || 0,
      color: "#8b5cf6", // purple-500
    },
  ]

  // Success rate band data for area chart
  const successRateBandData = transactionStatusData.map((item) => ({
    name: item.name,
    successRate: item.successRate,
    targetRate: 95, // Target success rate
    failureRate: 100 - item.successRate,
  }))

  // Chart configurations
  const transactionStatusConfig = {
    success: { label: "Successful", color: "hsl(142, 76%, 36%)" },
    failed: { label: "Failed", color: "hsl(0, 84%, 60%)" },
    total: { label: "Total", color: "hsl(217, 91%, 60%)" },
  } satisfies ChartConfig

  const successRateConfig = {
    successRate: { label: "Success Rate", color: "hsl(142, 76%, 36%)" },
    targetRate: { label: "Target Rate", color: "hsl(217, 91%, 60%)" },
    failureRate: { label: "Failure Rate", color: "hsl(0, 84%, 60%)" },
  } satisfies ChartConfig

  return (
    <div className="space-y-8">
      {/* Transaction Status Distribution */}
      <Card className="w-full">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <BarChart2 className="h-6 w-6 text-blue-500" />
            {t("analytics.mathematical.transactionStatus.title")}
          </CardTitle>
          <CardDescription className="text-base">{t("analytics.mathematical.transactionStatus.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-8">
          {/* Transaction Volume Band Chart */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-blue-700">{t("analytics.mathematical.transactionStatus.transactionVolumeBands")}</h4>
            <ChartContainer config={transactionStatusConfig} className="h-[350px]">
              <ComposedChart data={transactionStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis fontSize={12} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`${Number(value).toLocaleString()} transactions`, name === "success" ? "Successful" : name === "failed" ? "Failed" : "Total"]}
                    />
                  }
                />
                <Legend />

                {/* Success band (area) */}
                <Area type="monotone" dataKey="success" stackId="transactions" stroke="#10b981" fill="url(#successGradient)" fillOpacity={0.8} name="Successful Transactions" />

                {/* Failure band (area) */}
                <Area type="monotone" dataKey="failed" stackId="transactions" stroke="#ef4444" fill="url(#failureGradient)" fillOpacity={0.8} name="Failed Transactions" />

                {/* Total volume bar */}
                <Bar dataKey="total" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth={2} name="Total Volume" radius={[4, 4, 0, 0]} />

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="failureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ChartContainer>
          </div>

          {/* Success Rate Band Chart */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-green-700">{t("analytics.mathematical.transactionStatus.successRateBands")}</h4>
            <ChartContainer config={successRateConfig} className="h-[300px]">
              <ComposedChart data={successRateBandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${Number(value).toFixed(1)}%`,
                        name === "successRate" ? "Success Rate" : name === "targetRate" ? "Target Rate" : "Failure Rate",
                      ]}
                    />
                  }
                />
                <Legend />

                {/* Target rate reference band */}
                <Area type="monotone" dataKey="targetRate" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" strokeDasharray="5 5" name="Target Success Rate (95%)" />

                {/* Success rate band */}
                <Area type="monotone" dataKey="successRate" stroke="#10b981" fill="url(#successRateBand)" strokeWidth={3} name="Actual Success Rate" />

                {/* Success rate bars for comparison */}
                <Bar dataKey="successRate" fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth={1} name="Success Rate Bars" radius={[4, 4, 0, 0]}>
                  {successRateBandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.successRate >= 95 ? "#10b981" : entry.successRate >= 90 ? "#f59e0b" : "#ef4444"} fillOpacity={0.6} />
                  ))}
                </Bar>

                <defs>
                  <linearGradient id="successRateBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ChartContainer>
          </div>

          {/* Transaction Status Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            {transactionStatusData.map((item, index) => (
              <div key={item.name} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <h5 className="font-semibold text-gray-800">{item.name}</h5>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t("analytics.mathematical.transactionStatus.total")}:</span>
                    <span className="font-mono font-bold">{item.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t("analytics.mathematical.transactionStatus.successful")}:</span>
                    <span className="font-mono font-bold text-green-600">{item.success.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t("analytics.mathematical.transactionStatus.failed")}:</span>
                    <span className="font-mono font-bold text-red-600">{item.failed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium text-gray-700">{t("analytics.mathematical.transactionStatus.successRate")}:</span>
                    <span className={`font-mono font-bold ${item.successRate >= 95 ? "text-green-600" : item.successRate >= 90 ? "text-yellow-600" : "text-red-600"}`}>
                      {item.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistical Measures */}
          <div className="border-t pt-8">
            <h4 className="text-lg font-semibold mb-6">{t("analytics.mathematical.transactionStatus.statisticalVarianceAnalysis")}</h4>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.transactionStatus.successRateStdDev")}</div>
                <div className="text-2xl font-mono font-bold">
                  {(() => {
                    const rates = [effectiveMetrics.receiptsSuccessRate, effectiveMetrics.withdrawalsSuccessRate, effectiveMetrics.fundTransfersSuccessRate]
                    const mean = rates.reduce((a, b) => a + b) / rates.length
                    const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length
                    return Math.sqrt(variance).toFixed(2)
                  })()}
                  %
                </div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.transactionStatus.successRateConsistencyMeasure")}</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.transactionStatus.transactionCoefficientVariation")}</div>
                <div className="text-2xl font-mono font-bold">
                  {(() => {
                    const volumes = [effectiveMetrics.totalReceipts, effectiveMetrics.totalWithdrawals, effectiveMetrics.totalFundTransfers]
                    const mean = volumes.reduce((a, b) => a + b) / volumes.length
                    const stdDev = Math.sqrt(volumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / volumes.length)
                    return ((stdDev / mean) * 100).toFixed(1)
                  })()}
                  %
                </div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.transactionStatus.volumeDistributionVariability")}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Fee Analysis */}
      <Card className="w-full">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Calculator className="h-6 w-6 text-green-500" />
            {t("analytics.mathematical.operationFee.title")}
          </CardTitle>
          <CardDescription className="text-base">{t("analytics.mathematical.operationFee.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Fee Distribution Overview */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t("analytics.mathematical.operationFee.feeDistributionOverview")}</h4>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-blue-600 mb-2">{t("analytics.mathematical.operationFee.totalFeesCollected")}</div>
                <div className="text-3xl font-mono font-bold text-blue-700">{(effectiveMetrics.totalFees / 1000).toFixed(0)}K</div>
                <div className="text-sm text-blue-600">XAF</div>
              </div>
              <div className="p-6 bg-red-50 rounded-lg text-center">
                <div className="text-sm text-red-600 mb-2">{t("analytics.mathematical.operationFee.providerCosts")}</div>
                <div className="text-3xl font-mono font-bold text-red-700">{(effectiveMetrics.totalProviderFees / 1000).toFixed(0)}K</div>
                <div className="text-sm text-red-600">XAF</div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg text-center">
                <div className="text-sm text-green-600 mb-2">{t("analytics.mathematical.operationFee.netMargin")}</div>
                <div className="text-3xl font-mono font-bold text-green-700">{((effectiveMetrics.totalFees - effectiveMetrics.totalProviderFees) / 1000).toFixed(0)}K</div>
                <div className="text-sm text-green-600">XAF</div>
              </div>
            </div>
          </div>

          {/* Profitability Ratios */}
          <div className="border-t pt-8">
            <h4 className="text-lg font-semibold mb-6">{t("analytics.mathematical.operationFee.profitabilityRatios")}</h4>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.operationFee.grossMargin")}</div>
                <div className="text-2xl font-mono font-bold">
                  {safePercentage((effectiveMetrics.totalFees || 0) - (effectiveMetrics.totalProviderFees || 0), effectiveMetrics.totalFees || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.operationFee.profitMarginAfterProviderCosts")}</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.operationFee.revenueVolumeRatio")}</div>
                <div className="text-2xl font-mono font-bold">{safePercentage(effectiveMetrics.totalFees || 0, effectiveMetrics.totalVolume || 0).toFixed(3)}%</div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.operationFee.feeCollectionEfficiency")}</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.operationFee.costEfficiencyMultiplier")}</div>
                <div className="text-2xl font-mono font-bold">{safeDivide(effectiveMetrics.totalFees || 0, effectiveMetrics.totalProviderFees || 0).toFixed(2)}x</div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.operationFee.revenuePerCostUnit")}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Correlation & User Engagement Analysis */}
      <Card className="w-full">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Brain className="h-6 w-6 text-purple-500" />
            {t("analytics.mathematical.crossCorrelation.title")}
          </CardTitle>
          <CardDescription className="text-base">{t("analytics.mathematical.crossCorrelation.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* User Engagement Metrics */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t("analytics.mathematical.crossCorrelation.userEngagementMetrics")}</h4>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 bg-purple-50 rounded-lg text-center">
                <div className="text-sm text-purple-600 mb-2">{t("analytics.mathematical.crossCorrelation.transactionsPerUser")}</div>
                <div className="text-3xl font-mono font-bold text-purple-700">{safeDivide(totalTransactions, effectiveMetrics.activeUsers || 0).toFixed(2)}</div>
                <div className="text-sm text-purple-600">{t("analytics.mathematical.crossCorrelation.transactionsUserUnit")}</div>
              </div>
              <div className="p-6 bg-indigo-50 rounded-lg text-center">
                <div className="text-sm text-indigo-600 mb-2">{t("analytics.mathematical.crossCorrelation.apiCallsPerUser")}</div>
                <div className="text-3xl font-mono font-bold text-indigo-700">{safeDivide(effectiveMetrics.apiCallsCount || 0, effectiveMetrics.activeUsers || 0).toFixed(2)}</div>
                <div className="text-sm text-indigo-600">{t("analytics.mathematical.crossCorrelation.callsUserUnit")}</div>
              </div>
              <div className="p-6 bg-teal-50 rounded-lg text-center">
                <div className="text-sm text-teal-600 mb-2">{t("analytics.mathematical.crossCorrelation.revenuePerUser")}</div>
                <div className="text-3xl font-mono font-bold text-teal-700">{safeDivide(effectiveMetrics.netRevenue || 0, effectiveMetrics.activeUsers || 0).toFixed(0)}</div>
                <div className="text-sm text-teal-600">{t("analytics.mathematical.crossCorrelation.xafUserUnit")}</div>
              </div>
            </div>
          </div>

          {/* Volume vs Success Rate Correlation */}
          <div className="border-t pt-8">
            <h4 className="text-lg font-semibold mb-6">{t("analytics.mathematical.crossCorrelation.volumeVsSuccessRateCorrelation")}</h4>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.crossCorrelation.receiptsVolumeSuccessCorrelation")}</div>
                <div className="text-2xl font-mono font-bold">
                  {(() => {
                    const correlation =
                      (effectiveMetrics.totalReceipts * effectiveMetrics.receiptsSuccessRate) /
                      (Math.sqrt(effectiveMetrics.totalReceipts) * Math.sqrt(effectiveMetrics.receiptsSuccessRate * 100))
                    return (correlation / 100).toFixed(3)
                  })()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.crossCorrelation.correlationCoefficientReceipt")}</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("analytics.mathematical.crossCorrelation.withdrawalsVolumeSuccessCorrelation")}</div>
                <div className="text-2xl font-mono font-bold">
                  {(() => {
                    const correlation =
                      (effectiveMetrics.totalWithdrawals * effectiveMetrics.withdrawalsSuccessRate) /
                      (Math.sqrt(effectiveMetrics.totalWithdrawals) * Math.sqrt(effectiveMetrics.withdrawalsSuccessRate * 100))
                    return (correlation / 100).toFixed(3)
                  })()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t("analytics.mathematical.crossCorrelation.correlationCoefficientWithdrawal")}</div>
              </div>
            </div>
          </div>

          {/* Error Pattern Analysis */}
          <div className="border-t pt-8">
            <h4 className="text-lg font-semibold mb-6">{t("analytics.mathematical.crossCorrelation.errorPatternAnalysis")}</h4>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600 mb-2">{t("analytics.mathematical.crossCorrelation.errorToVolumeRatio")}</div>
                <div className="text-2xl font-mono font-bold text-red-700">{safePercentage(effectiveMetrics.errorsCount || 0, totalTransactions).toFixed(2)}%</div>
                <div className="text-sm text-red-600 mt-1">{t("analytics.mathematical.crossCorrelation.percentageTransactionsWithErrors")}</div>
              </div>
              <div className="p-6 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600 mb-2">{t("analytics.mathematical.crossCorrelation.overallFailureDistribution")}</div>
                <div className="text-2xl font-mono font-bold text-orange-700">
                  {(() => {
                    const totalFailures = (effectiveMetrics.failedReceipts || 0) + (effectiveMetrics.failedWithdrawals || 0) + (effectiveMetrics.failedFundTransfers || 0)
                    return safePercentage(totalFailures, totalTransactions).toFixed(2)
                  })()}
                  %
                </div>
                <div className="text-sm text-orange-600 mt-1">{t("analytics.mathematical.crossCorrelation.totalFailureRateAllTransactionTypes")}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth & Operational Efficiency Analytics */}
      <Card className="w-full">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Gauge className="h-6 w-6 text-amber-500" />
            {t("analytics.mathematical.growthOperationalEfficiency.title")}
          </CardTitle>
          <CardDescription className="text-base">{t("analytics.mathematical.growthOperationalEfficiency.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Growth Metrics */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t("analytics.mathematical.growthOperationalEfficiency.growthVelocityMetrics")}</h4>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 bg-green-50 rounded-lg text-center">
                <div className="text-sm text-green-600 mb-2">{t("analytics.mathematical.growthOperationalEfficiency.dailyUserGrowthRate")}</div>
                <div className="text-3xl font-mono font-bold text-green-700">{safePercentage(effectiveMetrics.newUsers || 0, effectiveMetrics.activeUsers || 0).toFixed(2)}%</div>
                <div className="text-sm text-green-600">{t("analytics.mathematical.growthOperationalEfficiency.newUsersPerDay")}</div>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-blue-600 mb-2">{t("analytics.mathematical.growthOperationalEfficiency.volumeVelocity")}</div>
                <div className="text-3xl font-mono font-bold text-blue-700">{safeDivide(effectiveMetrics.totalVolume || 0, 24 * 60 * 60).toFixed(0)}</div>
                <div className="text-sm text-blue-600">{t("analytics.mathematical.growthOperationalEfficiency.xafPerSecond")}</div>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg text-center">
                <div className="text-sm text-purple-600 mb-2">{t("analytics.mathematical.growthOperationalEfficiency.transactionRate")}</div>
                <div className="text-3xl font-mono font-bold text-purple-700">{safeDivide(totalTransactions, 24).toFixed(1)}</div>
                <div className="text-sm text-purple-600">{t("analytics.mathematical.growthOperationalEfficiency.transactionsPerHour")}</div>
              </div>
            </div>
          </div>

          {/* Advanced Performance Indicators */}
          <div className="border-t pt-8">
            <h4 className="text-lg font-semibold mb-6">{t("analytics.mathematical.growthOperationalEfficiency.advancedPerformanceIndicators")}</h4>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-2">{t("analytics.mathematical.growthOperationalEfficiency.growthMomentumIndex")}</div>
                <div className="text-2xl font-mono font-bold text-green-700">
                  {(() => {
                    const momentum =
                      safeDivide(effectiveMetrics.newUsers || 0, effectiveMetrics.activeUsers || 0) *
                      safeDivide(overallSuccessRate, 100) *
                      safeDivide(effectiveMetrics.netRevenue || 0, 1000)
                    return momentum.toFixed(2)
                  })()}
                </div>
                <div className="text-sm text-gray-600 mt-1">{t("analytics.mathematical.growthOperationalEfficiency.compositeGrowthIndicator")}</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-2">{t("analytics.mathematical.growthOperationalEfficiency.riskAssessmentScore")}</div>
                <div className="text-2xl font-mono font-bold text-orange-700">
                  {(() => {
                    const riskScore = safeDivide(effectiveMetrics.failureRate || 0, 100) * safeDivide(effectiveMetrics.errorsCount || 0, totalTransactions) * 100
                    return riskScore.toFixed(3)
                  })()}
                </div>
                <div className="text-sm text-gray-600 mt-1">{t("analytics.mathematical.growthOperationalEfficiency.operationalRiskLevel")}</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-2">{t("analytics.mathematical.growthOperationalEfficiency.platformStabilityIndex")}</div>
                <div className="text-2xl font-mono font-bold text-purple-700">
                  {(() => {
                    const stabilityIndex = safeDivide(overallSuccessRate, 100) * (1 - safeDivide(effectiveMetrics.failureRate || 0, 100)) * 100
                    return stabilityIndex.toFixed(1)
                  })()}
                  %
                </div>
                <div className="text-sm text-gray-600 mt-1">{t("analytics.mathematical.growthOperationalEfficiency.overallSystemStability")}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
