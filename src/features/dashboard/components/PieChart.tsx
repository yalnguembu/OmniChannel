import { LabelList, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { PieChartProps, DonutChartProps } from "./types"
import { ChartLoading } from "./ChartLoading"
import { ChartErrorInline } from "./ChartError"
import { ChartEmpty } from "./ChartEmpty"
import { formatValue, validateData, formatPercentage, calculateTotal } from "./utils"
import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

export function PieChart({
  data,
  config,
  dataKey,
  nameKey,
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
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 0,
  startAngle = 0,
  endAngle = 360,
  showLabels = false,
  labelPosition = "outside",
  labelFormatter,
  valueFormatter,
}: PieChartProps) {
  const validation = useMemo(() => validateData(data), [data])

  const total = useMemo(() => calculateTotal(data, dataKey), [data, dataKey])

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

  const formatLabel = (entry: any) => {
    if (labelFormatter) {
      return labelFormatter(entry[nameKey])
    }
    return entry[nameKey]
  }

  const formatTooltipValue = (value: number) => {
    if (valueFormatter) {
      return valueFormatter(value)
    }
    return `${formatValue(value)} (${formatPercentage(value, total)})`
  }

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer config={config}>
        {width ? (
          <RechartsPieChart width={width} height={height}>
            {showTooltip && (
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatTooltipValue(value as number), ""]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload) {
                        return payload[0].payload[nameKey]
                      }
                      return label
                    }}
                  />
                }
              />
            )}

            {showLegend && <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: "20px" }} />}

            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={paddingAngle}
              startAngle={startAngle}
              endAngle={endAngle}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isAnimationActive={animate}
              animationDuration={animate ? 750 : 0}
            >
              {data.map((entry, index) => {
                const color = (entry as any).fill || config[String(entry[nameKey])]?.color || `var(--chart-${(index % 5) + 1})`
                return <Cell key={`cell-${index}`} fill={color} />
              })}

              {showLabels && <LabelList dataKey={nameKey} position={labelPosition} className="fill-foreground text-xs" formatter={formatLabel} />}
            </Pie>
          </RechartsPieChart>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              {showTooltip && (
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [formatTooltipValue(value as number), ""]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0 && payload[0].payload) {
                          return payload[0].payload[nameKey]
                        }
                        return label
                      }}
                    />
                  }
                />
              )}

              {showLegend && <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: "20px" }} />}

              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={paddingAngle}
                startAngle={startAngle}
                endAngle={endAngle}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isAnimationActive={animate}
                animationDuration={animate ? 750 : 0}
              >
                {data.map((entry, index) => {
                  const color = (entry as any).fill || config[String(entry[nameKey])]?.color || `var(--chart-${(index % 5) + 1})`
                  return <Cell key={`cell-${index}`} fill={color} />
                })}

                {showLabels && <LabelList dataKey={nameKey} position={labelPosition} className="fill-foreground text-xs" formatter={formatLabel} />}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  )
}

export function DonutChart({ data, config, dataKey, nameKey, innerRadius = 50, outerRadius = 80, centerLabel, centerValue, showCenterContent = true, ...props }: DonutChartProps) {
  const total = useMemo(() => calculateTotal(data, dataKey), [data, dataKey])

  return (
    <div className="relative">
      <PieChart {...props} data={data} config={config} dataKey={dataKey} nameKey={nameKey} innerRadius={innerRadius} outerRadius={outerRadius} />

      {showCenterContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerValue && <div className="text-2xl font-bold">{typeof centerValue === "number" ? formatValue(centerValue) : centerValue}</div>}
            {centerLabel && <div className="text-sm text-muted-foreground">{centerLabel}</div>}
            {!centerValue && !centerLabel && (
              <>
                <div className="text-2xl font-bold">{formatValue(total)}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function PieChartWithLabels({ data, config, dataKey, nameKey, showLabels = true, labelPosition = "outside", ...props }: PieChartProps) {
  return <PieChart {...props} data={data} config={config} dataKey={dataKey} nameKey={nameKey} showLabels={showLabels} labelPosition={labelPosition} />
}

export function HalfPieChart({ data, config, dataKey, nameKey, startAngle = 180, endAngle = 0, ...props }: PieChartProps) {
  return <PieChart {...props} data={data} config={config} dataKey={dataKey} nameKey={nameKey} startAngle={startAngle} endAngle={endAngle} />
}

export function HalfDonutChart({
  data,
  config,
  dataKey,
  nameKey,
  innerRadius = 40,
  outerRadius = 70,
  startAngle = 180,
  endAngle = 0,
  centerLabel,
  centerValue,
  showCenterContent = true,
  ...props
}: DonutChartProps) {
  const total = useMemo(() => calculateTotal(data, dataKey), [data, dataKey])

  return (
    <div className="relative">
      <PieChart
        {...props}
        data={data}
        config={config}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        height={props.height || 250}
      />

      {showCenterContent && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <div className="text-center">
            {centerValue && <div className="text-xl font-bold">{typeof centerValue === "number" ? formatValue(centerValue) : centerValue}</div>}
            {centerLabel && <div className="text-xs text-muted-foreground">{centerLabel}</div>}
            {!centerValue && !centerLabel && (
              <>
                <div className="text-xl font-bold">{formatValue(total)}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
