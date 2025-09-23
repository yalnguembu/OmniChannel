import { useState, useEffect, lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import sampleData from "./data.json"

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

// Lazy loaded tab components
const OverviewTab = lazy(() => import("./components/OverviewTabDashboard"))
const TransactionAnalyticsTab = lazy(() => import("./components/TransactionAnalyticsTab"))
const FinancialAnalyticsTab = lazy(() => import("./components/FinancialAnalyticsTab"))
const BusinessIntelligenceTab = lazy(() => import("./components/BusinessIntelligenceTab"))
const MathematicalAnalyticsTab = lazy(() => import("./components/MathematicalAnalyticsTab"))
const CrossTableAnalyticsTab = lazy(() => import("./components/CrossTableAnalyticsTab"))
const GeolocationAnalyticsTab = lazy(() => import("./components/GeolocationAnalyticsTab"))
const TechnicalAnalyticsTab = lazy(() => import("./components/TechnicalAnalyticsTab"))

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState()
  const [timeRange, setTimeRange] = useState("7d")
  const [metrics, setMetrics] = useState<DailyMetricDto[]>([])
  const [paymentMethodMetrics, setPaymentMethodMetrics] = useState<DailyMetricsByPaymentMethodDto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const currentMetrics = metrics[0]
  const totalTransactions = currentMetrics ? currentMetrics.totalReceipts + currentMetrics.totalWithdrawals + currentMetrics.totalFundTransfers : 0
  const totalSuccessfulTransactions = currentMetrics ? currentMetrics.successfulReceipts + currentMetrics.successfulWithdrawals + currentMetrics.successfulFundTransfers : 0
  const overallSuccessRate = totalTransactions > 0 ? (totalSuccessfulTransactions / totalTransactions) * 100 : 0
  const profitMargin = currentMetrics && currentMetrics.totalFees > 0 ? ((currentMetrics.totalFees - currentMetrics.totalProviderFees) / currentMetrics.totalFees) * 100 : 0

  useEffect(() => {
    const loadSampleData = async () => {
      try {
        setLoading(true)

        await new Promise((resolve) => setTimeout(resolve, 500))
        setMetrics(sampleData.dailyMetrics as DailyMetricDto[])
        setPaymentMethodMetrics(sampleData.paymentMethodMetrics as DailyMetricsByPaymentMethodDto[])
      } catch (error) {
        console.error("Failed to load sample data:", error)
        setMetrics([])
        setPaymentMethodMetrics([])
      } finally {
        setLoading(false)
      }
    }

    loadSampleData()
  }, [dateRange, timeRange])

  const analyticsTabs = [
    {
      label: t("analytics.tabs.overview"),
      value: "overview",
    },
    {
      label: t("analytics.tabs.transactions"),
      value: "transactions",
    },
    {
      label: t("analytics.tabs.financial"),
      value: "financial",
    },
    {
      label: t("analytics.tabs.mathematical"),
      value: "mathematical",
    },
    {
      label: t("analytics.tabs.crossTable"),
      value: "crosstable",
    },
    {
      label: t("analytics.tabs.business"),
      value: "business",
    },
    {
      label: t("analytics.tabs.geolocation"),
      value: "geolocation",
    },
    {
      label: t("analytics.tabs.technical"),
      value: "technical",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 overflow-y-auto h-max px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mt-4">
        <div className="flex-1 min-w-0">
          {/* <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{t("analytics.title")}</h1> */}
          <p className="text-muted-foreground text-sm md:text-base">{t("analytics.description")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 flex-shrink-0">
          <ToggleGroup type="single" value={timeRange} onValueChange={setTimeRange} variant="outline" className="flex-wrap">
            <ToggleGroupItem value="7d" className="text-xs sm:text-sm">
              {t("analytics.timeRange.7days")}
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="text-xs sm:text-sm">
              {t("analytics.timeRange.30days")}
            </ToggleGroupItem>
            <ToggleGroupItem value="90d" className="text-xs sm:text-sm">
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

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="md:min-w-[700px] sm:grid-cols-4 lg:min-w-0 h-8 bg-background py-2 mb-2">
          {analyticsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs whitespace-nowrap h-7 py-1 data-[state=active]:bg-primary data-[state=active]:text-background">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Mobile Tab Selector for hidden tabs */}
        <div className="sm:hidden mt-1">
          <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="w-full px-2 py-1 border rounded-md bg-background text-xs h-8">
            <option value="overview">{t("analytics.tabs.overview")}</option>
            <option value="transactions">{t("analytics.tabs.transactions")}</option>
            <option value="financial">{t("analytics.tabs.financial")}</option>
            <option value="business">{t("analytics.tabs.business")}</option>
            <option value="mathematical">{t("analytics.tabs.mathematical")}</option>
            <option value="crosstable">{t("analytics.tabs.crossTable")}</option>
            <option value="geolocation">{t("analytics.tabs.geolocation")}</option>
            <option value="technical">{t("analytics.tabs.technical")}</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">{t("analytics.loading")}</p>
            </div>
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <OverviewTab
                  metrics={metrics}
                  paymentMethodMetrics={paymentMethodMetrics}
                  currentMetrics={currentMetrics}
                  totalTransactions={totalTransactions}
                  overallSuccessRate={overallSuccessRate}
                  profitMargin={profitMargin}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <TransactionAnalyticsTab metrics={metrics} paymentMethodMetrics={paymentMethodMetrics} currentMetrics={currentMetrics} />
              </Suspense>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <FinancialAnalyticsTab metrics={metrics} currentMetrics={currentMetrics} totalTransactions={totalTransactions} profitMargin={profitMargin} />
              </Suspense>
            </TabsContent>

            <TabsContent value="business" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <BusinessIntelligenceTab
                  metrics={metrics}
                  paymentMethodMetrics={paymentMethodMetrics}
                  currentMetrics={currentMetrics}
                  totalTransactions={totalTransactions}
                  overallSuccessRate={overallSuccessRate}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="mathematical" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <MathematicalAnalyticsTab metrics={metrics} currentMetrics={currentMetrics} totalTransactions={totalTransactions} overallSuccessRate={overallSuccessRate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="crosstable" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <CrossTableAnalyticsTab metrics={metrics} currentMetrics={currentMetrics} />
              </Suspense>
            </TabsContent>

            <TabsContent value="geolocation" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <GeolocationAnalyticsTab metrics={metrics} currentMetrics={currentMetrics} />
              </Suspense>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 sm:space-y-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">{t("analytics.loadingTab")}</div>
                  </div>
                }
              >
                <TechnicalAnalyticsTab metrics={metrics} currentMetrics={currentMetrics} />
              </Suspense>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
