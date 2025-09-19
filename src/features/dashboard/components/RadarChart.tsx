import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { RadarChartProps } from "./types"
import { ChartLoading } from "./ChartLoading"
import { ChartErrorInline } from "./ChartError"
import { ChartEmpty } from "./ChartEmpty"
import { formatValue, validateData, getDataKeys } from "./utils"
import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

export function RadarChart({
  data,
  config,
  dataKey,
  width,
  height = 350,
  className,
  showTooltip = true,
  showLegend = true,
  animate = true,
  loading = false,
  error = null,
  emptyMessage,
  onDataPointClick,
  onDataPointHover,
  polarGridType = "polygon",
  radialGridType = "polygon",
  showPolarGrid = true,
  showRadialGrid = true,
  tickCount = 5,
  angleAxisDomain,
  radiusAxisDomain,
  fillOpacity = 0.6,
}: RadarChartProps) {
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
          <RechartsRadarChart data={data} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {showPolarGrid && <PolarGrid gridType={polarGridType} className="stroke-muted" />}

            <PolarAngleAxis dataKey="name" className="text-xs fill-muted-foreground" />

            {showRadialGrid && <PolarRadiusAxis tick={false} tickCount={tickCount} domain={radiusAxisDomain} className="text-xs fill-muted-foreground" />}

            {showTooltip && <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatValue(value), config[name as string]?.label || name]} />} />}

            {showLegend && <ChartLegend content={<ChartLegendContent />} />}

            {dataKeys.map((key, index) => {
              const color = config[key]?.color || `var(--chart-${index + 1})`

              return (
                <Radar
                  key={key}
                  name={config[key]?.label || key}
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={fillOpacity}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: color,
                  }}
                  isAnimationActive={animate}
                  animationDuration={animate ? 750 : 0}
                />
              )
            })}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export function RadarChartMultiSeries({ data, config, dataKeys, ...props }: Omit<RadarChartProps, "dataKey"> & { dataKeys: string[] }) {
  return <RadarChart {...props} data={data} config={config} dataKey={dataKeys} />
}

export function RadarChartSimple({ data, config, dataKey, showLegend = false, fillOpacity = 0.3, ...props }: RadarChartProps) {
  return <RadarChart {...props} data={data} config={config} dataKey={dataKey} showLegend={showLegend} fillOpacity={fillOpacity} />
}
