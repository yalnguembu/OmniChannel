import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { RadialChartProps } from "./types"
import { ChartLoading } from "./ChartLoading"
import { ChartErrorInline } from "./ChartError"
import { ChartEmpty } from "./ChartEmpty"
import { formatValue, validateData } from "./utils"
import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

export function RadialChart({
  data,
  config,
  dataKey,
  width,
  height = 350,
  className,
  showTooltip = true,
  animate = true,
  loading = false,
  error = null,
  emptyMessage,
  onDataPointClick,
  onDataPointHover,
  innerRadius = 30,
  outerRadius = 100,
  startAngle = 90,
  endAngle = -270,
  cornerRadius = 10,
  fill = "var(--chart-1)",
  showLabels = false,
  labelFormatter,
  valueFormatter,
}: RadialChartProps) {
  const validation = useMemo(() => validateData(data), [data])

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

  const formatTooltipValue = (value: number) => {
    if (valueFormatter) {
      return valueFormatter(value)
    }
    return formatValue(value)
  }

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={height}>
          <RadialBarChart
            data={data}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {showTooltip && (
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatTooltipValue(value as number), ""]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.name || label
                      }
                      return label
                    }}
                  />
                }
              />
            )}

            <RadialBar dataKey={dataKey} cornerRadius={cornerRadius} fill={fill} className="fill-primary" isAnimationActive={animate} animationDuration={animate ? 750 : 0} />
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export function RadialProgressChart({
  data,
  config,
  dataKey,
  fill = "var(--chart-1)",
  innerRadius = 60,
  outerRadius = 80,
  showCenterValue = true,
  centerLabel,
  ...props
}: RadialChartProps & {
  showCenterValue?: boolean
  centerLabel?: string
}) {
  const value = (data[0]?.[dataKey] as number) || 0
  const maxValue = 100 // assuming percentage

  return (
    <div className="relative">
      <RadialChart {...props} data={data} config={config} dataKey={dataKey} fill={fill} innerRadius={innerRadius} outerRadius={outerRadius} />

      {showCenterValue && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatValue(value)}
              {typeof value === "number" && value <= 100 ? "%" : ""}
            </div>
            {centerLabel && <div className="text-sm text-muted-foreground">{centerLabel}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export function RadialStackedChart({ data, config, dataKeys, ...props }: Omit<RadialChartProps, "dataKey"> & { dataKeys: string[] }) {
  return (
    <div className={cn("w-full", props.className)}>
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={props.height || 350}>
          <RadialBarChart
            data={data}
            startAngle={props.startAngle || 90}
            endAngle={props.endAngle || -270}
            innerRadius={props.innerRadius || 30}
            outerRadius={props.outerRadius || 100}
          >
            {props.showTooltip && <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatValue(value), config[name as string]?.label || name]} />} />}

            {dataKeys.map((key, index) => {
              const color = config[key]?.color || `var(--chart-${index + 1})`
              const radius = (props.outerRadius || 100) - index * 15

              return (
                <RadialBar
                  key={key}
                  dataKey={key}
                  cornerRadius={props.cornerRadius || 10}
                  fill={color}
                  outerRadius={radius}
                  innerRadius={radius - 10}
                  isAnimationActive={props.animate}
                  animationDuration={props.animate ? 750 : 0}
                />
              )
            })}
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
