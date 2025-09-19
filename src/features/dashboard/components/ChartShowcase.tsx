import { useTranslation } from "react-i18next"
import CardWrapper from "@/shared/components/CardWrapper"
import {
  AreaChart,
  AreaChartStacked,
  AreaChartGradient,
  BarChart,
  BarChartStacked,
  BarChartHorizontal,
  LineChart,
  LineChartSmooth,
  LineChartStep,
  PieChart,
  DonutChart,
  HalfPieChart,
  HalfDonutChart,
  RadarChart,
  RadarChartMultiSeries,
  RadarChartSimple,
  RadialChart,
  RadialProgressChart,
  RadialStackedChart,
  generateChartConfig,
} from "@/features/dashboard/components"

// Sample data configurations
const revenueData = [
  { name: "Jan", revenue: 4200, profit: 2800, expenses: 1400 },
  { name: "Feb", revenue: 3800, profit: 2200, expenses: 1600 },
  { name: "Mar", revenue: 5100, profit: 3400, expenses: 1700 },
  { name: "Apr", revenue: 4600, profit: 2900, expenses: 1700 },
  { name: "May", revenue: 6200, profit: 4100, expenses: 2100 },
  { name: "Jun", revenue: 5800, profit: 3700, expenses: 2100 },
]

const salesData = [
  { name: "Q1", desktop: 186, mobile: 80, tablet: 45 },
  { name: "Q2", desktop: 305, mobile: 200, tablet: 98 },
  { name: "Q3", desktop: 237, mobile: 120, tablet: 86 },
  { name: "Q4", desktop: 273, mobile: 190, tablet: 99 },
]

const trafficData = [
  { name: "Organic", value: 4580, fill: "var(--chart-1)" },
  { name: "Direct", value: 3200, fill: "var(--chart-2)" },
  { name: "Social", value: 2100, fill: "var(--chart-3)" },
  { name: "Email", value: 1800, fill: "var(--chart-4)" },
  { name: "Referral", value: 1200, fill: "var(--chart-5)" },
]

const performanceData = [
  { name: "Speed", A: 120, B: 110, fullMark: 150 },
  { name: "Reliability", A: 98, B: 130, fullMark: 150 },
  { name: "Security", A: 86, B: 130, fullMark: 150 },
  { name: "UX", A: 99, B: 100, fullMark: 150 },
  { name: "Features", A: 85, B: 90, fullMark: 150 },
  { name: "Support", A: 65, B: 85, fullMark: 150 },
]

const progressData = [{ name: "Completed", value: 75 }]

// Chart configurations
const revenueConfig = generateChartConfig(["revenue", "profit", "expenses"])
const salesConfig = generateChartConfig(["desktop", "mobile", "tablet"])
const trafficConfig = generateChartConfig(["Organic", "Direct", "Social", "Email", "Referral"])
const performanceConfig = generateChartConfig(["A", "B"])
const progressConfig = generateChartConfig(["value"])

export function ChartShowcase() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Area Charts */}
        <CardWrapper title="Area Chart" description="Basic area chart with gradient fill">
          <AreaChart data={revenueData} config={revenueConfig} dataKey="revenue" height={200} gradient={true} />
        </CardWrapper>

        <CardWrapper title="Stacked Area Chart" description="Multiple series stacked area chart">
          <AreaChartStacked data={salesData} config={salesConfig} dataKeys={["desktop", "mobile", "tablet"]} height={200} />
        </CardWrapper>

        <CardWrapper title="Gradient Area Chart" description="Enhanced gradient styling">
          <AreaChartGradient data={revenueData} config={revenueConfig} dataKey="profit" height={200} fillOpacity={0.8} />
        </CardWrapper>

        {/* Bar Charts */}
        <CardWrapper title="Bar Chart" description="Vertical bar chart with multiple series">
          <BarChart data={salesData} config={salesConfig} dataKey={["desktop", "mobile"]} height={200} showValues={true} />
        </CardWrapper>

        <CardWrapper title="Stacked Bar Chart" description="Stacked bars for category comparison">
          <BarChartStacked data={salesData} config={salesConfig} dataKeys={["desktop", "mobile", "tablet"]} height={200} />
        </CardWrapper>

        <CardWrapper title="Horizontal Bar Chart" description="Horizontal orientation variant">
          <BarChartHorizontal data={salesData.slice(0, 3)} config={salesConfig} dataKey="desktop" height={200} orientation="horizontal" />
        </CardWrapper>

        {/* Line Charts */}
        <CardWrapper title="Line Chart" description="Clean line chart with dots">
          <LineChart data={revenueData} config={revenueConfig} dataKey={["revenue", "profit"]} height={200} showDots={true} curveType="monotone" />
        </CardWrapper>

        <CardWrapper title="Smooth Line Chart" description="Curved line interpolation">
          <LineChartSmooth data={revenueData} config={revenueConfig} dataKey="revenue" height={200} curveType="natural" />
        </CardWrapper>

        <CardWrapper title="Step Line Chart" description="Step-based line chart">
          <LineChartStep data={revenueData} config={revenueConfig} dataKey="expenses" height={200} curveType="step" />
        </CardWrapper>

        {/* Pie Charts */}
        <CardWrapper title="Pie Chart" description="Traditional pie chart">
          <PieChart data={trafficData} config={trafficConfig} dataKey="value" nameKey="name" height={200} showLabels={true} />
        </CardWrapper>

        <CardWrapper title="Donut Chart" description="Donut variant with center content">
          <DonutChart
            data={trafficData}
            config={trafficConfig}
            dataKey="value"
            nameKey="name"
            height={200}
            centerLabel="Total Traffic"
            centerValue={trafficData.reduce((sum, item) => sum + item.value, 0)}
          />
        </CardWrapper>

        <CardWrapper title="Half Pie Chart" description="Semicircle pie chart (180°)">
          <HalfPieChart data={trafficData.slice(0, 3)} config={trafficConfig} dataKey="value" nameKey="name" height={120} showLegend={true} />
        </CardWrapper>

        {/* Radar Charts */}
        <CardWrapper title="Radar Chart" description="Multi-dimensional data visualization">
          <RadarChart data={performanceData} config={performanceConfig} dataKey="A" height={200} fillOpacity={0.3} />
        </CardWrapper>

        <CardWrapper title="Multi-Series Radar" description="Multiple data series comparison">
          <RadarChartMultiSeries data={performanceData} config={performanceConfig} dataKeys={["A", "B"]} height={200} />
        </CardWrapper>

        {/* Radial Charts */}
        <CardWrapper title="Radial Progress" description="Circular progress indicator">
          <RadialProgressChart data={progressData} config={progressConfig} dataKey="value" height={180} centerLabel="Complete" showCenterValue={true} />
        </CardWrapper>
      </div>

      {/* Large Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CardWrapper title="Revenue Trend Analysis" description="Comprehensive revenue tracking with multiple metrics" className="col-span-1">
          <AreaChart data={revenueData} config={revenueConfig} dataKey={["revenue", "profit", "expenses"]} height={300} showLegend={true} showGrid={true} animate={true} />
        </CardWrapper>

        <CardWrapper title="Traffic Source Breakdown" description="Website traffic by source with detailed metrics" className="col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DonutChart data={trafficData} config={trafficConfig} dataKey="value" nameKey="name" height={200} innerRadius={60} outerRadius={80} showCenterContent={true} />
            </div>
            <div>
              <BarChart data={trafficData} config={trafficConfig} dataKey="value" height={200} orientation="horizontal" showValues={true} />
            </div>
          </div>
        </CardWrapper>

        <CardWrapper title="Performance Metrics Dashboard" description="Multi-dimensional performance analysis" className="col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <RadarChart data={performanceData} config={performanceConfig} dataKey={["A", "B"]} height={200} showLegend={true} />
            <LineChart data={revenueData} config={revenueConfig} dataKey="profit" height={200} curveType="natural" showDots={true} />
          </div>
        </CardWrapper>

        <CardWrapper title="Sales Analytics Overview" description="Comprehensive sales data across platforms" className="col-span-1">
          <BarChartStacked data={salesData} config={salesConfig} dataKeys={["desktop", "mobile", "tablet"]} height={300} showValues={true} showLegend={true} />
        </CardWrapper>
      </div>

      {/* Interactive Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardWrapper title="Loading State" description="Chart loading animation">
          <AreaChart data={[]} config={{}} dataKey="value" height={150} loading={true} />
        </CardWrapper>

        <CardWrapper title="Error State" description="Chart error handling">
          <BarChart data={[]} config={{}} dataKey="value" height={150} error="Failed to load data" />
        </CardWrapper>

        <CardWrapper title="Empty State" description="No data available">
          <PieChart data={[]} config={{}} dataKey="value" nameKey="name" height={150} emptyMessage="No traffic data available" />
        </CardWrapper>

        <CardWrapper title="Mini Chart" description="Compact dashboard widget">
          <HalfDonutChart
            data={progressData}
            config={progressConfig}
            dataKey="value"
            nameKey="name"
            width={150}
            height={100}
            innerRadius={25}
            outerRadius={40}
            centerValue="75%"
            centerLabel="Done"
            showCenterContent={true}
          />
        </CardWrapper>
      </div>
    </div>
  )
}
