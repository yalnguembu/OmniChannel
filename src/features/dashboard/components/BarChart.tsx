import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, LabelList } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { BarChartProps } from "./types"
import { ChartLoading } from "./ChartLoading"
import { ChartErrorInline } from "./ChartError"
import { ChartEmpty } from "./ChartEmpty"
import { defaultMargin, formatValue, validateData, getDataKeys } from "./utils"
import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

export function BarChart({
  data,
  config,
  dataKey,
  width,
  height = 350,
  margin = defaultMargin,
  className,
  showTooltip = true,
  showLegend = true,
  showGrid = true,
  animate = true,
  loading = false,
  error = null,
  emptyMessage,
  onDataPointClick,
  onDataPointHover,
  orientation = "vertical",
  stacked = false,
  maxBarSize = 50,
  barGap = 4,
  barCategoryGap = 20,
  showValues = false,
  valueLabelPosition = "top",
}: BarChartProps) {
  const validation = useMemo(() => validateData(data), [data])

  const dataKeys = useMemo(() => {
    if (typeof dataKey === "string") return [dataKey]
    if (Array.isArray(dataKey)) return dataKey
    return getDataKeys(data)
  }, [dataKey, data])

  if (loading) {
    return <ChartLoading height={height} className={className} />
  }

  if (error) {
    return <ChartErrorInline error={error} className={className} />
  }

  if (!validation.isValid || data.length === 0) {
    return <ChartEmpty message={emptyMessage || validation.error || "No data available"} className={className} />
  }

  const handleClick = (data: any, index: number) => {
    if (onDataPointClick) {
      onDataPointClick(data, index)
    }
  }

  const handleMouseEnter = (data: any, index: number) => {
    if (onDataPointHover) {
      onDataPointHover(data, index)
    }
  }

  const handleMouseLeave = () => {
    if (onDataPointHover) {
      onDataPointHover(null, -1)
    }
  }

  const isHorizontal = orientation === "horizontal"
  const stackId = stacked ? "stack" : undefined

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            margin={margin}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            layout={isHorizontal ? "horizontal" : "vertical"}
            maxBarSize={maxBarSize}
            barGap={barGap}
            barCategoryGap={barCategoryGap}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={!isHorizontal} vertical={isHorizontal} />}

            {isHorizontal ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={formatValue} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={(value) => String(value).slice(0, 10)} />
                <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={formatValue} />
              </>
            )}

            {showTooltip && <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatValue(value), config[name as string]?.label || name]} />} />}

            {showLegend && <ChartLegend content={<ChartLegendContent />} />}

            {dataKeys.map((key, index) => {
              const color = config[key]?.color || `var(--chart-${index + 1})`

              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId={stackId}
                  fill={color}
                  radius={stacked ? (index === 0 ? [0, 0, 4, 4] : index === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]) : [4, 4, 0, 0]}
                  isAnimationActive={animate}
                  animationDuration={animate ? 750 : 0}
                >
                  {showValues && <LabelList dataKey={key} position={valueLabelPosition} className="fill-foreground text-xs" formatter={formatValue} />}
                </Bar>
              )
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export function BarChartStacked({ data, config, dataKeys, stacked = true, ...props }: Omit<BarChartProps, "dataKey" | "stacked"> & { dataKeys: string[] }) {
  return <BarChart {...props} data={data} config={config} dataKey={dataKeys} stacked={stacked} />
}

export function BarChartHorizontal({ data, config, dataKey, orientation = "horizontal", ...props }: BarChartProps) {
  return <BarChart {...props} data={data} config={config} dataKey={dataKey} orientation={orientation} />
}
