import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Zap, Calculator, Award, AlertOctagon, TrendingUpDown, Loader } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto, DailyMetricsByPaymentMethodDto } from "@/shared/api/types.gen"

interface BusinessIntelligenceTabProps {
  metrics: DailyMetricDto[]
  paymentMethodMetrics: DailyMetricsByPaymentMethodDto[]
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

export default function BusinessIntelligenceTab({ currentMetrics, totalTransactions, overallSuccessRate, isLoading = false }: BusinessIntelligenceTabProps) {
  const { t } = useTranslation()

  const effectiveMetrics = currentMetrics || {
    totalVolume: 0,
    netRevenue: 0,
    activeUsers: 0,
    newUsers: 0,
    apiCallsCount: 0,
    errorsCount: 0,
    failureRate: 0,
    totalFees: 0,
    totalProviderFees: 0,
    totalReceipts: 0,
    totalWithdrawals: 0,
    totalFundTransfers: 0,
    totalReceiptsFees: 0,
    totalWithdrawalsFees: 0,
    totalFundTransfersFees: 0,
    failedReceipts: 0,
    failedWithdrawals: 0,
  }

  return (
    <div className="space-y-6">
      {/* Operational Efficiency Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {t("analytics.business.operationalEfficiency.title")}
            </CardTitle>
            <CardDescription>{t("analytics.business.operationalEfficiency.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-green-600">{safeDivide(overallSuccessRate + (100 - effectiveMetrics.failureRate), 2).toFixed(1)}%</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.operationalEfficiency.transactionSuccess")}</span>
                    <span className="font-medium">{overallSuccessRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.operationalEfficiency.apiReliability")}</span>
                    <span className="font-medium">{(100 - effectiveMetrics.failureRate).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.operationalEfficiency.processingLoad")}</span>
                    <span className="font-medium">
                      {totalTransactions.toLocaleString()} {t("analytics.business.operationalEfficiency.txPerDay")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              {t("analytics.business.revenuePerTransaction.title")}
            </CardTitle>
            <CardDescription>{t("analytics.business.revenuePerTransaction.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-blue-600">{safeDivide(effectiveMetrics.netRevenue, totalTransactions).toFixed(0)} XAF</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.revenuePerTransaction.receiptsRPT")}</span>
                    <span className="font-medium">{safeDivide(effectiveMetrics.totalReceiptsFees || 0, effectiveMetrics.totalReceipts || 0).toFixed(0)} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.revenuePerTransaction.withdrawalsRPT")}</span>
                    <span className="font-medium">{safeDivide(effectiveMetrics.totalWithdrawalsFees || 0, effectiveMetrics.totalWithdrawals || 0).toFixed(0)} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.revenuePerTransaction.transfersRPT")}</span>
                    <span className="font-medium">{safeDivide(effectiveMetrics.totalFundTransfersFees || 0, effectiveMetrics.totalFundTransfers || 0).toFixed(0)} XAF</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              {t("analytics.business.customerEngagement.title")}
            </CardTitle>
            <CardDescription>{t("analytics.business.customerEngagement.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-purple-600">{safeDivide(totalTransactions, effectiveMetrics.activeUsers).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground mb-3">{t("analytics.business.customerEngagement.transactionsPerUser")}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.customerEngagement.growthRate")}</span>
                    <span className="font-medium">{safePercentage(effectiveMetrics.newUsers, effectiveMetrics.activeUsers).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("analytics.business.customerEngagement.apiUsage")}</span>
                    <span className="font-medium">
                      {safeDivide(effectiveMetrics.apiCallsCount, effectiveMetrics.activeUsers).toFixed(1)} {t("analytics.business.customerEngagement.callsPerUser")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk & Quality Management */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" />
              {t("analytics.business.riskAssessment.title")}
            </CardTitle>
            <CardDescription>{t("analytics.business.riskAssessment.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{effectiveMetrics.failedReceipts || 0}</div>
                  <div className="text-sm text-muted-foreground">{t("analytics.business.riskAssessment.failedReceipts")}</div>
                  <Badge variant="outline" className="mt-1 bg-red-50 text-red-600">
                    {safePercentage(effectiveMetrics.failedReceipts || 0, effectiveMetrics.totalReceipts || 0).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{effectiveMetrics.failedWithdrawals || 0}</div>
                  <div className="text-sm text-muted-foreground">{t("analytics.business.riskAssessment.failedWithdrawals")}</div>
                  <Badge variant="outline" className="mt-1 bg-orange-50 text-orange-600">
                    {safePercentage(effectiveMetrics.failedWithdrawals || 0, effectiveMetrics.totalWithdrawals || 0).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{effectiveMetrics.errorsCount}</div>
                  <div className="text-sm text-muted-foreground">{t("analytics.business.riskAssessment.apiErrors")}</div>
                  <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-600">
                    {effectiveMetrics.failureRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("analytics.business.riskAssessment.overallRiskLevel")}</span>
                  <Badge variant={effectiveMetrics.failureRate > 10 ? "destructive" : effectiveMetrics.failureRate > 5 ? "default" : "secondary"}>
                    {effectiveMetrics.failureRate > 10
                      ? t("analytics.business.riskAssessment.high")
                      : effectiveMetrics.failureRate > 5
                        ? t("analytics.business.riskAssessment.medium")
                        : t("analytics.business.riskAssessment.low")}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpDown className="h-5 w-5 text-green-500" />
              {t("analytics.business.growthIndicators.title")}
            </CardTitle>
            <CardDescription>{t("analytics.business.growthIndicators.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold">
                    {safeDivide(safeDivide(effectiveMetrics.totalVolume, 1000000), safeDivide(effectiveMetrics.activeUsers, 1000)).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">{t("analytics.business.growthIndicators.xafPer1kUsers")}</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{safePercentage(effectiveMetrics.netRevenue, effectiveMetrics.totalVolume).toFixed(3)}%</div>
                  <div className="text-sm text-muted-foreground">{t("analytics.business.growthIndicators.revenueMargin")}</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("analytics.business.growthIndicators.marketPenetration")}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.min(safePercentage(effectiveMetrics.activeUsers, 10000), 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{safePercentage(effectiveMetrics.activeUsers, 10000).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("analytics.business.growthIndicators.serviceDiversification")}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("analytics.business.growthIndicators.operationalScalability")}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${Math.min(safePercentage(totalTransactions, 5000), 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{Math.min(safePercentage(totalTransactions, 5000), 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
