import { useState } from "react"
import { useTranslation } from "react-i18next"
import CardWrapper from "@/shared/components/CardWrapper"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Copy, Code2, Eye } from "lucide-react"
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
  LineChartMultiAxis,
  PieChart,
  DonutChart,
  HalfPieChart,
  HalfDonutChart,
  PieChartWithLabels,
  RadarChart,
  RadarChartMultiSeries,
  RadarChartSimple,
  RadialChart,
  RadialProgressChart,
  RadialStackedChart,
  generateChartConfig,
} from "@/features/dashboard/components"

// Sample data sets
const basicData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 700 },
  { name: "Jun", value: 500 },
]

const multiData = [
  { name: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { name: "Feb", desktop: 305, mobile: 200, tablet: 98 },
  { name: "Mar", desktop: 237, mobile: 120, tablet: 86 },
  { name: "Apr", desktop: 273, mobile: 190, tablet: 99 },
  { name: "May", desktop: 209, mobile: 130, tablet: 70 },
  { name: "Jun", desktop: 214, mobile: 140, tablet: 80 },
]

const pieData = [
  { name: "Desktop", value: 400, fill: "var(--chart-1)" },
  { name: "Mobile", value: 300, fill: "var(--chart-2)" },
  { name: "Tablet", value: 200, fill: "var(--chart-3)" },
  { name: "Other", value: 100, fill: "var(--chart-4)" },
]

const radarData = [
  { name: "Speed", A: 120, B: 110 },
  { name: "Quality", A: 98, B: 130 },
  { name: "Price", A: 86, B: 130 },
  { name: "Support", A: 99, B: 100 },
  { name: "Features", A: 85, B: 90 },
]

const progressData = [{ name: "Progress", value: 75 }]

// Chart configurations
const basicConfig = generateChartConfig(["value"])
const multiConfig = generateChartConfig(["desktop", "mobile", "tablet"])
const pieConfig = generateChartConfig(["Desktop", "Mobile", "Tablet", "Other"])
const radarConfig = generateChartConfig(["A", "B"])
const progressConfig = generateChartConfig(["value"])

interface ChartExampleProps {
  title: string
  description: string
  component: React.ReactNode
  code: string
  category: string
}

function ChartExample({ title, description, component, code, category }: ChartExampleProps) {
  const [showCode, setShowCode] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <CardWrapper
      title={title}
      description={description}
      className="space-y-4"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)} className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            {showCode ? "Hide Code" : "Show Code"}
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
      }
    >
      <div className="space-y-4">
        {component}
        {showCode && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </CardWrapper>
  )
}

export function ChartsUsageGuide() {
  const { t } = useTranslation()

  const chartExamples: ChartExampleProps[] = [
    // Area Charts
    {
      title: "Basic Area Chart",
      description: "Simple area chart with gradient fill",
      category: "Area Charts",
      component: <AreaChart data={basicData} config={basicConfig} dataKey="value" height={200} />,
      code: `<AreaChart
  data={basicData}
  config={basicConfig}
  dataKey="value"
  height={200}
/>`,
    },
    {
      title: "Stacked Area Chart",
      description: "Multiple series stacked area chart",
      category: "Area Charts",
      component: <AreaChartStacked data={multiData} config={multiConfig} dataKeys={["desktop", "mobile", "tablet"]} height={200} />,
      code: `<AreaChartStacked
  data={multiData}
  config={multiConfig}
  dataKeys={["desktop", "mobile", "tablet"]}
  height={200}
/>`,
    },
    {
      title: "Gradient Area Chart",
      description: "Enhanced gradient styling with opacity",
      category: "Area Charts",
      component: <AreaChartGradient data={basicData} config={basicConfig} dataKey="value" height={200} fillOpacity={0.8} />,
      code: `<AreaChartGradient
  data={basicData}
  config={basicConfig}
  dataKey="value"
  height={200}
  fillOpacity={0.8}
/>`,
    },

    // Bar Charts
    {
      title: "Basic Bar Chart",
      description: "Vertical bar chart with multiple series",
      category: "Bar Charts",
      component: <BarChart data={multiData} config={multiConfig} dataKey="desktop" height={200} />,
      code: `<BarChart
  data={multiData}
  config={multiConfig}
  dataKey="desktop"
  height={200}
/>`,
    },
    {
      title: "Stacked Bar Chart",
      description: "Stacked bars for category comparison",
      category: "Bar Charts",
      component: <BarChartStacked data={multiData} config={multiConfig} dataKeys={["desktop", "mobile", "tablet"]} height={200} />,
      code: `<BarChartStacked
  data={multiData}
  config={multiConfig}
  dataKeys={["desktop", "mobile", "tablet"]}
  height={200}
/>`,
    },
    {
      title: "Horizontal Bar Chart",
      description: "Horizontal orientation variant",
      category: "Bar Charts",
      component: <BarChartHorizontal data={multiData.slice(0, 4)} config={multiConfig} dataKey="desktop" height={200} />,
      code: `<BarChartHorizontal
  data={multiData.slice(0, 4)}
  config={multiConfig}
  dataKey="desktop"
  height={200}
/>`,
    },

    // Line Charts
    {
      title: "Basic Line Chart",
      description: "Clean line chart with dots",
      category: "Line Charts",
      component: <LineChart data={basicData} config={basicConfig} dataKey="value" height={200} />,
      code: `<LineChart
  data={basicData}
  config={basicConfig}
  dataKey="value"
  height={200}
/>`,
    },
    {
      title: "Smooth Line Chart",
      description: "Curved line interpolation",
      category: "Line Charts",
      component: <LineChartSmooth data={basicData} config={basicConfig} dataKey="value" height={200} />,
      code: `<LineChartSmooth
  data={basicData}
  config={basicConfig}
  dataKey="value"
  height={200}
/>`,
    },
    {
      title: "Step Line Chart",
      description: "Step-based line chart",
      category: "Line Charts",
      component: <LineChartStep data={basicData} config={basicConfig} dataKey="value" height={200} />,
      code: `<LineChartStep
  data={basicData}
  config={basicConfig}
  dataKey="value"
  height={200}
/>`,
    },
    {
      title: "Multi-Axis Line Chart",
      description: "Multiple data series line chart",
      category: "Line Charts",
      component: <LineChartMultiAxis data={multiData} config={multiConfig} dataKeys={["desktop", "mobile"]} height={200} />,
      code: `<LineChartMultiAxis
  data={multiData}
  config={multiConfig}
  dataKeys={["desktop", "mobile"]}
  height={200}
/>`,
    },

    // Pie Charts
    {
      title: "Basic Pie Chart",
      description: "Traditional pie chart",
      category: "Pie Charts",
      component: <PieChart data={pieData} config={pieConfig} dataKey="value" nameKey="name" height={200} />,
      code: `<PieChart
  data={pieData}
  config={pieConfig}
  dataKey="value"
  nameKey="name"
  height={200}
/>`,
    },
    {
      title: "Donut Chart",
      description: "Donut variant with center content",
      category: "Pie Charts",
      component: <DonutChart data={pieData} config={pieConfig} dataKey="value" nameKey="name" height={200} centerLabel="Total" />,
      code: `<DonutChart
  data={pieData}
  config={pieConfig}
  dataKey="value"
  nameKey="name"
  height={200}
  centerLabel="Total"
/>`,
    },
    {
      title: "Half Pie Chart",
      description: "Semicircle pie chart (180°)",
      category: "Pie Charts",
      component: <HalfPieChart data={pieData.slice(0, 3)} config={pieConfig} dataKey="value" nameKey="name" height={150} />,
      code: `<HalfPieChart
  data={pieData.slice(0, 3)}
  config={pieConfig}
  dataKey="value"
  nameKey="name"
  height={150}
/>`,
    },
    {
      title: "Half Donut Chart",
      description: "Semicircle donut with center content",
      category: "Pie Charts",
      component: <HalfDonutChart data={pieData.slice(0, 3)} config={pieConfig} dataKey="value" nameKey="name" height={150} centerLabel="Progress" />,
      code: `<HalfDonutChart
  data={pieData.slice(0, 3)}
  config={pieConfig}
  dataKey="value"
  nameKey="name"
  height={150}
  centerLabel="Progress"
/>`,
    },
    {
      title: "Pie Chart with Labels",
      description: "Pie chart with external labels",
      category: "Pie Charts",
      component: <PieChartWithLabels data={pieData} config={pieConfig} dataKey="value" nameKey="name" height={200} />,
      code: `<PieChartWithLabels
  data={pieData}
  config={pieConfig}
  dataKey="value"
  nameKey="name"
  height={200}
/>`,
    },

    // Radar Charts
    {
      title: "Basic Radar Chart",
      description: "Multi-dimensional data visualization",
      category: "Radar Charts",
      component: <RadarChart data={radarData} config={radarConfig} dataKey="A" height={200} fillOpacity={0.3} />,
      code: `<RadarChart
  data={radarData}
  config={radarConfig}
  dataKey="A"
  height={200}
  fillOpacity={0.3}
/>`,
    },
    {
      title: "Multi-Series Radar",
      description: "Multiple data series comparison",
      category: "Radar Charts",
      component: <RadarChartMultiSeries data={radarData} config={radarConfig} dataKeys={["A", "B"]} height={200} />,
      code: `<RadarChartMultiSeries
  data={radarData}
  config={radarConfig}
  dataKeys={["A", "B"]}
  height={200}
/>`,
    },
    {
      title: "Simple Radar Chart",
      description: "Minimal radar chart without legend",
      category: "Radar Charts",
      component: <RadarChartSimple data={radarData} config={radarConfig} dataKey="A" height={200} />,
      code: `<RadarChartSimple
  data={radarData}
  config={radarConfig}
  dataKey="A"
  height={200}
/>`,
    },

    // Radial Charts
    {
      title: "Basic Radial Chart",
      description: "Circular radial chart",
      category: "Radial Charts",
      component: <RadialChart data={progressData} config={progressConfig} dataKey="value" height={200} />,
      code: `<RadialChart
  data={progressData}
  config={progressConfig}
  dataKey="value"
  height={200}
/>`,
    },
    {
      title: "Radial Progress Chart",
      description: "Circular progress indicator",
      category: "Radial Charts",
      component: <RadialProgressChart data={progressData} config={progressConfig} dataKey="value" height={200} centerLabel="Complete" />,
      code: `<RadialProgressChart
  data={progressData}
  config={progressConfig}
  dataKey="value"
  height={200}
  centerLabel="Complete"
/>`,
    },
    {
      title: "Radial Stacked Chart",
      description: "Stacked radial chart with multiple series",
      category: "Radial Charts",
      component: <RadialStackedChart data={multiData.slice(0, 1)} config={multiConfig} dataKeys={["desktop", "mobile"]} height={200} />,
      code: `<RadialStackedChart
  data={multiData.slice(0, 1)}
  config={multiConfig}
  dataKeys={["desktop", "mobile"]}
  height={200}
/>`,
    },
  ]

  const categories = [...new Set(chartExamples.map((example) => example.category))]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Chart Components Usage Guide</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive guide to using Fujisat Pay dashboard chart components. Each example includes the component preview, usage code, and customization options for building
          production-ready dashboards.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs lg:text-sm">
              {category.replace(" Charts", "")}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {chartExamples
                .filter((example) => example.category === category)
                .map((example, index) => (
                  <ChartExample key={`${category}-${index}`} {...example} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Data Structures Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Data Structures</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardWrapper title="Basic Data Structure" description="Standard format for single series charts">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                <code>{`const basicData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 }
]`}</code>
              </pre>
            </div>
          </CardWrapper>

          <CardWrapper title="Multi-Series Data Structure" description="Format for multiple data series charts">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                <code>{`const multiData = [
  { name: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { name: "Feb", desktop: 305, mobile: 200, tablet: 98 },
  { name: "Mar", desktop: 237, mobile: 120, tablet: 86 }
]`}</code>
              </pre>
            </div>
          </CardWrapper>

          <CardWrapper title="Pie Chart Data Structure" description="Format for pie and donut charts">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                <code>{`const pieData = [
  { name: "Desktop", value: 400, fill: "var(--chart-1)" },
  { name: "Mobile", value: 300, fill: "var(--chart-2)" },
  { name: "Tablet", value: 200, fill: "var(--chart-3)" }
]`}</code>
              </pre>
            </div>
          </CardWrapper>

          <CardWrapper title="Configuration Generation" description="How to generate chart configurations">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                <code>{`import { generateChartConfig } from "@/features/dashboard/components"

// For basic charts
const basicConfig = generateChartConfig(["value"])

// For multi-series charts
const multiConfig = generateChartConfig(["desktop", "mobile", "tablet"])

// For pie charts
const pieConfig = generateChartConfig(["Desktop", "Mobile", "Tablet"])`}</code>
              </pre>
            </div>
          </CardWrapper>
        </div>
      </div>

      {/* Common Props Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Common Props</h2>
        <CardWrapper title="Available Props" description="Common properties available across all chart components">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Prop</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Default</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="p-2 font-mono">data</td>
                  <td className="p-2">Array</td>
                  <td className="p-2">required</td>
                  <td className="p-2">Chart data array</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">config</td>
                  <td className="p-2">Object</td>
                  <td className="p-2">required</td>
                  <td className="p-2">Chart configuration object</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">height</td>
                  <td className="p-2">number</td>
                  <td className="p-2">350</td>
                  <td className="p-2">Chart height in pixels</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">width</td>
                  <td className="p-2">number</td>
                  <td className="p-2">undefined</td>
                  <td className="p-2">Chart width (responsive if not set)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">showTooltip</td>
                  <td className="p-2">boolean</td>
                  <td className="p-2">true</td>
                  <td className="p-2">Show tooltip on hover</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">showLegend</td>
                  <td className="p-2">boolean</td>
                  <td className="p-2">true</td>
                  <td className="p-2">Show chart legend</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">animate</td>
                  <td className="p-2">boolean</td>
                  <td className="p-2">true</td>
                  <td className="p-2">Enable chart animations</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">loading</td>
                  <td className="p-2">boolean</td>
                  <td className="p-2">false</td>
                  <td className="p-2">Show loading state</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">error</td>
                  <td className="p-2">string</td>
                  <td className="p-2">null</td>
                  <td className="p-2">Error message to display</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">onDataPointClick</td>
                  <td className="p-2">Function</td>
                  <td className="p-2">undefined</td>
                  <td className="p-2">Callback for data point clicks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardWrapper>
      </div>
    </div>
  )
}
