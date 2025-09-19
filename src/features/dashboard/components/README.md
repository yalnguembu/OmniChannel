# Dashboard Chart Components

A comprehensive collection of customizable, type-safe chart components built with React, TypeScript, and Recharts for production-ready dashboards.

## Features

- 🎯 **Type-safe**: Full TypeScript support with comprehensive type definitions
- 🎨 **Customizable**: Extensive styling and configuration options
- 📊 **Multiple Chart Types**: Area, Bar, Line, Pie/Donut, Radar, and Radial charts
- 🔄 **Loading States**: Built-in loading, error, and empty state handling  
- 🎭 **Responsive**: Fully responsive with configurable dimensions
- 📱 **Interactive**: Click and hover event handlers
- 🎨 **Theme Support**: Integrated with your design system
- 📈 **Data Validation**: Automatic data validation and error handling

## Quick Start

```tsx
import { AreaChart, generateChartConfig } from "@/features/dashboard/components"

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
]

const config = generateChartConfig(["value"])

function MyChart() {
  return (
    <AreaChart
      data={data}
      config={config}
      dataKey="value"
      height={350}
      showTooltip
      showLegend
    />
  )
}
```

## Available Chart Types

### Area Charts
- `AreaChart` - Basic area chart with gradient fills
- `AreaChartStacked` - Stacked areas for multiple data series
- `AreaChartGradient` - Enhanced gradient styling

### Bar Charts  
- `BarChart` - Vertical/horizontal bars with customizable styling
- `BarChartStacked` - Stacked bars for category comparisons
- `BarChartHorizontal` - Horizontal orientation variant

### Line Charts
- `LineChart` - Clean line charts with dots and animations
- `LineChartSmooth` - Curved/smooth line interpolation
- `LineChartStep` - Step-based line charts
- `LineChartMultiAxis` - Multiple data series support

### Pie/Donut Charts
- `PieChart` - Traditional pie charts with labels
- `DonutChart` - Donut variant with center content
- `PieChartWithLabels` - Enhanced labeling options

### Radar Charts
- `RadarChart` - Multi-dimensional data visualization
- `RadarChartMultiSeries` - Multiple data series
- `RadarChartSimple` - Minimal styling variant

### Radial Charts
- `RadialChart` - Circular progress/gauge charts
- `RadialProgressChart` - Progress indicator with center value
- `RadialStackedChart` - Multiple radial bars

## Data Structure

All charts expect data in a consistent format:

```tsx
interface ChartDataPoint {
  name: string        // Label/category identifier
  [key: string]: string | number  // Metric values
}

// Example
const data: ChartDataPoint[] = [
  { name: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { name: "Feb", desktop: 305, mobile: 200, tablet: 98 },
  { name: "Mar", desktop: 237, mobile: 120, tablet: 86 },
]
```

## Configuration

Charts use a configuration object to define styling and labels:

```tsx
const config = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)", // CSS custom property
  },
  mobile: {
    label: "Mobile", 
    color: "var(--chart-2)",
  },
}

// Or generate automatically
const config = generateChartConfig(["desktop", "mobile", "tablet"])
```

## Common Props

All chart components share these base properties:

```tsx
interface BaseChartProps {
  data: ChartDataPoint[]           // Chart data
  config: ChartConfig              // Styling configuration
  width?: number                   // Chart width
  height?: number                  // Chart height (default: 350)
  className?: string               // Additional CSS classes
  showTooltip?: boolean           // Enable tooltips (default: true)
  showLegend?: boolean            // Show legend (default: true) 
  showGrid?: boolean              // Show grid lines (default: true)
  animate?: boolean               // Enable animations (default: true)
  loading?: boolean               // Show loading state
  error?: string | null           // Error message to display
  emptyMessage?: string           // Custom empty state message
  onDataPointClick?               // Click event handler
  onDataPointHover?               // Hover event handler
}
```

## Usage with CardWrapper

Charts are designed to be wrapped in your existing CardWrapper component:

```tsx
import CardWrapper from "@/shared/components/CardWrapper"
import { BarChart } from "@/features/dashboard/components"

function DashboardCard() {
  return (
    <CardWrapper 
      title="Monthly Sales"
      description="Revenue breakdown by month"
    >
      <BarChart
        data={salesData}
        config={salesConfig}
        dataKey={["desktop", "mobile"]}
        stacked
        showValues
      />
    </CardWrapper>
  )
}
```

## Loading and Error States

Charts handle loading, error, and empty states automatically:

```tsx
<AreaChart
  data={data}
  config={config}
  dataKey="value"
  loading={isLoading}
  error={error}
  emptyMessage="No data available for selected period"
/>
```

## Utility Functions

Additional utilities for data manipulation and formatting:

```tsx
import { 
  formatValue,
  formatCurrency,
  calculateTotal,
  sortDataByKey,
  exportToCSV,
  validateChartData
} from "@/features/dashboard/components"

// Format numbers for display
const formatted = formatValue(1234567) // "1.2M"

// Sort data by key
const sorted = sortDataByKey(data, "value", "desc")

// Export data
exportToCSV(data, "sales-report.csv")

// Validate data structure
const { isValid, error } = validateChartData(data)
```

## Sample Data

Use the provided sample data for testing and development:

```tsx
import { 
  sampleTimeSeriesData,
  sampleMultiSeriesData,
  samplePieData,
  sampleRadarData 
} from "@/features/dashboard/components"

// Ready-to-use sample datasets for each chart type
```

## TypeScript Support

Full type definitions are provided for all components and props:

```tsx
import type { 
  BarChartProps,
  ChartDataPoint,
  ChartConfig 
} from "@/features/dashboard/components"

// Type-safe chart configuration
const chartProps: BarChartProps = {
  data: myData,
  config: myConfig,
  dataKey: "sales",
  orientation: "horizontal"
}
```