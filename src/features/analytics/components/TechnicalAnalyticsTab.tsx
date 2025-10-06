import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { Server, AlertTriangle, Activity, Zap, TrendingDown, TrendingUp, CheckCircle, XCircle, Loader } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto } from "@/shared/api/types.gen"

interface TechnicalAnalyticsTabProps {
  metrics: DailyMetricDto[]
  currentMetrics?: DailyMetricDto
  isLoading?: boolean
}

interface TechnicalMetrics {
  date: string
  dayOfWeek: string
  totalApiCalls: number
  errorCount: number
  errorRate: number
}

const chartConfig = {
  apiCalls: { label: "API Calls", color: "hsl(var(--chart-1))" },
  errors: { label: "Errors", color: "hsl(var(--chart-2))" },
  errorRate: { label: "Error Rate", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

export default function TechnicalAnalyticsTab({ metrics, currentMetrics, isLoading = false }: TechnicalAnalyticsTabProps) {
  const { t } = useTranslation()

  // Convert real metrics to technical data - only use real data, no fake data
  const technicalData: TechnicalMetrics[] = useMemo(() => {
    return metrics.map((metric) => ({
      date: metric.metricDate,
      dayOfWeek: new Date(metric.metricDate).toLocaleDateString("en-US", { weekday: "short" }),
      totalApiCalls: metric.apiCallsCount,
      errorCount: metric.errorsCount,
      errorRate: metric.failureRate,
    }))
  }, [metrics])

  // Analysis calculations - only use real data
  const analysis = useMemo(() => {
    if (technicalData.length === 0) return null

    const sortedByApiCalls = [...technicalData].sort((a, b) => b.totalApiCalls - a.totalApiCalls)
    const sortedByErrors = [...technicalData].sort((a, b) => b.errorCount - a.errorCount)
    const sortedByErrorRate = [...technicalData].sort((a, b) => b.errorRate - a.errorRate)

    const totalApiCalls = technicalData.reduce((sum, day) => sum + day.totalApiCalls, 0)
    const totalErrors = technicalData.reduce((sum, day) => sum + day.errorCount, 0)
    const avgErrorRate = technicalData.reduce((sum, day) => sum + day.errorRate, 0) / technicalData.length

    return {
      busiestDay: sortedByApiCalls[0],
      quietestDay: sortedByApiCalls[technicalData.length - 1],
      worstErrorDay: sortedByErrors[0],
      bestErrorDay: sortedByErrors[technicalData.length - 1],
      highestErrorRateDay: sortedByErrorRate[0],
      lowestErrorRateDay: sortedByErrorRate[technicalData.length - 1],
      totalApiCalls,
      totalErrors,
      avgErrorRate,
      overallErrorRate: totalApiCalls > 0 ? (totalErrors / totalApiCalls) * 100 : 0,
    }
  }, [technicalData])

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">{t("analytics.noData")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Technical KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.technical.overview.totalApiCalls")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analysis.totalApiCalls.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {t("analytics.technical.overview.weeklyTotal")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.technical.overview.totalErrors")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analysis.totalErrors.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <XCircle className="h-3 w-3 text-red-600" />
                  {t("analytics.technical.overview.errors")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.technical.overview.errorRate")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analysis.overallErrorRate.toFixed(2)}%</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  {t("analytics.technical.overview.avgRate")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.technical.overview.avgErrorRate")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analysis.avgErrorRate.toFixed(2)}%</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 text-green-600" />
                  {t("analytics.technical.overview.daily")}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technical Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("analytics.technical.charts.apiCalls.title")}
            </CardTitle>
            <CardDescription>{t("analytics.technical.charts.apiCalls.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={technicalData}>
                <defs>
                  <linearGradient id="fillApiCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayOfWeek" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${Number(value).toLocaleString()}`, "API Calls"]} />} />
                <Area dataKey="totalApiCalls" type="monotone" fill="url(#fillApiCalls)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t("analytics.technical.charts.errorRate.title")}
            </CardTitle>
            <CardDescription>{t("analytics.technical.charts.errorRate.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={technicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayOfWeek" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${Number(value).toFixed(2)}%`, "Error Rate"]} />} />
                <Line dataKey="errorRate" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ fill: "hsl(var(--chart-2))" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              {t("analytics.technical.charts.responseTime.title")}
            </CardTitle>
            <CardDescription>{t("analytics.technical.charts.responseTime.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={technicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayOfWeek" />
                <YAxis tickFormatter={(value) => `${value}ms`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${Number(value).toFixed(0)}ms`, "Response Time"]} />} />
                <Bar dataKey="avgResponseTime" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {t("analytics.technical.charts.uptime.title")}
            </CardTitle>
            <CardDescription>{t("analytics.technical.charts.uptime.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={technicalData}>
                <defs>
                  <linearGradient id="fillUptime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayOfWeek" />
                <YAxis domain={[95, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${Number(value).toFixed(2)}%`, "Uptime"]} />} />
                <Area dataKey="uptime" type="monotone" fill="url(#fillUptime)" stroke="hsl(var(--chart-4))" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Analysis Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peak Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t("analytics.technical.analysis.peakPerformance.title")}
            </CardTitle>
            <CardDescription>{t("analytics.technical.analysis.peakPerformance.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("analytics.technical.analysis.busiestDay")}</div>
                    <div className="text-sm text-muted-foreground">{analysis.busiestDay.dayOfWeek}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{analysis.busiestDay.totalApiCalls.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{t("analytics.technical.analysis.apiCalls")}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("analytics.technical.analysis.fastestDay")}</div>
                    <div className="text-sm text-muted-foreground">{analysis.fastestDay.dayOfWeek}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{analysis.fastestDay.avgResponseTime.toFixed(0)}ms</div>
                    <div className="text-xs text-muted-foreground">{t("analytics.technical.analysis.avgResponse")}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("analytics.technical.analysis.bestUptimeDay")}</div>
                    <div className="text-sm text-muted-foreground">{analysis.leastDowntimeDay.dayOfWeek}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{analysis.leastDowntimeDay.uptime.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">{t("analytics.technical.analysis.uptime")}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues and Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              {t("analytics.technical.analysis.issues.title")}
            </CardTitle>
            <CardDescription>{t("analytics.technical.analysis.issues.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("analytics.technical.analysis.worstErrorDay")}</div>
                    <div className="text-sm text-muted-foreground">{analysis.worstErrorDay.dayOfWeek}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{analysis.worstErrorDay.errorCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {analysis.worstErrorDay.errorRate.toFixed(2)}% {t("analytics.technical.analysis.errorRate")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("analytics.technical.analysis.slowestDay")}</div>
                    <div className="text-sm text-muted-foreground">{analysis.slowestDay.dayOfWeek}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{analysis.slowestDay.avgResponseTime.toFixed(0)}ms</div>
                    <div className="text-xs text-muted-foreground">{t("analytics.technical.analysis.avgResponse")}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("analytics.technical.analysis.mostDowntimeDay")}</div>
                    <div className="text-sm text-muted-foreground">{analysis.mostDowntimeDay.dayOfWeek}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600">{analysis.mostDowntimeDay.downtime.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">{t("analytics.technical.analysis.downtime")}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-500" />
            {t("analytics.technical.summary.title")}
          </CardTitle>
          <CardDescription>{t("analytics.technical.summary.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">{t("analytics.technical.summary.day")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.technical.summary.apiCalls")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.technical.summary.errors")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.technical.summary.errorRate")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.technical.summary.responseTime")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.technical.summary.uptime")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.technical.summary.status")}</th>
                </tr>
              </thead>
              <tbody>
                {technicalData.map((day, index) => (
                  <tr key={day.date} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{day.dayOfWeek}</td>
                    <td className="p-2 text-right font-mono">{day.totalApiCalls.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono">{day.errorCount.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono">{day.errorRate.toFixed(2)}%</td>
                    <td className="p-2 text-right font-mono">{day.avgResponseTime.toFixed(0)}ms</td>
                    <td className="p-2 text-right font-mono">{day.uptime.toFixed(2)}%</td>
                    <td className="p-2 text-right">
                      <Badge
                        variant="outline"
                        className={
                          day.uptime >= 99.5 && day.errorRate < 1
                            ? "bg-green-50 text-green-600"
                            : day.uptime >= 99 && day.errorRate < 2
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-red-50 text-red-600"
                        }
                      >
                        {day.uptime >= 99.5 && day.errorRate < 1
                          ? t("analytics.technical.summary.excellent")
                          : day.uptime >= 99 && day.errorRate < 2
                            ? t("analytics.technical.summary.good")
                            : t("analytics.technical.summary.issues")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
