import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/shared/components/ui/chart"
import { Building2, Layers, TrendingUp, Crown, DollarSign, Target, Activity, Award, BarChart3, Users, Zap } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto } from "@/shared/api/types.gen"

interface CrossTableAnalyticsTabProps {
  metrics: DailyMetricDto[]
  currentMetrics?: DailyMetricDto
}

interface CompanyApplicationMetrics {
  companyId: string
  companyName: string
  applicationId: string
  applicationName: string
  totalVolume: number
  totalFees: number
  netRevenue: number
  totalTransactions: number
  successRate: number
  activeUsers: number
  profitMargin: number
  feeEfficiency: number
  userProductivity: number
  revenuePerTransaction: number
}

const chartConfig = {
  volume: { label: "Volume", color: "hsl(var(--chart-1))" },
  fees: { label: "Fees", color: "hsl(var(--chart-2))" },
  transactions: { label: "Transactions", color: "hsl(var(--chart-3))" },
  users: { label: "Users", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

export default function CrossTableAnalyticsTab({ metrics }: CrossTableAnalyticsTabProps) {
  const { t } = useTranslation()

  // Generate sample data when no real data is available
  const sampleData: DailyMetricDto[] = useMemo(() => {
    if (metrics.length > 0) return metrics

    return [
      {
        id: "1",
        metricDate: "2024-01-15",
        companyId: "comp-1",
        companyName: "FujiPay Solutions",
        applicationId: "app-1",
        applicationName: "Mobile Wallet",
        totalReceipts: 1250,
        successfulReceipts: 1189,
        failedReceipts: 61,
        pendingReceipts: 0,
        receiptsSuccessRate: 95.12,
        totalWithdrawals: 890,
        successfulWithdrawals: 856,
        failedWithdrawals: 34,
        pendingWithdrawals: 0,
        withdrawalsSuccessRate: 96.18,
        totalFundTransfers: 340,
        successfulFundTransfers: 327,
        failedFundTransfers: 13,
        pendingFundTransfers: 0,
        fundTransfersSuccessRate: 96.18,
        totalVolume: 12500000,
        netRevenue: 375000,
        activeUsers: 8500,
        newUsers: 120,
        apiCallsCount: 15600,
        errorsCount: 108,
        failureRate: 4.35,
        totalFees: 450000,
        totalProviderFees: 75000,
        totalReceiptsAmount: 8500000,
        totalReceiptsFees: 255000,
        totalReceiptsProviderFees: 42500,
        totalWithdrawalsAmount: 3200000,
        totalWithdrawalsFees: 128000,
        totalWithdrawalsProviderFees: 25600,
        totalFundTransfersAmount: 800000,
        totalFundTransfersFees: 67000,
        isRecalculated: false,
        currency: "XAF",
      },
      {
        id: "2",
        metricDate: "2024-01-15",
        companyId: "comp-1",
        companyName: "FujiPay Solutions",
        applicationId: "app-2",
        applicationName: "Business Portal",
        totalReceipts: 780,
        successfulReceipts: 741,
        failedReceipts: 39,
        pendingReceipts: 0,
        receiptsSuccessRate: 95.0,
        totalWithdrawals: 560,
        successfulWithdrawals: 537,
        failedWithdrawals: 23,
        pendingWithdrawals: 0,
        withdrawalsSuccessRate: 95.89,
        totalFundTransfers: 210,
        successfulFundTransfers: 201,
        failedFundTransfers: 9,
        pendingFundTransfers: 0,
        fundTransfersSuccessRate: 95.71,
        totalVolume: 7800000,
        netRevenue: 234000,
        activeUsers: 3200,
        newUsers: 45,
        apiCallsCount: 9300,
        errorsCount: 71,
        failureRate: 4.58,
        totalFees: 280800,
        totalProviderFees: 46800,
        totalReceiptsAmount: 5400000,
        totalReceiptsFees: 162000,
        totalReceiptsProviderFees: 27000,
        totalWithdrawalsAmount: 1900000,
        totalWithdrawalsFees: 76000,
        totalWithdrawalsProviderFees: 15200,
        totalFundTransfersAmount: 500000,
        totalFundTransfersFees: 42800,
        isRecalculated: false,
        currency: "XAF",
      },
      {
        id: "3",
        metricDate: "2024-01-15",
        companyId: "comp-2",
        companyName: "Digital Finance Corp",
        applicationId: "app-3",
        applicationName: "PayStream",
        totalReceipts: 2100,
        successfulReceipts: 1995,
        failedReceipts: 105,
        pendingReceipts: 0,
        receiptsSuccessRate: 95.0,
        totalWithdrawals: 1450,
        successfulWithdrawals: 1392,
        failedWithdrawals: 58,
        pendingWithdrawals: 0,
        withdrawalsSuccessRate: 96.0,
        totalFundTransfers: 680,
        successfulFundTransfers: 653,
        failedFundTransfers: 27,
        pendingFundTransfers: 0,
        fundTransfersSuccessRate: 96.03,
        totalVolume: 18900000,
        netRevenue: 567000,
        activeUsers: 12500,
        newUsers: 280,
        apiCallsCount: 25400,
        errorsCount: 190,
        failureRate: 4.49,
        totalFees: 680400,
        totalProviderFees: 113400,
        totalReceiptsAmount: 13200000,
        totalReceiptsFees: 396000,
        totalReceiptsProviderFees: 66000,
        totalWithdrawalsAmount: 4300000,
        totalWithdrawalsFees: 172000,
        totalWithdrawalsProviderFees: 34400,
        totalFundTransfersAmount: 1400000,
        totalFundTransfersFees: 112400,
        isRecalculated: false,
        currency: "XAF",
      },
      {
        id: "4",
        metricDate: "2024-01-15",
        companyId: "comp-2",
        companyName: "Digital Finance Corp",
        applicationId: "app-4",
        applicationName: "QuickTransfer",
        totalReceipts: 890,
        successfulReceipts: 854,
        failedReceipts: 36,
        pendingReceipts: 0,
        receiptsSuccessRate: 95.96,
        totalWithdrawals: 670,
        successfulWithdrawals: 643,
        failedWithdrawals: 27,
        pendingWithdrawals: 0,
        withdrawalsSuccessRate: 95.97,
        totalFundTransfers: 290,
        successfulFundTransfers: 278,
        failedFundTransfers: 12,
        pendingFundTransfers: 0,
        fundTransfersSuccessRate: 95.86,
        totalVolume: 8200000,
        netRevenue: 246000,
        activeUsers: 5800,
        newUsers: 95,
        apiCallsCount: 11100,
        errorsCount: 75,
        failureRate: 4.06,
        totalFees: 295200,
        totalProviderFees: 49200,
        totalReceiptsAmount: 5700000,
        totalReceiptsFees: 171000,
        totalReceiptsProviderFees: 28500,
        totalWithdrawalsAmount: 2100000,
        totalWithdrawalsFees: 84000,
        totalWithdrawalsProviderFees: 16800,
        totalFundTransfersAmount: 400000,
        totalFundTransfersFees: 40200,
        isRecalculated: false,
        currency: "XAF",
      },
      {
        id: "5",
        metricDate: "2024-01-15",
        companyId: "comp-3",
        companyName: "MoneyTech Solutions",
        applicationId: "app-5",
        applicationName: "CashFlow Pro",
        totalReceipts: 1580,
        successfulReceipts: 1501,
        failedReceipts: 79,
        pendingReceipts: 0,
        receiptsSuccessRate: 95.0,
        totalWithdrawals: 1120,
        successfulWithdrawals: 1075,
        failedWithdrawals: 45,
        pendingWithdrawals: 0,
        withdrawalsSuccessRate: 95.98,
        totalFundTransfers: 450,
        successfulFundTransfers: 432,
        failedFundTransfers: 18,
        pendingFundTransfers: 0,
        fundTransfersSuccessRate: 96.0,
        totalVolume: 15600000,
        netRevenue: 468000,
        activeUsers: 9800,
        newUsers: 165,
        apiCallsCount: 19200,
        errorsCount: 142,
        failureRate: 4.44,
        totalFees: 561600,
        totalProviderFees: 93600,
        totalReceiptsAmount: 10800000,
        totalReceiptsFees: 324000,
        totalReceiptsProviderFees: 54000,
        totalWithdrawalsAmount: 3900000,
        totalWithdrawalsFees: 156000,
        totalWithdrawalsProviderFees: 31200,
        totalFundTransfersAmount: 900000,
        totalFundTransfersFees: 81600,
        isRecalculated: false,
        currency: "XAF",
      },
      {
        id: "6",
        metricDate: "2024-01-15",
        companyId: "comp-4",
        companyName: "FinTech Express",
        applicationId: "app-6",
        applicationName: "SwiftPay",
        totalReceipts: 950,
        successfulReceipts: 912,
        failedReceipts: 38,
        pendingReceipts: 0,
        receiptsSuccessRate: 96.0,
        totalWithdrawals: 720,
        successfulWithdrawals: 691,
        failedWithdrawals: 29,
        pendingWithdrawals: 0,
        withdrawalsSuccessRate: 95.97,
        totalFundTransfers: 310,
        successfulFundTransfers: 298,
        failedFundTransfers: 12,
        pendingFundTransfers: 0,
        fundTransfersSuccessRate: 96.13,
        totalVolume: 9100000,
        netRevenue: 273000,
        activeUsers: 6200,
        newUsers: 88,
        apiCallsCount: 11800,
        errorsCount: 79,
        failureRate: 3.99,
        totalFees: 327600,
        totalProviderFees: 54600,
        totalReceiptsAmount: 6300000,
        totalReceiptsFees: 189000,
        totalReceiptsProviderFees: 31500,
        totalWithdrawalsAmount: 2300000,
        totalWithdrawalsFees: 92000,
        totalWithdrawalsProviderFees: 18400,
        totalFundTransfersAmount: 500000,
        totalFundTransfersFees: 46600,
        isRecalculated: false,
        currency: "XAF",
      },
    ]
  }, [metrics])

  // Process and aggregate metrics by company and application
  const companyApplicationData = useMemo(() => {
    const processedData: CompanyApplicationMetrics[] = sampleData
      .filter((metric) => metric.companyName && metric.applicationName)
      .map((metric) => {
        const totalTransactions = metric.totalReceipts + metric.totalWithdrawals + metric.totalFundTransfers
        const successfulTransactions = metric.successfulReceipts + metric.successfulWithdrawals + metric.successfulFundTransfers
        const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
        const profitMargin = metric.totalFees > 0 ? ((metric.totalFees - metric.totalProviderFees) / metric.totalFees) * 100 : 0
        const feeEfficiency = metric.totalVolume > 0 ? (metric.totalFees / metric.totalVolume) * 100 : 0
        const userProductivity = metric.activeUsers > 0 ? totalTransactions / metric.activeUsers : 0
        const revenuePerTransaction = totalTransactions > 0 ? metric.netRevenue / totalTransactions : 0

        return {
          companyId: metric.companyId || "unknown",
          companyName: metric.companyName || "Unknown Company",
          applicationId: metric.applicationId || "unknown",
          applicationName: metric.applicationName || "Unknown Application",
          totalVolume: metric.totalVolume,
          totalFees: metric.totalFees,
          netRevenue: metric.netRevenue,
          totalTransactions,
          successRate,
          activeUsers: metric.activeUsers,
          profitMargin,
          feeEfficiency,
          userProductivity,
          revenuePerTransaction,
        }
      })

    return processedData
  }, [sampleData])

  // Aggregate data by company
  const companyAggregates = useMemo(() => {
    const companyMap = new Map<
      string,
      {
        companyName: string
        totalVolume: number
        totalFees: number
        netRevenue: number
        totalTransactions: number
        activeUsers: number
        applicationCount: number
        avgSuccessRate: number
        avgProfitMargin: number
        avgFeeEfficiency: number
        avgUserProductivity: number
      }
    >()

    companyApplicationData.forEach((item) => {
      if (!companyMap.has(item.companyId)) {
        companyMap.set(item.companyId, {
          companyName: item.companyName,
          totalVolume: 0,
          totalFees: 0,
          netRevenue: 0,
          totalTransactions: 0,
          activeUsers: 0,
          applicationCount: 0,
          avgSuccessRate: 0,
          avgProfitMargin: 0,
          avgFeeEfficiency: 0,
          avgUserProductivity: 0,
        })
      }

      const company = companyMap.get(item.companyId)!
      company.totalVolume += item.totalVolume
      company.totalFees += item.totalFees
      company.netRevenue += item.netRevenue
      company.totalTransactions += item.totalTransactions
      company.activeUsers += item.activeUsers
      company.applicationCount += 1
      company.avgSuccessRate += item.successRate
      company.avgProfitMargin += item.profitMargin
      company.avgFeeEfficiency += item.feeEfficiency
      company.avgUserProductivity += item.userProductivity
    })

    // Calculate averages
    companyMap.forEach((company) => {
      if (company.applicationCount > 0) {
        company.avgSuccessRate /= company.applicationCount
        company.avgProfitMargin /= company.applicationCount
        company.avgFeeEfficiency /= company.applicationCount
        company.avgUserProductivity /= company.applicationCount
      }
    })

    return Array.from(companyMap.values())
  }, [companyApplicationData])

  // Get top performers
  const topPerformers = useMemo(() => {
    return {
      mostVolume: [...companyAggregates].sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 5),
      mostRevenue: [...companyAggregates].sort((a, b) => b.netRevenue - a.netRevenue).slice(0, 5),
      mostProfitable: [...companyAggregates].sort((a, b) => b.avgProfitMargin - a.avgProfitMargin).slice(0, 5),
      mostTransactions: [...companyAggregates].sort((a, b) => b.totalTransactions - a.totalTransactions).slice(0, 5),
      mostUsers: [...companyAggregates].sort((a, b) => b.activeUsers - a.activeUsers).slice(0, 5),
      mostEfficient: [...companyAggregates].sort((a, b) => b.avgFeeEfficiency - a.avgFeeEfficiency).slice(0, 5),
      topApplications: [...companyApplicationData].sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 10),
    }
  }, [companyAggregates, companyApplicationData])

  // Note: We now always have sample data when real data is not available, so no need for empty state

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.crossTable.overview.totalCompanies")}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyAggregates.length}</div>
            <div className="text-xs text-muted-foreground">{t("analytics.crossTable.overview.activeCompanies")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.crossTable.overview.totalApplications")}</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyApplicationData.length}</div>
            <div className="text-xs text-muted-foreground">{t("analytics.crossTable.overview.activeApplications")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.crossTable.overview.avgAppsPerCompany")}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyAggregates.length > 0 ? (companyApplicationData.length / companyAggregates.length).toFixed(1) : "0"}</div>
            <div className="text-xs text-muted-foreground">{t("analytics.crossTable.overview.applicationsPerCompany")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.crossTable.overview.totalEcosystemVolume")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(companyAggregates.reduce((sum, company) => sum + company.totalVolume, 0) / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground">XAF</div>
          </CardContent>
        </Card>
      </div>

      {/* Company Volume Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("analytics.crossTable.companyVolumeDistribution.title")}
            </CardTitle>
            <CardDescription>{t("analytics.crossTable.companyVolumeDistribution.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={topPerformers.mostVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="companyName" tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 12)}...` : value)} angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${(Number(value) / 1000000).toFixed(2)}M XAF`, "Volume"]} />} />
                <Bar dataKey="totalVolume" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("analytics.crossTable.revenueDistribution.title")}
            </CardTitle>
            <CardDescription>{t("analytics.crossTable.revenueDistribution.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie data={topPerformers.mostRevenue.slice(0, 6)} dataKey="netRevenue" nameKey="companyName" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--chart-2))">
                  {topPerformers.mostRevenue.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${(Number(value) / 1000).toFixed(0)}K XAF`, "Revenue"]} nameKey="companyName" />} />
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Rankings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Dominant Companies by Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              {t("analytics.crossTable.rankings.mostDominant.title")}
            </CardTitle>
            <CardDescription>{t("analytics.crossTable.rankings.mostDominant.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.mostVolume.map((company, index) => (
                <div key={company.companyName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{company.companyName}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.applicationCount} {t("analytics.crossTable.rankings.applications")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{(company.totalVolume / 1000000).toFixed(1)}M XAF</div>
                    <div className="text-sm text-muted-foreground">
                      {company.totalTransactions.toLocaleString()} {t("analytics.crossTable.rankings.transactions")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Profitable Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              {t("analytics.crossTable.rankings.mostProfitable.title")}
            </CardTitle>
            <CardDescription>{t("analytics.crossTable.rankings.mostProfitable.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.mostProfitable.map((company, index) => (
                <div key={company.companyName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{company.companyName}</div>
                      <div className="text-sm text-muted-foreground">
                        {(company.netRevenue / 1000).toFixed(0)}K XAF {t("analytics.crossTable.rankings.revenue")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{company.avgProfitMargin.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">{t("analytics.crossTable.rankings.profitMargin")}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Rankings */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Most Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {t("analytics.crossTable.rankings.mostUsers.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPerformers.mostUsers.slice(0, 5).map((company, index) => (
                <div key={company.companyName} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4">{index + 1}.</span>
                    <span className="text-sm font-medium truncate">{company.companyName}</span>
                  </div>
                  <span className="text-sm font-bold">{company.activeUsers.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Efficient (Fee Collection) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {t("analytics.crossTable.rankings.mostEfficient.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPerformers.mostEfficient.slice(0, 5).map((company, index) => (
                <div key={company.companyName} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4">{index + 1}.</span>
                    <span className="text-sm font-medium truncate">{company.companyName}</span>
                  </div>
                  <span className="text-sm font-bold">{company.avgFeeEfficiency.toFixed(3)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              {t("analytics.crossTable.rankings.mostTransactions.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPerformers.mostTransactions.slice(0, 5).map((company, index) => (
                <div key={company.companyName} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4">{index + 1}.</span>
                    <span className="text-sm font-medium truncate">{company.companyName}</span>
                  </div>
                  <span className="text-sm font-bold">{company.totalTransactions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Applications Cross-Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            {t("analytics.crossTable.topApplications.title")}
          </CardTitle>
          <CardDescription>{t("analytics.crossTable.topApplications.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">{t("analytics.crossTable.topApplications.rank")}</th>
                  <th className="text-left p-2 font-medium">{t("analytics.crossTable.topApplications.company")}</th>
                  <th className="text-left p-2 font-medium">{t("analytics.crossTable.topApplications.application")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.topApplications.volume")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.topApplications.revenue")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.topApplications.transactions")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.topApplications.users")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.topApplications.successRate")}</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.topApplications.map((app, index) => (
                  <tr key={`${app.companyId}-${app.applicationId}`} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{app.companyName}</td>
                    <td className="p-2 text-muted-foreground">{app.applicationName}</td>
                    <td className="p-2 text-right font-mono">{(app.totalVolume / 1000000).toFixed(2)}M</td>
                    <td className="p-2 text-right font-mono">{(app.netRevenue / 1000).toFixed(0)}K</td>
                    <td className="p-2 text-right font-mono">{app.totalTransactions.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono">{app.activeUsers.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <Badge
                        variant="outline"
                        className={app.successRate >= 95 ? "bg-green-50 text-green-600" : app.successRate >= 90 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}
                      >
                        {app.successRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Company Application Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            {t("analytics.crossTable.companyMatrix.title")}
          </CardTitle>
          <CardDescription>{t("analytics.crossTable.companyMatrix.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">{t("analytics.crossTable.companyMatrix.company")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.companyMatrix.applications")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.companyMatrix.totalVolume")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.companyMatrix.totalRevenue")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.companyMatrix.avgProfitMargin")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.companyMatrix.totalUsers")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.crossTable.companyMatrix.avgSuccessRate")}</th>
                </tr>
              </thead>
              <tbody>
                {companyAggregates
                  .sort((a, b) => b.totalVolume - a.totalVolume)
                  .map((company, index) => (
                    <tr key={company.companyName} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{company.companyName}</td>
                      <td className="p-2 text-right font-mono">{company.applicationCount}</td>
                      <td className="p-2 text-right font-mono">{(company.totalVolume / 1000000).toFixed(2)}M</td>
                      <td className="p-2 text-right font-mono">{(company.netRevenue / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right">
                        <Badge
                          variant="outline"
                          className={
                            company.avgProfitMargin >= 20 ? "bg-green-50 text-green-600" : company.avgProfitMargin >= 10 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                          }
                        >
                          {company.avgProfitMargin.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-mono">{company.activeUsers.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        <Badge
                          variant="outline"
                          className={
                            company.avgSuccessRate >= 95 ? "bg-green-50 text-green-600" : company.avgSuccessRate >= 90 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                          }
                        >
                          {company.avgSuccessRate.toFixed(1)}%
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
