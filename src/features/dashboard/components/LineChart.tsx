import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { LineChartProps } from "./types"
import { ChartLoading } from "./ChartLoading"
import { ChartErrorInline } from "./ChartError"
import { ChartEmpty } from "./ChartEmpty"
import { defaultMargin, formatValue, validateData, getDataKeys } from "./utils"
import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

export function LineChart({
  data,
  config,
  dataKey,
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
  curveType = "monotone",
  strokeWidth = 2,
  showDots = true,
  dotSize = 4,
  activeDotSize = 6,
  connectNulls = false,
}: LineChartProps) {
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

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data} margin={margin} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}

            <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={(value) => String(value).slice(0, 10)} />

            <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={formatValue} />

            {showTooltip && <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatValue(value), config[name as string]?.label || name]} />} />}

            {showLegend && <ChartLegend content={<ChartLegendContent />} />}

            {dataKeys.map((key, index) => {
              const color = config[key]?.color || `var(--chart-${index + 1})`

              return (
                <Line
                  key={key}
                  type={curveType}
                  dataKey={key}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  dot={
                    showDots
                      ? {
                        fill: color,
                        strokeWidth: 0,
                        r: dotSize,
                      }
                      : false
                  }
                  activeDot={
                    showDots
                      ? {
                        r: activeDotSize,
                        fill: color,
                        stroke: color,
                        strokeWidth: 2,
                      }
                      : false
                  }
                  connectNulls={connectNulls}
                  isAnimationActive={animate}
                  animationDuration={animate ? 750 : 0}
                />
              )
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export function LineChartSmooth({ data, config, dataKey, curveType = "natural", ...props }: LineChartProps) {
  return <LineChart {...props} data={data} config={config} dataKey={dataKey} curveType={curveType} />
}

export function LineChartStep({ data, config, dataKey, curveType = "step", ...props }: LineChartProps) {
  return <LineChart {...props} data={data} config={config} dataKey={dataKey} curveType={curveType} />
}

export function LineChartMultiAxis({ data, config, dataKeys, ...props }: Omit<LineChartProps, "dataKey"> & { dataKeys: string[] }) {
  return <LineChart {...props} data={data} config={config} dataKey={dataKeys} />
}
