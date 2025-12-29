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
  series3: number
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

// Chart configuration helpers are now in utils.ts

// Data validation helpers
export const validateChartData = (data: unknown[]): data is ChartDataPoint[] => {
  if (!Array.isArray(data) || data.length === 0) return false

  return data.every((item) => typeof item === "object" && item !== null && "name" in item && typeof (item as any).name === "string")
}

export const getNumericKeys = (data: ChartDataPoint[]): string[] => {
  if (data.length === 0) return []

  return Object.keys(data[0]).filter((key) => key !== "name" && typeof data[0][key] === "number")
}
