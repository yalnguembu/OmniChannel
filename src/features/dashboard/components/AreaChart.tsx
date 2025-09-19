import { Area, AreaChart as RechartsAreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { AreaChartProps } from "./types"
import { ChartLoading } from "./ChartLoading"
import { ChartErrorInline } from "./ChartError"
import { ChartEmpty } from "./ChartEmpty"
import { defaultMargin, formatValue, generateGradient, validateData, getDataKeys } from "./utils"
import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

export function AreaChart({
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
  curveType = "monotone",
  strokeWidth = 2,
  fillOpacity = 0.6,
  stackId,
  gradient = true,
  connectNulls = false,
}: AreaChartProps) {
  const validation = useMemo(() => validateData(data), [data])

  const dataKeys = useMemo(() => {
    if (typeof dataKey === "string") return [dataKey]
    if (Array.isArray(dataKey)) return dataKey
    return getDataKeys(data)
  }, [dataKey, data])

  const gradients = useMemo(() => {
    if (!gradient) return null
    return dataKeys.map((key, index) => {
      const color = config[key]?.color || `var(--chart-${index + 1})`
      return generateGradient(`gradient-${key}`, color, fillOpacity)
    })
  }, [gradient, dataKeys, config, fillOpacity])

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
          <RechartsAreaChart data={data} margin={margin} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {gradients && <defs>{gradients}</defs>}

            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}

            <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={(value) => String(value).slice(0, 10)} />

            <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={formatValue} />

            {showTooltip && <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatValue(value), config[name as string]?.label || name]} />} />}

            {showLegend && <ChartLegend content={<ChartLegendContent />} />}

            {dataKeys.map((key, index) => {
              const color = config[key]?.color || `var(--chart-${index + 1})`
              const fillColor = gradient ? `url(#gradient-${key})` : color

              return (
                <Area
                  key={key}
                  type={curveType}
                  dataKey={key}
                  stackId={stackId}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill={fillColor}
                  fillOpacity={gradient ? 1 : fillOpacity}
                  connectNulls={connectNulls}
                  isAnimationActive={animate}
                  animationDuration={animate ? 750 : 0}
                />
              )
            })}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export function AreaChartStacked({ data, config, dataKeys, stackId = "stack", ...props }: Omit<AreaChartProps, "dataKey"> & { dataKeys: string[] }) {
  return <AreaChart {...props} data={data} config={config} dataKey={dataKeys} stackId={stackId} />
}

export function AreaChartGradient({ data, config, dataKey, gradient = true, fillOpacity = 0.8, ...props }: AreaChartProps) {
  return <AreaChart {...props} data={data} config={config} dataKey={dataKey} gradient={gradient} fillOpacity={fillOpacity} />
}
