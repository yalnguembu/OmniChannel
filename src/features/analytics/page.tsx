import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Cell, Pie, PieChart, ResponsiveContainer, LabelList } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"
import { Badge } from "@/shared/components/ui/badge"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Percent,
  Users,
  AlertCircle,
  Phone,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { postApiDailyMetricSearch, postApiDailyMetricsByPaymentMethodSearch } from "@/shared/api/sdk.gen"

// Types based on schema.test.yml
interface DailyMetricDto {
  id?: string
  createdAt?: string
  companyId?: string | null
  applicationId?: string | null
  metricDate: string
  metricType?: string | null
  totalReceipts: number
  successfulReceipts: number
  failedReceipts: number
  pendingReceipts: number
  receiptsSuccessRate: number
  totalWithdrawals: number
  successfulWithdrawals: number
  failedWithdrawals: number
  pendingWithdrawals: number
  withdrawalsSuccessRate: number
  totalFundTransfers: number
  successfulFundTransfers: number
  failedFundTransfers: number
  pendingFundTransfers: number
  fundTransfersSuccessRate: number
  totalVolume: number
  netRevenue: number
  activeUsers: number
  newUsers: number
  apiCallsCount: number
  errorsCount: number
  failureRate: number
  companyName?: string | null
  applicationName?: string | null
  calculationDuration?: number | null
  isRecalculated: boolean
  recalculatedAt?: string | null
  currency?: string | null
  totalReceiptsAmount: number
  totalReceiptsFees: number
  totalReceiptsProviderFees: number
  totalWithdrawalsAmount: number
  totalWithdrawalsFees: number
  totalWithdrawalsProviderFees: number
  totalFundTransfersAmount: number
  totalFundTransfersFees: number
  totalFees: number
  totalProviderFees: number
}

interface DailyMetricsByPaymentMethodDto {
  id?: string
  createdAt?: string
  paymentMethodId: string
  companyId?: string | null
  applicationId?: string | null
  metricDate: string
  transactionCount: number
  successfulTransactions: number
  failedTransactions: number
  successRate: number
  paymentMethodName?: string | null
  paymentMethodCode?: string | null
  currency?: string | null
  totalAmount: number
  averageAmount: number
}

// Mock data using the actual schema structure
const mockDailyMetrics: DailyMetricDto[] = [
  {
    metricDate: "2025-01-01",
    totalReceipts: 1250,
    successfulReceipts: 1181,
    failedReceipts: 69,
    pendingReceipts: 0,
    receiptsSuccessRate: 94.5,
    totalWithdrawals: 890,
    successfulWithdrawals: 812,
    failedWithdrawals: 78,
    pendingWithdrawals: 0,
    withdrawalsSuccessRate: 91.2,
    totalFundTransfers: 320,
    successfulFundTransfers: 304,
    failedFundTransfers: 16,
    pendingFundTransfers: 0,
    fundTransfersSuccessRate: 95.0,
    totalVolume: 52600000,
    netRevenue: 375000,
    activeUsers: 1840,
    newUsers: 124,
    apiCallsCount: 2560,
    errorsCount: 147,
    failureRate: 5.7,
    totalReceiptsAmount: 25000000,
    totalReceiptsFees: 1250000,
    totalReceiptsProviderFees: 875000,
    totalWithdrawalsAmount: 17800000,
    totalWithdrawalsFees: 890000,
    totalWithdrawalsProviderFees: 623000,
    totalFundTransfersAmount: 9800000,
    totalFundTransfersFees: 320000,
    totalFees: 2460000,
    totalProviderFees: 1722000,
    currency: "XAF",
    isRecalculated: false,
  },
  {
    metricDate: "2025-01-02",
    totalReceipts: 1180,
    successfulReceipts: 1095,
    failedReceipts: 85,
    pendingReceipts: 0,
    receiptsSuccessRate: 92.8,
    totalWithdrawals: 920,
    successfulWithdrawals: 823,
    failedWithdrawals: 97,
    pendingWithdrawals: 0,
    withdrawalsSuccessRate: 89.5,
    totalFundTransfers: 280,
    successfulFundTransfers: 266,
    failedFundTransfers: 14,
    pendingFundTransfers: 0,
    fundTransfersSuccessRate: 95.0,
    totalVolume: 49200000,
    netRevenue: 354000,
    activeUsers: 1790,
    newUsers: 98,
    apiCallsCount: 2380,
    errorsCount: 182,
    failureRate: 7.6,
    totalReceiptsAmount: 23600000,
    totalReceiptsFees: 1180000,
    totalReceiptsProviderFees: 826000,
    totalWithdrawalsAmount: 18400000,
    totalWithdrawalsFees: 920000,
    totalWithdrawalsProviderFees: 644000,
    totalFundTransfersAmount: 7200000,
    totalFundTransfersFees: 280000,
    totalFees: 2380000,
    totalProviderFees: 1666000,
    currency: "XAF",
    isRecalculated: false,
  },
]

const mockPaymentMethodMetrics: DailyMetricsByPaymentMethodDto[] = [
  {
    paymentMethodId: "1",
    metricDate: "2025-01-01",
    transactionCount: 850,
    successfulTransactions: 803,
    failedTransactions: 47,
    successRate: 94.5,
    paymentMethodName: "MTN Mobile Money",
    paymentMethodCode: "MTN_MOMO",
    totalAmount: 15000000,
    averageAmount: 17647,
    currency: "XAF",
  },
  {
    paymentMethodId: "2",
    metricDate: "2025-01-01",
    transactionCount: 720,
    successfulTransactions: 669,
    failedTransactions: 51,
    successRate: 92.9,
    paymentMethodName: "Orange Money",
    paymentMethodCode: "OM",
    totalAmount: 12500000,
    averageAmount: 17361,
    currency: "XAF",
  },
  {
    paymentMethodId: "3",
    metricDate: "2025-01-01",
    transactionCount: 290,
    successfulTransactions: 275,
    failedTransactions: 15,
    successRate: 94.8,
    paymentMethodName: "Camtel Mobile Money",
    paymentMethodCode: "CAMTEL",
    totalAmount: 5200000,
    averageAmount: 17931,
    currency: "XAF",
  },
]

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

const revenueChartConfig = {
  totalFees: { label: "Total Fees", color: "hsl(var(--chart-1))" },
  totalProviderFees: { label: "Provider Fees", color: "hsl(var(--chart-2))" },
  netRevenue: { label: "Net Revenue", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const paymentMethodChartConfig = {
  transactionCount: { label: "Transactions", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState()
  const [timeRange, setTimeRange] = useState("7d")
  const [metrics, setMetrics] = useState<DailyMetricDto[]>(mockDailyMetrics)
  const [paymentMethodMetrics, setPaymentMethodMetrics] = useState<DailyMetricsByPaymentMethodDto[]>(mockPaymentMethodMetrics)

  const currentMetrics = metrics[0] || mockDailyMetrics[0]
  const totalTransactions = currentMetrics.totalReceipts + currentMetrics.totalWithdrawals + currentMetrics.totalFundTransfers
  const totalSuccessfulTransactions = currentMetrics.successfulReceipts + currentMetrics.successfulWithdrawals + currentMetrics.successfulFundTransfers
  const overallSuccessRate = (totalSuccessfulTransactions / totalTransactions) * 100
  const profitMargin = ((currentMetrics.totalFees - currentMetrics.totalProviderFees) / currentMetrics.totalFees) * 100

  useEffect(() => {
    // TODO: Uncomment when API is ready
    const fetchMetrics = async () => {
      try {
        const searchCriteria = {
          pageNumber: 1,
          pageSize: 30,
          ...(dateRange && {
            startDate: dateRange.from?.toISOString(),
            endDate: dateRange.to?.toISOString(),
          }),
        }

        const [metricsResponse, paymentMethodResponse] = await Promise.all([
          postApiDailyMetricSearch({
            body: searchCriteria,
          }),
          postApiDailyMetricsByPaymentMethodSearch({
            body: searchCriteria,
          }),
        ])

        if (metricsResponse.data?.items) {
          setMetrics(metricsResponse.data.items)
        }
        if (paymentMethodResponse.data?.items) {
          setPaymentMethodMetrics(paymentMethodResponse.data.items)
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchMetrics()
    
    // Using mock data for now
    // setMetrics(mockDailyMetrics)
    // setPaymentMethodMetrics(mockPaymentMethodMetrics)
  }, [dateRange, timeRange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Daily metrics and performance analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={timeRange} onValueChange={setTimeRange} variant="outline">
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 90 days</ToggleGroupItem>
          </ToggleGroup>
          <DateRangeInput
            size="sm"
            style="rounded-md h-8"
            dateFormat="short"
            placeholder="Select range"
            formField={{
              value: dateRange,
              name: "date-range",
              onChange: setDateRange,
            }}
          />
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(currentMetrics.totalVolume / 1000000).toFixed(1)}M XAF</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              Net revenue: {(currentMetrics.netRevenue / 1000).toFixed(0)}K XAF
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSuccessRate.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 text-orange-600" />
              Failure rate: {currentMetrics.failureRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 text-green-600" />
              Net: {((currentMetrics.totalFees - currentMetrics.totalProviderFees) / 1000).toFixed(0)}K XAF
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              New users: {currentMetrics.newUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Performance Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transaction Volume by Type
            </CardTitle>
            <CardDescription>Daily transaction counts across all service types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volumeChartConfig} className="h-[300px]">
              <AreaChart data={metrics}>
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
              Success Rate Monitoring
            </CardTitle>
            <CardDescription>Success rates by transaction type over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={successRateChartConfig} className="h-[300px]">
              <LineChart data={metrics}>
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

      {/* Financial Performance Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue & Fee Analysis
            </CardTitle>
            <CardDescription>Total fees vs provider costs with net revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <AreaChart data={metrics}>
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
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Transaction volume by payment provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={paymentMethodChartConfig} className="h-[300px]">
              <PieChart>
                <Pie data={paymentMethodMetrics} dataKey="transactionCount" nameKey="paymentMethodName" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--chart-1))">
                  {paymentMethodMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                  <LabelList dataKey="transactionCount" position="outside" formatter={(value: number) => value.toLocaleString()} />
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="paymentMethodName" />} />
                <ChartLegend content={<ChartLegendContent nameKey="paymentMethodName" />} className="flex-wrap gap-2 text-sm" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Breakdown</CardTitle>
            <CardDescription>Detailed transaction metrics by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                <div>Type</div>
                <div>Total</div>
                <div>Success</div>
                <div>Rate</div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 py-2">
                  <div className="font-medium">Receipts</div>
                  <div>{currentMetrics.totalReceipts.toLocaleString()}</div>
                  <div>{currentMetrics.successfulReceipts.toLocaleString()}</div>
                  <div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      {currentMetrics.receiptsSuccessRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 py-2">
                  <div className="font-medium">Withdrawals</div>
                  <div>{currentMetrics.totalWithdrawals.toLocaleString()}</div>
                  <div>{currentMetrics.successfulWithdrawals.toLocaleString()}</div>
                  <div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600">
                      {currentMetrics.withdrawalsSuccessRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 py-2">
                  <div className="font-medium">Fund Transfers</div>
                  <div>{currentMetrics.totalFundTransfers.toLocaleString()}</div>
                  <div>{currentMetrics.successfulFundTransfers.toLocaleString()}</div>
                  <div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-600">
                      {currentMetrics.fundTransfersSuccessRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method Performance</CardTitle>
            <CardDescription>Success rates and volumes by provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                <div>Provider</div>
                <div>Volume</div>
                <div>Amount</div>
                <div>Rate</div>
              </div>
              <div className="space-y-3">
                {paymentMethodMetrics.map((method) => (
                  <div key={method.paymentMethodId} className="grid grid-cols-4 gap-4 py-2">
                    <div className="font-medium">{method.paymentMethodName}</div>
                    <div>{method.transactionCount.toLocaleString()}</div>
                    <div>{(method.totalAmount / 1000000).toFixed(1)}M</div>
                    <div>
                      <Badge variant="outline" className="bg-green-50 text-green-600">
                        {method.successRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
