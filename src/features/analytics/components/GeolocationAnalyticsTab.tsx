import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Users, TrendingUp, Globe, Navigation, Activity, Loader, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto, DailyMetricsByPaymentMethodDto } from "@/shared/api/types.gen"

interface GeolocationAnalyticsTabProps {
  metrics: DailyMetricDto[]
  paymentMethodMetrics: DailyMetricsByPaymentMethodDto[]
  currentMetrics?: DailyMetricDto
  isLoading?: boolean
}

export default function GeolocationAnalyticsTab({ metrics, paymentMethodMetrics, currentMetrics, isLoading = false }: GeolocationAnalyticsTabProps) {
  const { t } = useTranslation()

  // Note: Geolocation data is not available in the current API response
  // This tab is prepared for future geolocation features
  const totalUsers = currentMetrics?.activeUsers || 0
  const totalTransactions = currentMetrics ? currentMetrics.totalReceipts + currentMetrics.totalWithdrawals + currentMetrics.totalFundTransfers : 0
  const totalVolume = currentMetrics?.totalVolume || 0

  return (
    <div className="space-y-6">
      {/* Geographic Overview KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {t("analytics.geo.acrossRegions")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.totalVolume")}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{(totalVolume / 1000000).toFixed(1)}M XAF</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3 text-blue-600" />
                  {totalTransactions.toLocaleString()} {t("analytics.geo.transactions")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.totalTransactions")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-purple-600" />
                  {t("analytics.geo.allRegions")}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("analytics.geo.interactiveMap")}
          </CardTitle>
          <CardDescription>{t("analytics.geo.mapDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
            {/* Map Placeholder with Geographic Grid */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Grid Lines to simulate map */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Geographic Features Outline */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 600">
                  {/* Simulated country/region outline */}
                  <path
                    d="M 150,100 L 200,80 L 300,90 L 400,120 L 450,150 L 480,200 L 490,280 L 470,350 L 430,400 L 380,450 L 300,480 L 220,470 L 170,420 L 140,350 L 130,250 L 140,180 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  {/* Simulated cities/markers */}
                  <circle cx="250" cy="200" r="8" fill="currentColor" opacity="0.6" />
                  <circle cx="350" cy="250" r="12" fill="currentColor" opacity="0.6" />
                  <circle cx="300" cy="350" r="6" fill="currentColor" opacity="0.6" />
                  <circle cx="400" cy="300" r="10" fill="currentColor" opacity="0.6" />
                </svg>

                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <MapPin className="h-16 w-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t("analytics.geo.mapFeatureTitle")}</h3>
                  <p className="text-center text-muted-foreground max-w-md mb-4">
                    {t("analytics.geo.mapFeatureDescription")}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{t("analytics.geo.regionTracking")}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm">
                      <Activity className="h-4 w-4" />
                      <span>{t("analytics.geo.heatmaps")}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm">
                      <Users className="h-4 w-4" />
                      <span>{t("analytics.geo.userDistribution")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
