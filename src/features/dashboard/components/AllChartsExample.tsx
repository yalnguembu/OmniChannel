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
  generateChartConfig
} from "@/features/dashboard/components"

// Sample data
const basicData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 700 },
]

const multiData = [
  { name: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { name: "Feb", desktop: 305, mobile: 200, tablet: 98 },
  { name: "Mar", desktop: 237, mobile: 120, tablet: 86 },
  { name: "Apr", desktop: 273, mobile: 190, tablet: 99 },
]

const pieData = [
  { name: "Desktop", value: 400, fill: "var(--chart-1)" },
  { name: "Mobile", value: 300, fill: "var(--chart-2)" },
  { name: "Tablet", value: 200, fill: "var(--chart-3)" },
]

const radarData = [
  { name: "Speed", A: 120, B: 110 },
  { name: "Quality", A: 98, B: 130 },
  { name: "Price", A: 86, B: 130 },
  { name: "Support", A: 99, B: 100 },
]

const progressData = [
  { name: "Progress", value: 75 }
]

// Configs
const basicConfig = generateChartConfig(["value"])
const multiConfig = generateChartConfig(["desktop", "mobile", "tablet"])
const pieConfig = generateChartConfig(["Desktop", "Mobile", "Tablet"])
const radarConfig = generateChartConfig(["A", "B"])
const progressConfig = generateChartConfig(["value"])

export function AllChartsExample() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-6">All Chart Components Examples</h2>
      
      {/* Area Charts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Area Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <CardWrapper title="Basic Area Chart">
            <AreaChart
              data={basicData}
              config={basicConfig}
              dataKey="value"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Stacked Area Chart">
            <AreaChartStacked
              data={multiData}
              config={multiConfig}
              dataKeys={["desktop", "mobile"]}
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Gradient Area Chart">
            <AreaChartGradient
              data={basicData}
              config={basicConfig}
              dataKey="value"
              height={200}
              fillOpacity={0.8}
            />
          </CardWrapper>

        </div>
      </section>

      {/* Bar Charts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Bar Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <CardWrapper title="Basic Bar Chart">
            <BarChart
              data={multiData}
              config={multiConfig}
              dataKey="desktop"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Stacked Bar Chart">
            <BarChartStacked
              data={multiData}
              config={multiConfig}
              dataKeys={["desktop", "mobile", "tablet"]}
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Horizontal Bar Chart">
            <BarChartHorizontal
              data={multiData.slice(0, 3)}
              config={multiConfig}
              dataKey="desktop"
              height={200}
            />
          </CardWrapper>

        </div>
      </section>

      {/* Line Charts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Line Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <CardWrapper title="Basic Line Chart">
            <LineChart
              data={basicData}
              config={basicConfig}
              dataKey="value"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Smooth Line Chart">
            <LineChartSmooth
              data={basicData}
              config={basicConfig}
              dataKey="value"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Step Line Chart">
            <LineChartStep
              data={basicData}
              config={basicConfig}
              dataKey="value"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Multi-Axis Line Chart">
            <LineChartMultiAxis
              data={multiData}
              config={multiConfig}
              dataKeys={["desktop", "mobile"]}
              height={200}
            />
          </CardWrapper>

        </div>
      </section>

      {/* Pie Charts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Pie Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <CardWrapper title="Basic Pie Chart">
            <PieChart
              data={pieData}
              config={pieConfig}
              dataKey="value"
              nameKey="name"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Donut Chart">
            <DonutChart
              data={pieData}
              config={pieConfig}
              dataKey="value"
              nameKey="name"
              height={200}
              centerLabel="Total"
            />
          </CardWrapper>

          <CardWrapper title="Pie Chart with Labels">
            <PieChartWithLabels
              data={pieData}
              config={pieConfig}
              dataKey="value"
              nameKey="name"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Half Pie Chart">
            <HalfPieChart
              data={pieData}
              config={pieConfig}
              dataKey="value"
              nameKey="name"
              height={150}
            />
          </CardWrapper>

          <CardWrapper title="Half Donut Chart">
            <HalfDonutChart
              data={pieData}
              config={pieConfig}
              dataKey="value"
              nameKey="name"
              height={150}
              centerLabel="Total"
            />
          </CardWrapper>

        </div>
      </section>

      {/* Radar Charts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Radar Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <CardWrapper title="Basic Radar Chart">
            <RadarChart
              data={radarData}
              config={radarConfig}
              dataKey="A"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Multi-Series Radar">
            <RadarChartMultiSeries
              data={radarData}
              config={radarConfig}
              dataKeys={["A", "B"]}
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Simple Radar Chart">
            <RadarChartSimple
              data={radarData}
              config={radarConfig}
              dataKey="A"
              height={200}
            />
          </CardWrapper>

        </div>
      </section>

      {/* Radial Charts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Radial Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <CardWrapper title="Basic Radial Chart">
            <RadialChart
              data={progressData}
              config={progressConfig}
              dataKey="value"
              height={200}
            />
          </CardWrapper>

          <CardWrapper title="Radial Progress Chart">
            <RadialProgressChart
              data={progressData}
              config={progressConfig}
              dataKey="value"
              height={200}
              centerLabel="Progress"
            />
          </CardWrapper>

          <CardWrapper title="Radial Stacked Chart">
            <RadialStackedChart
              data={multiData.slice(0, 1)}
              config={multiConfig}
              dataKeys={["desktop", "mobile"]}
              height={200}
            />
          </CardWrapper>

        </div>
      </section>

    </div>
  )
}