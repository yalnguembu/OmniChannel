// Standard data structure for all chart types
export interface ChartDataPoint {
  // Primary identifier (x-axis for most charts)
  name: string
  // Numeric values for visualization
  [key: string]: string | number
}

// Example data structures for different chart types

// Line/Area/Bar Chart Data
export interface TimeSeriesData extends ChartDataPoint {
  name: string // Date, month, category name
  value: number
  [additionalMetric: string]: string | number
}

// Multi-series Line/Area/Bar Chart Data
export interface MultiSeriesData extends ChartDataPoint {
  name: string
  series1: number
  series2: number
  series3?: number
  [seriesN: string]: string | number
}

// Pie/Donut Chart Data
export interface PieChartData {
  name: string
  value: number
  fill?: string
}

// Radar Chart Data
export interface RadarChartData {
  subject: string
  A: number
  B: number
  fullMark?: number
}

// Sample data for testing and examples
export const sampleTimeSeriesData: TimeSeriesData[] = [
  { name: "Jan", value: 400, growth: 24 },
  { name: "Feb", value: 300, growth: -12 },
  { name: "Mar", value: 600, growth: 18 },
  { name: "Apr", value: 800, growth: 33 },
  { name: "May", value: 700, growth: -12 },
  { name: "Jun", value: 900, growth: 28 },
]

export const sampleMultiSeriesData: MultiSeriesData[] = [
  { name: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { name: "Feb", desktop: 305, mobile: 200, tablet: 98 },
  { name: "Mar", desktop: 237, mobile: 120, tablet: 86 },
  { name: "Apr", desktop: 73, mobile: 190, tablet: 99 },
  { name: "May", desktop: 209, mobile: 130, tablet: 71 },
  { name: "Jun", desktop: 214, mobile: 140, tablet: 88 },
]

export const samplePieData: PieChartData[] = [
  { name: "Chrome", value: 275, fill: "var(--chart-1)" },
  { name: "Safari", value: 200, fill: "var(--chart-2)" },
  { name: "Firefox", value: 187, fill: "var(--chart-3)" },
  { name: "Edge", value: 173, fill: "var(--chart-4)" },
  { name: "Other", value: 90, fill: "var(--chart-5)" },
]

export const sampleRadarData: RadarChartData[] = [
  { subject: "Math", A: 120, B: 110, fullMark: 150 },
  { subject: "Chinese", A: 98, B: 130, fullMark: 150 },
  { subject: "English", A: 86, B: 130, fullMark: 150 },
  { subject: "Geography", A: 99, B: 100, fullMark: 150 },
  { subject: "Physics", A: 85, B: 90, fullMark: 150 },
  { subject: "History", A: 65, B: 85, fullMark: 150 },
]

// Chart configuration helpers are now in utils.ts

// Data validation helpers
export const validateChartData = (data: unknown[]): data is ChartDataPoint[] => {
  if (!Array.isArray(data) || data.length === 0) return false

  return data.every((item) => typeof item === "object" && item !== null && "name" in item && typeof item.name === "string")
}

export const getNumericKeys = (data: ChartDataPoint[]): string[] => {
  if (data.length === 0) return []

  return Object.keys(data[0]).filter((key) => key !== "name" && typeof data[0][key] === "number")
}
