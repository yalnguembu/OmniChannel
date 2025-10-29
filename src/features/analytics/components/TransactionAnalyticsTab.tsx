import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart, LabelList } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { BarChart3, Activity, Phone, TrendingUp, ArrowDown, ArrowUp, ArrowLeftRight, TrendingDown, Loader } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto, DailyMetricsByPaymentMethodDto } from "@/shared/api/types.gen"

interface TransactionAnalyticsTabProps {
  metrics: DailyMetricDto[]
  paymentMethodMetrics: DailyMetricsByPaymentMethodDto[]
  currentMetrics?: DailyMetricDto
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

// Chart configurations
const volumeChartConfig = {
  totalReceipts: { label: "Receipts", color: "hsl(var(--chart-1))" },
  totalWithdrawals: { label: "Withdrawals", color: "hsl(var(--chart-2))" },
  totalFundTransfers: { label: "Fund Transfers", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const successRateChartConfig = {
  receiptsSuccessRate: { label: "Receipts Success", color: "hsl(var(--chart-1))" },
  withdrawalsSuccessRate: { label: "Withdrawals Success", color: "hsl(var(--chart-2))" },
  fundTransfersSuccessRate: { label: "Fund Transfers Success", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const paymentMethodChartConfig = {
  transactionCount: { label: "Transactions", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

export default function TransactionAnalyticsTab({ metrics, paymentMethodMetrics, currentMetrics, isLoading = false }: TransactionAnalyticsTabProps) {
  const { t } = useTranslation()

  // Use empty arrays when no data available to show empty charts with 0 values
  const effectiveMetrics = metrics.length > 0 ? metrics : []
  const effectivePaymentMethodMetrics = paymentMethodMetrics.length > 0 ? paymentMethodMetrics : []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.transactions.totalVolume")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{safeDivide(currentMetrics?.totalVolume || 0, 1000000).toFixed(1)}M XAF</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="font-semibold">
                    {(currentMetrics?.totalReceipts || 0) + (currentMetrics?.totalWithdrawals || 0) + (currentMetrics?.totalFundTransfers || 0)}
                  </span>{" "}
                  {t("analytics.transactions.counts")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.transactions.receipts")}</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{safeDivide(currentMetrics?.totalReceiptsAmount || 0, 1000000).toFixed(1)}M XAF</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="font-semibold">{currentMetrics?.totalReceipts || 0}</span> {t("analytics.transactions.counts")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.transactions.withdrawals")}</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{safeDivide(currentMetrics?.totalWithdrawalsAmount || 0, 1000000).toFixed(1)}M XAF</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 text-orange-600" />
                  <span className="font-semibold">{currentMetrics?.totalWithdrawals || 0}</span> {t("analytics.transactions.counts")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.transactions.fundTransfers")}</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-500">{safeDivide(currentMetrics?.totalFundTransfersAmount || 0, 1000000).toFixed(1)}M XAF</div>
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

      {/* Transaction Performance Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("analytics.transactions.volumeByType.title")}
            </CardTitle>
            <CardDescription>{t("analytics.transactions.volumeByType.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volumeChartConfig} className="h-[300px]">
              <AreaChart data={effectiveMetrics}>
                <defs>
                  <linearGradient id="fillReceipts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillTransfers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metricDate" tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="totalReceipts" type="monotone" fill="url(#fillReceipts)" stroke="hsl(var(--chart-1))" strokeWidth={2} stackId="1" />
                <Area dataKey="totalWithdrawals" type="monotone" fill="url(#fillWithdrawals)" stroke="hsl(var(--chart-2))" strokeWidth={2} stackId="1" />
                <Area dataKey="totalFundTransfers" type="monotone" fill="url(#fillTransfers)" stroke="hsl(var(--chart-3))" strokeWidth={2} stackId="1" />
                <ChartLegend />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("analytics.transactions.successRateMonitoring.title")}
            </CardTitle>
            <CardDescription>{t("analytics.transactions.successRateMonitoring.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={successRateChartConfig} className="h-[300px]">
              <LineChart data={effectiveMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metricDate" tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis domain={[85, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]} />} />
                <Line type="monotone" dataKey="receiptsSuccessRate" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))" }} />
                <Line type="monotone" dataKey="withdrawalsSuccessRate" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
                <Line type="monotone" dataKey="fundTransfersSuccessRate" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-3))" }} />
                <ChartLegend />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Distribution */}
      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("analytics.transactions.paymentMethods.title")}
            </CardTitle>
            <CardDescription>{t("analytics.transactions.paymentMethods.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={paymentMethodChartConfig} className="h-[350px]">
              <PieChart>
                <Pie data={effectivePaymentMethodMetrics} dataKey="transactionCount" nameKey="paymentMethodName" cx="50%" cy="50%" outerRadius={100} fill="hsl(var(--chart-1))">
                  {effectivePaymentMethodMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                  <LabelList dataKey="transactionCount" position="outside" formatter={(value: number) => value.toLocaleString()} className="text-xs font-medium" />
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="paymentMethodName"
                      formatter={(value, name, props) => [`${Number(value).toLocaleString()} transactions`, props.payload?.paymentMethodName || name]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="space-y-1">
                              <p className="font-medium">{data.paymentMethodName}</p>
                              <p className="text-xs text-muted-foreground">Code: {data.paymentMethodCode || "N/A"}</p>
                            </div>
                          )
                        }
                        return label
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent nameKey="paymentMethodName" />} className="flex-wrap gap-2 text-xs" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">{t("analytics.transactions.paymentMethods.operatorDetails")}</CardTitle>
            <CardDescription>{t("analytics.transactions.paymentMethods.operatorDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid lg:grid-cols-2 gap-4">
            {effectivePaymentMethodMetrics.map((method, index) => (
              <div key={method.paymentMethodId || index} className="p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                  <h4 className="font-medium text-sm">{method.paymentMethodName || "Unknown Provider"}</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("analytics.transactions.paymentMethods.operatorCode")}:</span>
                    <span className="font-mono">{method.paymentMethodCode || "N/A"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("analytics.transactions.paymentMethods.transactions")}:</span>
                    <span className="font-bold">{method.transactionCount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("analytics.transactions.paymentMethods.successRate")}:</span>
                    <span className={`font-bold ${method.successRate >= 95 ? "text-green-600" : method.successRate >= 90 ? "text-yellow-600" : "text-red-600"}`}>
                      {method.successRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("analytics.transactions.paymentMethods.totalVolume")}:</span>
                    <span className="font-bold">{safeDivide(method.totalAmount, 1000000).toFixed(1)}M XAF</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("analytics.transactions.paymentMethods.avgAmount")}:</span>
                    <span className="font-mono">{(method.averageAmount || 0).toLocaleString()} XAF</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("analytics.transactions.paymentMethods.failures")}:</span>
                    <span className="text-red-600 font-medium">{method.failedTransactions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {effectivePaymentMethodMetrics.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">{t("analytics.transactions.paymentMethods.noOperators")}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("analytics.transactions.paymentMethods.performanceSummary")}
          </CardTitle>
          <CardDescription>{t("analytics.transactions.paymentMethods.performanceSummaryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">{t("analytics.transactions.paymentMethods.provider")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.transactions.paymentMethods.volume")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.transactions.paymentMethods.amount")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.transactions.paymentMethods.rate")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.transactions.paymentMethods.avgTicket")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.transactions.paymentMethods.marketShare")}</th>
                </tr>
              </thead>
              <tbody>
                {effectivePaymentMethodMetrics
                  .sort((a, b) => b.transactionCount - a.transactionCount)
                  .map((method, index) => {
                    const totalTransactions = effectivePaymentMethodMetrics.reduce((sum, m) => sum + m.transactionCount, 0)
                    const marketShare = safePercentage(method.transactionCount, totalTransactions)

                    return (
                      <tr key={method.paymentMethodId || index} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                            <div>
                              <div className="font-medium">{method.paymentMethodName || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{method.paymentMethodCode || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono">{method.transactionCount.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono">{safeDivide(method.totalAmount, 1000000).toFixed(1)}M</td>
                        <td className="p-2 text-right">
                          <span
                            className={`font-bold ${(method.successRate || 0) >= 95 ? "text-green-600" : (method.successRate || 0) >= 90 ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {(method.successRate || 0).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono">{safeDivide(method.averageAmount || 0, 1000).toFixed(1)}K</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${marketShare}%` }} />
                            </div>
                            <span className="text-xs font-medium w-10 text-right">{marketShare.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
