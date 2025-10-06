import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/shared/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { DollarSign, Target, Clock, Users, Cog, ArrowDownCircle, Loader } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto } from "@/shared/api/types.gen"

interface FinancialAnalyticsTabProps {
  metrics: DailyMetricDto[]
  currentMetrics?: DailyMetricDto
  totalTransactions: number
  profitMargin: number
  isLoading?: boolean
}

// Chart configurations
const revenueChartConfig = {
  totalFees: { label: "Total Fees", color: "hsl(var(--chart-1))" },
  totalProviderFees: { label: "Provider Fees", color: "hsl(var(--chart-2))" },
  netRevenue: { label: "Net Revenue", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

export default function FinancialAnalyticsTab({ metrics, currentMetrics, totalTransactions, profitMargin, isLoading = false }: FinancialAnalyticsTabProps) {
  const { t } = useTranslation()

  // Helper function to safely calculate percentages
  const safePercentage = (numerator: number, denominator: number): string => {
    if (!denominator || denominator === 0) return "0.0"
    return ((numerator / denominator) * 100).toFixed(1)
  }

  // Helper function to safely calculate division
  const safeDivision = (numerator: number, denominator: number): string => {
    if (!denominator || denominator === 0) return "0"
    return (numerator / denominator).toFixed(0)
  }

  // Create default values when no data is available
  const defaultMetrics = {
    totalVolume: 0,
    totalFees: 0,
    totalProviderFees: 0,
    netRevenue: 0,
    activeUsers: 0,
    apiCallsCount: 0,
    totalReceipts: 0,
    totalWithdrawals: 0,
    totalFundTransfers: 0,
    totalReceiptsAmount: 0,
    totalWithdrawalsAmount: 0,
    totalFundTransfersAmount: 0,
    totalReceiptsFees: 0,
    totalWithdrawalsFees: 0,
    totalFundTransfersFees: 0,
  }

  const effectiveMetrics = currentMetrics || defaultMetrics
  const effectiveMetricsArray = metrics.length > 0 ? metrics : []

  return (
    <div className="space-y-6 pb-6">
      {/* Cost-Benefit Analysis */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("analytics.financial.costBenefit.costEfficiency")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {safePercentage(effectiveMetrics.totalFees - effectiveMetrics.totalProviderFees, effectiveMetrics.totalProviderFees)}%
                </div>
                <p className="text-sm text-muted-foreground">{t("analytics.financial.costBenefit.costToProfitRatio")}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t("analytics.financial.costBenefit.revenueFocus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{safePercentage(effectiveMetrics.totalReceiptsFees, effectiveMetrics.totalFees)}%</div>
                <p className="text-sm text-muted-foreground">{t("analytics.financial.costBenefit.fromReceipts")}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("analytics.financial.costBenefit.processingCapacity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">{safeDivision(effectiveMetrics.apiCallsCount, 24)}</div>
                <p className="text-sm text-muted-foreground">{t("analytics.financial.costBenefit.apiCallsPerHour")}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("analytics.financial.costBenefit.userEconomics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{safeDivision(effectiveMetrics.netRevenue, effectiveMetrics.activeUsers)}</div>
                <p className="text-sm text-muted-foreground">{t("analytics.financial.costBenefit.revenuePerUser")}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown by Service */}
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.financial.revenueBreakdown.title")}</CardTitle>
          <CardDescription>{t("analytics.financial.revenueBreakdown.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 border border-foreground/10 bg-background rounded-lg">
              <div className="text-sm text-green-600 mb-2">{t("analytics.financial.revenueBreakdown.receipts")}</div>
              <div className="text-3xl font-bold text-green-700">{(effectiveMetrics.totalReceiptsFees / 1000).toFixed(0)}K</div>
              <div className="text-sm text-green-600 mt-1">
                {t("analytics.financial.revenueBreakdown.margin")}:{" "}
                {safePercentage(effectiveMetrics.totalReceiptsFees - effectiveMetrics.totalReceiptsProviderFees, effectiveMetrics.totalReceiptsFees)}%
              </div>
            </div>

            <div className="p-6 border border-foreground/10 bg-background rounded-lg">
              <div className="text-sm text-blue-600 mb-2">{t("analytics.financial.revenueBreakdown.withdrawals")}</div>
              <div className="text-3xl font-bold text-blue-700">{(effectiveMetrics.totalWithdrawalsFees / 1000).toFixed(0)}K</div>
              <div className="text-sm text-blue-600 mt-1">
                {t("analytics.financial.revenueBreakdown.margin")}:{" "}
                {safePercentage(effectiveMetrics.totalWithdrawalsFees - effectiveMetrics.totalWithdrawalsProviderFees, effectiveMetrics.totalWithdrawalsFees)}%
              </div>
            </div>

            <div className="p-6 border border-foreground/10 bg-background rounded-lg">
              <div className="text-sm text-purple-600 mb-2">{t("analytics.financial.revenueBreakdown.transfers")}</div>
              <div className="text-3xl font-bold text-purple-700">{(effectiveMetrics.totalFundTransfersFees / 1000).toFixed(0)}K</div>
              <div className="text-sm text-purple-600 mt-1">{t("analytics.financial.revenueBreakdown.margin")}: 100%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("analytics.financial.revenueAnalysis.title")}
            </CardTitle>
            <CardDescription>{t("analytics.financial.revenueAnalysis.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <AreaChart data={effectiveMetricsArray}>
                <defs>
                  <linearGradient id="fillTotalFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillProviderFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metricDate" tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${(Number(value) / 1000).toFixed(0)}K XAF`, ""]} />} />
                <Area dataKey="totalFees" type="monotone" fill="url(#fillTotalFees)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Area dataKey="totalProviderFees" type="monotone" fill="url(#fillProviderFees)" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <ChartLegend />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t("analytics.financial.profitability.title")}</CardTitle>
                <CardDescription>{t("analytics.financial.profitability.description")}</CardDescription>
              </div>
              <div className="text-right rounded">
                <div className="text-xl font-bold text-green-600">{profitMargin.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{t("analytics.financial.profitability.margin")}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-y-4">
                <div className="p-4 border border-foreground/5 rounded-lg">
                  <div className="text-sm mb-1 text-foreground/70">
                    <ArrowDownCircle className="h-4 w-4 inline mr-2" />
                    {t("analytics.financial.profitability.totalFees")}
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{(effectiveMetrics.totalFees / 1000).toFixed(0)}K XAF</div>
                </div>

                <div className="p-4 border border-foreground/5 rounded-lg">
                  <div className="text-sm mb-1 text-foreground/70">
                    <Cog className="h-4 w-4 inline mr-2" />
                    {t("analytics.financial.profitability.providerCosts")}
                  </div>
                  <div className="text-2xl font-bold text-red-700">{(effectiveMetrics.totalProviderFees / 1000).toFixed(0)}K XAF</div>
                </div>

                <div className="p-4 border border-foreground/5 rounded-lg">
                  <div className="text-sm 0 mb-1 text-foreground/70">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    {t("analytics.financial.profitability.netProfit")}
                  </div>
                  <div className="text-2xl font-bold text-green-700">{((effectiveMetrics.totalFees - effectiveMetrics.totalProviderFees) / 1000).toFixed(0)}K XAF</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
