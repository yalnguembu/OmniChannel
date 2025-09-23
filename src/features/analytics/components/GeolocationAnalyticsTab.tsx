import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/shared/components/ui/chart"
import { MapPin, Users, Smartphone, TrendingUp, Globe, Navigation, Activity, Target } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DailyMetricDto, DailyMetricsByPaymentMethodDto } from "@/shared/api/types.gen"

interface GeolocationAnalyticsTabProps {
  metrics: DailyMetricDto[]
  paymentMethodMetrics: DailyMetricsByPaymentMethodDto[]
  currentMetrics?: DailyMetricDto
}

// Cameroon regions data for business intelligence
const cameroonRegions = [
  {
    name: "Centre",
    capital: "Yaoundé",
    users: 45000,
    transactions: 285000,
    volume: 8500000000,
    growth: 23.5,
    penetration: 78,
    coordinates: { lat: 3.848, lng: 11.5021 },
  },
  {
    name: "Littoral",
    capital: "Douala",
    users: 38000,
    transactions: 320000,
    volume: 12500000000,
    growth: 18.7,
    penetration: 85,
    coordinates: { lat: 4.0511, lng: 9.7679 },
  },
  {
    name: "West",
    capital: "Bafoussam",
    users: 22000,
    transactions: 145000,
    volume: 4200000000,
    growth: 31.2,
    penetration: 65,
    coordinates: { lat: 5.4737, lng: 10.4158 },
  },
  {
    name: "Northwest",
    capital: "Bamenda",
    users: 18000,
    transactions: 95000,
    volume: 2800000000,
    growth: 12.4,
    penetration: 52,
    coordinates: { lat: 5.9631, lng: 10.1591 },
  },
  {
    name: "Southwest",
    capital: "Buea",
    users: 15000,
    transactions: 78000,
    volume: 2100000000,
    growth: 8.9,
    penetration: 48,
    coordinates: { lat: 4.156, lng: 9.2367 },
  },
  {
    name: "Far North",
    capital: "Maroua",
    users: 12000,
    transactions: 65000,
    volume: 1500000000,
    growth: 45.3,
    penetration: 35,
    coordinates: { lat: 10.5911, lng: 14.3155 },
  },
  {
    name: "North",
    capital: "Garoua",
    users: 8500,
    transactions: 42000,
    volume: 950000000,
    growth: 38.1,
    penetration: 28,
    coordinates: { lat: 9.3265, lng: 13.3958 },
  },
  {
    name: "Adamawa",
    capital: "Ngaoundéré",
    users: 7200,
    transactions: 35000,
    volume: 780000000,
    growth: 42.6,
    penetration: 25,
    coordinates: { lat: 7.326, lng: 13.584 },
  },
  {
    name: "East",
    capital: "Bertoua",
    users: 5800,
    transactions: 28000,
    volume: 520000000,
    growth: 33.7,
    penetration: 22,
    coordinates: { lat: 4.5772, lng: 13.6848 },
  },
  {
    name: "South",
    capital: "Ebolowa",
    users: 4500,
    transactions: 22000,
    volume: 410000000,
    growth: 29.4,
    penetration: 19,
    coordinates: { lat: 2.9076, lng: 11.1546 },
  },
]

export default function GeolocationAnalyticsTab({ metrics, paymentMethodMetrics, currentMetrics }: GeolocationAnalyticsTabProps) {
  const { t } = useTranslation()

  // Calculate aggregated data
  const totalUsers = cameroonRegions.reduce((sum, region) => sum + region.users, 0)
  const totalTransactions = cameroonRegions.reduce((sum, region) => sum + region.transactions, 0)
  const totalVolume = cameroonRegions.reduce((sum, region) => sum + region.volume, 0)
  const avgGrowth = cameroonRegions.reduce((sum, region) => sum + region.growth, 0) / cameroonRegions.length
  const avgPenetration = cameroonRegions.reduce((sum, region) => sum + region.penetration, 0) / cameroonRegions.length

  // Prepare chart data
  const regionDataForCharts = cameroonRegions.map((region) => ({
    name: region.name,
    users: region.users,
    transactions: region.transactions,
    volume: region.volume / 1000000, // Convert to millions
    growth: region.growth,
    penetration: region.penetration,
  }))

  const topRegionsByUsers = [...cameroonRegions].sort((a, b) => b.users - a.users).slice(0, 5)

  const fastestGrowingRegions = [...cameroonRegions].sort((a, b) => b.growth - a.growth).slice(0, 5)

  // Chart configurations
  const regionConfig = {
    users: { label: "Users", color: "hsl(var(--chart-1))" },
    volume: { label: "Volume (M XAF)", color: "hsl(var(--chart-2))" },
    growth: { label: "Growth (%)", color: "hsl(var(--chart-3))" },
    penetration: { label: "Penetration (%)", color: "hsl(var(--chart-4))" },
  } satisfies ChartConfig

  const topRegionsConfig = {
    users: { label: "Users", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig

  const growthConfig = {
    growth: { label: "Growth Rate (%)", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig

  // Geographic distribution for pie chart
  const geographicDistribution = [
    { name: "Urban Centers", value: 83000, fill: "hsl(var(--chart-1))" },
    { name: "Semi-Urban", value: 45200, fill: "hsl(var(--chart-2))" },
    { name: "Rural Areas", value: 21800, fill: "hsl(var(--chart-3))" },
    { name: "Remote Regions", value: 12000, fill: "hsl(var(--chart-4))" },
  ]

  return (
    <div className="space-y-6">
      {/* Geographic Overview KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              {t("analytics.geo.acrossRegions")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.totalVolume")}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalVolume / 1000000000).toFixed(1)}B XAF</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Navigation className="h-3 w-3 text-blue-600" />
              {totalTransactions.toLocaleString()} {t("analytics.geo.transactions")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.avgGrowth")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGrowth.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-purple-600" />
              {t("analytics.geo.yearOverYear")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.geo.marketPenetration")}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPenetration.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3 text-orange-600" />
              {t("analytics.geo.avgPenetration")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Analysis Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("analytics.geo.topRegionsByUsers")}
            </CardTitle>
            <CardDescription>{t("analytics.geo.topRegionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topRegionsConfig} className="h-[300px]">
              <BarChart data={topRegionsByUsers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("analytics.geo.fastestGrowingRegions")}
            </CardTitle>
            <CardDescription>{t("analytics.geo.fastestGrowingDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="h-[300px]">
              <BarChart data={fastestGrowingRegions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${Number(value).toFixed(1)}%`, "Growth Rate"]} />} />
                <Bar dataKey="growth" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("analytics.geo.userDistribution")}
            </CardTitle>
            <CardDescription>{t("analytics.geo.userDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={regionConfig} className="h-[350px]">
              <BarChart data={regionDataForCharts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Bar yAxisId="left" dataKey="users" fill="hsl(var(--chart-1))" name="Users" />
                <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--chart-2))" name="Volume (M XAF)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              {t("analytics.geo.geographicDistribution")}
            </CardTitle>
            <CardDescription>{t("analytics.geo.geographicDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={regionConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={geographicDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {geographicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-500" />
            {t("analytics.geo.regionalPerformance")}
          </CardTitle>
          <CardDescription>{t("analytics.geo.regionalPerformanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">{t("analytics.geo.region")}</th>
                  <th className="text-left p-2 font-medium">{t("analytics.geo.capital")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.geo.users")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.geo.transactions")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.geo.volume")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.geo.growth")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.geo.penetration")}</th>
                  <th className="text-right p-2 font-medium">{t("analytics.geo.status")}</th>
                </tr>
              </thead>
              <tbody>
                {cameroonRegions
                  .sort((a, b) => b.users - a.users)
                  .map((region, index) => (
                    <tr key={region.name} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                          <div className="font-medium">{region.name}</div>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">{region.capital}</td>
                      <td className="p-2 text-right font-mono">{region.users.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono">{region.transactions.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono">{(region.volume / 1000000).toFixed(1)}M</td>
                      <td className="p-2 text-right">
                        <span className={`font-bold ${region.growth >= 30 ? "text-green-600" : region.growth >= 20 ? "text-blue-600" : "text-yellow-600"}`}>
                          {region.growth.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                region.penetration >= 70 ? "bg-green-500" : region.penetration >= 50 ? "bg-blue-500" : region.penetration >= 30 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${region.penetration}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">{region.penetration}%</span>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <Badge
                          variant="outline"
                          className={
                            region.growth >= 30
                              ? "bg-green-50 text-green-600"
                              : region.growth >= 20
                                ? "bg-blue-50 text-blue-600"
                                : region.growth >= 10
                                  ? "bg-yellow-50 text-yellow-600"
                                  : "bg-red-50 text-red-600"
                          }
                        >
                          {region.growth >= 30 ? "Excellent" : region.growth >= 20 ? "Good" : region.growth >= 10 ? "Average" : "Low"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cameroon Regions Visual Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-500" />
            {t("analytics.geo.cameroonRegionsMap")}
          </CardTitle>
          <CardDescription>{t("analytics.geo.cameroonRegionsMapDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gradient-to-b from-blue-50 to-green-50 rounded-lg border overflow-hidden">
            {/* Simplified Cameroon outline with regions */}
            <div className="absolute inset-4">
              {/* Central regions cluster */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">C</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    Centre
                    <br />
                    <span className="text-muted-foreground">45K users</span>
                  </div>
                </div>
              </div>

              {/* Littoral (Douala) */}
              <div className="absolute top-2/3 left-1/4">
                <div className="relative">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">L</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    Littoral
                    <br />
                    <span className="text-muted-foreground">38K users</span>
                  </div>
                </div>
              </div>

              {/* West region */}
              <div className="absolute top-1/4 left-1/3">
                <div className="relative">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    West
                    <br />
                    <span className="text-muted-foreground">22K users</span>
                  </div>
                </div>
              </div>

              {/* Northwest */}
              <div className="absolute top-1/6 left-1/4">
                <div className="relative">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">NW</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    Northwest
                    <br />
                    <span className="text-muted-foreground">18K users</span>
                  </div>
                </div>
              </div>

              {/* Southwest */}
              <div className="absolute top-3/4 left-1/6">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">SW</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    Southwest
                    <br />
                    <span className="text-muted-foreground">15K users</span>
                  </div>
                </div>
              </div>

              {/* Far North */}
              <div className="absolute top-0 right-1/4">
                <div className="relative">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">FN</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    Far North
                    <br />
                    <span className="text-muted-foreground">12K users</span>
                  </div>
                </div>
              </div>

              {/* North */}
              <div className="absolute top-1/6 right-1/3">
                <div className="relative">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">N</div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                    North
                    <br />
                    <span className="text-muted-foreground">8.5K users</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
                <h4 className="font-medium text-sm mb-2">{t("analytics.geo.userDensity")}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>30K+ users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>20K-30K users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>15K-20K users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>10K-15K users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>5K-10K users</span>
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
