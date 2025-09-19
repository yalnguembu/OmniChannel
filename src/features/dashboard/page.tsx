import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, Label, Pie, PieChart, ResponsiveContainer, YAxis, LabelList } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/shared/components/ui/chart"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"
import CardWrapper from "@/shared/components/CardWrapper"
import {
  Globe,
  DollarSign,
  CircleAlert,
  Percent,
  CreditCard,
  TrendingUp,
  List,
  Building,
  AppWindow,
  Users,
  User,
  ArrowDownCircle,
  BarChart2,
  Activity,
  ArrowLeftRight,
  Shield,
  ShieldAlert,
  Phone,
  Blocks,
  CheckCircle,
  Zap,
  Gauge,
  Eye,
  ArrowUp,
  ArrowDownRightFromSquareIcon,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { createElement, useEffect, useState } from "react"
import { Button } from "@/shared"
import { getApiReceiptsReadModelGetAllStatus } from "@/shared/api/sdk.gen"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { useTranslation } from "react-i18next"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { Badge } from "@/shared/components/ui/badge"

const radarChartData = [
  { month: "Fjisat", om: 186, momo: 80 },
  { month: "Reabo", om: 305, momo: 200 },
  { month: "Fujisatcam", om: 237, momo: 120 },
  { month: "FujiMbile", om: 73, momo: 190 },
  { month: "May", om: 209, momo: 130 },
  { month: "June", om: 214, momo: 140 },
]
const radarChartConfig = {
  om: {
    label: "OM",
    color: "var(--om)",
  },
  momo: {
    label: "MOMO",
    color: "var(--momo)",
  },
} satisfies ChartConfig

const areaChartData = [
  { date: "2025-04-01", om: 186, momo: 80 },
  { date: "2025-05-01", om: 305, momo: 200 },
  { date: "2025-06-01", om: 237, momo: 120 },
  { date: "2025-07-01", om: 73, momo: 190 },
  { date: "2025-08-01", om: 209, momo: 130 },
  { date: "2025-09-01", om: 214, momo: 140 },
]
const areaChartConfig = {
  om: {
    label: "OM",
    color: "var(--om)",
  },
  momo: {
    label: "MOMO",
    color: "var(--momo)",
  },
} satisfies ChartConfig

const barChartData = [
  { operator: "Receipts", balance: 186 },
  { operator: "Withdrawals", balance: 305 },
]
const barChartConfig = {
  om: {
    label: "OM",
    color: "var(--om)",
  },
  momo: {
    label: "MOMO",
    color: "var(--momo)",
  },
} satisfies ChartConfig

const pieChartData = [
  { browser: "om", visitors: 275, fill: "var(--om)" },
  { browser: "momo", visitors: 200, fill: "var(--momo)" },
]
const pieChartConfig = {
  visitors: {
    label: "Operators",
  },
  om: {
    label: "MTN",
    color: "var(--om)",
  },
  momo: {
    label: "OM",
    color: "var(--momo)",
  },
} satisfies ChartConfig

const horizontalChartData = [
  { browser: "PENDING", visitors: 186, fill: "var(--pending)" },
  { browser: "PROCESSING", visitors: 305, fill: "var(--processing)" },
  { browser: "VALIDATING", visitors: 237, fill: "var(--validating)" },
  { browser: "COMPLETED", visitors: 73, fill: "var(--completed)" },
  { browser: "FAILED", visitors: 209, fill: "var(--failed)" },
  { browser: "CANCELLED", visitors: 14, fill: "var(--cancelled)" },
  { browser: "REJECTED", visitors: 35, fill: "var(--rejected)" },
  { browser: "TIMEOUT", visitors: 5, fill: "var(--timeout)" },
]

const horizontalChartConfig = {
  COMPLETED: {
    label: "Completed",
    color: "var(--completed)",
  },
  FAILED: {
    label: "Failed",
    color: "var(--failed)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "var(--cancelled)",
  },
  REJECTED: {
    label: "Rejected",
    color: "var(--rejected)",
  },
  TIMEOUT: {
    label: "Timeout",
    color: "var(--timeout)",
  },
  VALIDATING: {
    label: "Validating",
    color: "var(--validating)",
  },
  PENDING: {
    label: "Pending",
    color: "var(--pending)",
  },
  PROCESSING: {
    label: "Processing",
    color: "var(--processing)",
  },
  visitors: {
    label: "Count",
    color: "var(--background)",
  },
} satisfies ChartConfig

export function DashboardPage() {
  const { t } = useTranslation()
  const quickAtions = [
    {
      label: "menu.countries",
      path: "/administration/countries",
      icon: Globe,
    },
    {
      label: "menu.users",
      path: "/access-control/users",
      icon: Users,
      addPagePath: "/access-control/users/add",
      addButtonLabel: "menu.addUser",
    },
    {
      label: "menu.companies",
      path: "/companies",
      icon: Building,
      addPagePath: "/companies/add",
      addButtonLabel: "menu.addCompany",
    },
    {
      label: "menu.applications",
      path: "/applications",
      icon: AppWindow,
      addPagePath: "/applications/add",
      addButtonLabel: "menu.addApplication",
    },
    {
      label: "menu.all",
      path: "/transactions",
      icon: List,
    },
    {
      label: "menu.receipts",
      path: "/transactions/receipts",
      icon: DollarSign,
    },
    {
      label: "menu.withdrawals",
      path: "/transactions/withdrawals",
      icon: ArrowDownCircle,
    },
  ]
  const [dateRage, setDateRange] = useState()
  const [timeRange, setTimeRange] = useState("90d")

  useEffect(() => {
    // getApiReceiptsReadModelGetAllStatus()
  }, [])

  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-5 pb-4 -mt-4 items-start">
      <Card className="flex flex-col lg:col-span-2 gap-2 py-4">
        <CardHeader className="items-center px-4">
          <CardDescription>
            <span>Total balance</span>
            <CircleAlert className="size-3 text-muted-foreground/60 ml-1 inline" />
          </CardDescription>
          <CardAction>
            <DateRangeInput
              size="sm"
              style="rounded-full h-6 py-1.5 px-2"
              dateFormat="short"
              placeholder="Today"
              formField={{
                value: dateRage,
                name: "date-picker",
                onChange: (event) => setDateRange(event),
              }}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 justify-between items-end pb-0 px-4">
          <div className="flex flex-col">
            <div className="flex flex-col flex-1 gap-y-2 pb-4">
              <CardTitle className="text-3xl">850,900,000 XAF</CardTitle>
              <div className="flex flex-1 items-center gap-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-600 border-none">
                  <TrendingUp />
                  +12.5%
                </Badge>
                <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Since last month</div>
              </div>
            </div>
            <div className="flex w-full justify-between items-center gap-x-3">
              <Link to="/transactions/withdrawals" className="flex gap-3 justify-center items-center border border-muted rounded text-white bg-primary p-2 w-full">
                <ArrowDownCircle className="size-4" />
                <span>{t("menu.withdrawals")}</span>
              </Link>
              <Tooltip>
                <TooltipTrigger>
                  <Link to="/transactions" className="flex gap-3 items-center border border-muted rounded text-foreground/70 p-3 w-full ">
                    <Eye className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("common.actions.view")}</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="w-24 h-32">
            <ChartContainer config={barChartConfig} className="w-full h-full">
              <BarChart accessibilityLayer data={barChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="operator" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                {/* <ChartLegend content={<ChartLegendContent />} /> */}
                <Bar dataKey="balance" stackId="a" fill="var(--color-om)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="balance" stackId="a" fill="var(--color-momo)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
        {/* <CardFooter className="flex-col gap-2 text-sm">
          
        </CardFooter> */}
      </Card>
      <div className="w-full lg:col-span-3 gap-4 grid grid-cols-1 lg:grid-cols-2 h-min">
        <Card className="flex flex-col gap-2 py-4">
          <CardHeader className="items-center px-4">
            <CardDescription>
              <span>Receipts</span>
              <ArrowDownCircle className="size-3 text-muted-foreground/60 ml-1 inline" />
            </CardDescription>
            <CardAction>
              <DateRangeInput
                size="sm"
                style="rounded-full h-6 py-1.5 px-2"
                dateFormat="short"
                placeholder="Today"
                formField={{
                  value: dateRage,
                  name: "date-picker",
                  onChange: (event) => setDateRange(event),
                }}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col px-4 justify-end min-h-20 gap-y-2 h-full">
            <CardTitle className="text-2xl text-green-600">500,450,750 XAF</CardTitle>
            <div className="flex items-center gap-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-600 border-none">
                <TrendingUp />
                +12.5%
              </Badge>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Since last month</div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col gap-2 py-4">
          <CardHeader className="items-center px-4">
            <CardDescription>
              <span>Withdrawals</span>
              <ArrowUp className="size-3 text-muted-foreground/60 ml-1 inline" />
            </CardDescription>
            <CardAction>
              <DateRangeInput
                size="sm"
                style="rounded-full h-6 py-1.5 px-2"
                dateFormat="short"
                placeholder="Today"
                formField={{
                  value: dateRage,
                  name: "date-picker",
                  onChange: (event) => setDateRange(event),
                }}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-2 px-4 justify-end min-h-20 h-full">
            <CardTitle className="text-2xl text-red-600">300,550,250 XAF</CardTitle>
            <div className="flex items-center gap-x-2">
              <Badge variant="outline" className="bg-red-50 text-red-600 border-none">
                <TrendingUp />
                +12.5%
              </Badge>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Since last month</div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 grid gap-y-4">
        <Card className="flex flex-col gap-2 py-4 h-min">
          <CardHeader className="items-center px-4">
            <CardTitle>
              <span>Quick Action</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around gap-2 px-4">
            {quickAtions.map((action) => (
              <Tooltip key={action.path}>
                <TooltipTrigger>
                  <Link to={action.path} className="flex gap-3 items-center border border-muted rounded text-foreground/50 p-2">
                    {action.icon && createElement(action.icon, { size: 20 })}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t(action.label as any)}</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </CardContent>
        </Card>
        <CardWrapper
          title="Companie batle"
          action={
            <DateRangeInput
              size="sm"
              style="rounded-full h-6 py-1.5 px-2"
              dateFormat="short"
              placeholder="Today"
              formField={{
                value: dateRage,
                name: "date-picker",
                onChange: (event) => setDateRange(event),
              }}
            />
          }
        >
          <ChartContainer config={radarChartConfig} className="w-full h-full mx-auto aspect-square max-h-[200px]">
            <RadarChart
              data={radarChartData}
              margin={{
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              }}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <PolarAngleAxis
                dataKey="month"
                tick={({ x, y, textAnchor, value, index, ...props }) => {
                  const data = radarChartData[index]
                  return (
                    <text x={x} y={index === 0 ? y - 10 : y} textAnchor={textAnchor} fontSize={13} fontWeight={500} {...props}>
                      <tspan>{data.om}</tspan>
                      <tspan className="fill-muted-foreground">/</tspan>
                      <tspan>{data.momo}</tspan>
                      <tspan x={x} dy={"1rem"} fontSize={12} className="fill-muted-foreground">
                        {data.month}
                      </tspan>
                    </text>
                  )
                }}
              />
              <PolarGrid />
              <Radar dataKey="om" fill="var(--color-om)" fillOpacity={0.6} />
              <Radar dataKey="momo" fill="var(--color-momo)" />
            </RadarChart>
          </ChartContainer>
        </CardWrapper>
      </div>
      <div className="lg:col-span-3 grid gap-y-4 lg:-mt-20 2xl:-mt-12">
        <Card>
          <CardHeader className="items-center px-4">
            <CardDescription>
              <span>cashflow</span>
              <ArrowDownRightFromSquareIcon className="size-3 text-muted-foreground/60 ml-1 inline" />
            </CardDescription>
            <CardAction>
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={setTimeRange}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
              >
                <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
              </ToggleGroup>
              <DateRangeInput
                size="sm"
                style="rounded-full h-6 py-1.5 px-2"
                dateFormat="short"
                placeholder="Today"
                formField={{
                  value: dateRage,
                  name: "date-picker",
                  onChange: (event) => setDateRange(event),
                }}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex px-4 justify-end min-h-20 gap-4 h-full">
            <ChartContainer config={pieChartConfig} className="w-1/3 h-full mx-auto aspect-square max-h-[200px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieChartData} dataKey="visitors" nameKey="browser" innerRadius={50} strokeWidth={40}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                              {pieChartData.reduce((acc, curr) => acc + curr.visitors, 0).toLocaleString()}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                              transactions
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="browser" />} className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" />
              </PieChart>
            </ChartContainer>
            <ChartContainer config={horizontalChartConfig} className="w-2/3 aspect-auto h-[200px] ">
              <BarChart
                accessibilityLayer
                data={horizontalChartData}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="browser" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} hide />
                <XAxis dataKey="visitors" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="visitors" layout="vertical" fill="var(--color-visitors)" radius={4}>
                  <LabelList dataKey="browser" position="insideLeft" offset={8} className="fill-(--color-visitors)" fontSize={12} />
                  <LabelList dataKey="visitors" position="right" offset={8} className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center px-4">
            <CardDescription>
              <span>cashflow</span>
              <ArrowDownRightFromSquareIcon className="size-3 text-muted-foreground/60 ml-1 inline" />
            </CardDescription>
            <CardAction>
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={setTimeRange}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
              >
                <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
              </ToggleGroup>
              <DateRangeInput
                size="sm"
                style="rounded-full h-6 py-1.5 px-2"
                dateFormat="short"
                placeholder="Today"
                formField={{
                  value: dateRage,
                  name: "date-picker",
                  onChange: (event) => setDateRange(event),
                }}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col px-4 justify-end min-h-20 gap-y-2 h-full">
            <ChartContainer config={areaChartConfig} className="aspect-auto h-[200px] w-full">
              <AreaChart data={areaChartData}>
                <defs>
                  <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--om)" stopOpacity={1.0} />
                    <stop offset="95%" stopColor="var(--om)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--momo)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--momo)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area dataKey="momo" type="natural" fill="url(#fillMobile)" stroke="var(--momo)" stackId="a" />
                <Area dataKey="om" type="natural" fill="url(#fillDesktop)" stroke="var(--om)" stackId="a" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
