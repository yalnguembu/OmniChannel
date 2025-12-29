import { ChartConfig } from "@/shared/components/ui/chart"

export interface BaseChartData {
  [key: string]: string | number
}

export interface ChartMargin {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface BaseChartProps<T extends BaseChartData = BaseChartData> {
  data: T[]
  config: ChartConfig
  width?: number
  height?: number
  margin?: ChartMargin
  className?: string
  showTooltip?: boolean
  showLegend?: boolean
  showGrid?: boolean
  animate?: boolean
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  onDataPointClick?: (data: T, index: number) => void
  onDataPointHover?: (data: T | null, index: number) => void
}

export interface BarChartProps extends BaseChartProps {
  dataKey: string | string[]
  orientation?: "horizontal" | "vertical"
  stacked?: boolean
  maxBarSize?: number
  barGap?: number
  barCategoryGap?: number
  showValues?: boolean
  valueLabelPosition?: "top" | "bottom" | "inside" | "outside"
}

export interface LineChartProps extends BaseChartProps {
  dataKey: string | string[]
  curveType?: "monotone" | "linear" | "natural" | "step" | "stepBefore" | "stepAfter"
  strokeWidth?: number
  showDots?: boolean
  dotSize?: number
  activeDotSize?: number
  connectNulls?: boolean
  showArea?: boolean
  areaOpacity?: number
  gradient?: boolean
}

export interface AreaChartProps extends Omit<LineChartProps, "showArea"> {
  stackId?: string
  fillOpacity?: number
}

export interface PieChartProps extends Omit<BaseChartProps, "showGrid"> {
  dataKey: string
  nameKey: string
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  startAngle?: number
  endAngle?: number
  showLabels?: boolean
  labelPosition?: "inside" | "outside" | "insideStart" | "top" | "left" | "right" | "bottom" | "insideLeft" | "insideRight" | "insideTop" | "insideBottom" | "insideTopLeft" | "insideBottomLeft" | "insideTopRight" | "insideBottomRight" | "insideStart" | "insideEnd" | "end" | "center" | "centerTop" | "centerBottom" | "middle"
  labelFormatter?: (value: any) => string
  valueFormatter?: (value: number) => string
  colorScheme?: "default" | "category" | "diverging" | "sequential"
}

export interface DonutChartProps extends PieChartProps {
  centerLabel?: string
  centerValue?: string | number
  showCenterContent?: boolean
}

export interface RadarChartProps extends BaseChartProps {
  dataKey: string | string[]
  polarGridType?: "polygon" | "circle"
  showPolarGrid?: boolean
  showRadialGrid?: boolean
  tickCount?: number
  radiusAxisDomain?: [number, number]
  fillOpacity?: number
}

export interface RadialChartProps extends Omit<BaseChartProps, "showGrid"> {
  dataKey: string
  innerRadius?: number
  outerRadius?: number
  startAngle?: number
  endAngle?: number
  cornerRadius?: number
  fill?: string
  showLabels?: boolean
  labelFormatter?: (value: any) => string
  valueFormatter?: (value: number) => string
}

export interface ChartLoadingProps {
  height?: number
  className?: string
}

export interface ChartErrorProps {
  error: string
  onRetry?: () => void
  className?: string
}

export interface ChartEmptyProps {
  message?: string
  className?: string
}

export type ChartVariant = "default" | "outlined" | "filled" | "minimal"
export type ChartSize = "sm" | "md" | "lg" | "xl"

export interface ChartTheme {
  colors: string[]
  backgroundColor?: string
  textColor?: string
  gridColor?: string
  borderColor?: string
}

export interface ChartExportOptions {
  format: "png" | "svg" | "pdf" | "csv" | "json"
  filename?: string
  quality?: number
  width?: number
  height?: number
}
