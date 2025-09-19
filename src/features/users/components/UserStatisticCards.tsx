import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CollapsibleContainer } from "@/shared/components/filter/collapsible-container"
import { FileUser, TrendingUp, UserCheck, UserCog, UserLock, Users } from "lucide-react"
import { useState } from "react"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { Badge } from "@/shared/components/ui/badge"

export function UserStatisticCards() {
  const [dateRange, setDateRange] = useState()

  return (
    <CollapsibleContainer
      isCollapsible={true}
      defaultCollapsed={true}
      className="bg-transparent border-none"
      header={
        <div className="flex justify-between items-center gap-x-2 w-full pb-2 pr-2">
          <div className="text-gray-500 font-semibold">Statistics</div>
          <div className="w-full border-[0.5px] border-muted-foreground/10 h-0"></div>
          <DateRangeInput
            size="sm"
            style="rounded-full w-min h-6 py-1.5 px-2"
            dateFormat="short"
            placeholder="Today"
            formField={{
              value: dateRange,
              name: "date-picker",
              onChange: (event) => setDateRange(event),
            }}
          />
        </div>
      }
    >
      <div className="grid gap-3 lg:gap-6 grid-cols-1 lg:grid-cols-5 items-start py-2 mb-2">
        <Card className="w-full flex flex-col gap-2 py-3">
          <CardHeader className="flex items-center justify-start px-3 gap-x-2">
            <div className="rounded p-1 size-7 bg-muted flex items-center justify-center">
              <Users className="size-6 text-muted-foreground/60 ml-1 inline" />
            </div>
            <CardDescription>users</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-2">
            <div className="flex flex-col">
              <div className="flex flex-1 items-center gap-x-2">
                <CardTitle className="text-2xl flex gap-2">850</CardTitle>
                <Badge variant="outline" className="bg-green-100 rounded-b-lg text-green-600 border-none h-5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">12.5%</span>
                </Badge>
              </div>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Last 30 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full flex flex-col gap-2 py-3">
          <CardHeader className="flex items-center justify-start px-3 gap-x-2">
            <div className="rounded p-1 size-7 bg-muted flex items-center justify-center">
              <UserCog className="size-6 text-muted-foreground/60 ml-1 inline" />
            </div>
            <CardDescription>System</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-2">
            <div className="flex flex-col">
              <div className="flex flex-1 items-center gap-x-2">
                <CardTitle className="text-2xl flex gap-2">235</CardTitle>
                <Badge variant="outline" className="bg-yellow-100 rounded-b-lg text-yellow-600 border-none h-5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">13.21%</span>
                </Badge>
              </div>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Last 30 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full flex flex-col gap-2 py-3">
          <CardHeader className="flex items-center justify-start px-3 gap-x-2">
            <div className="rounded p-1 size-7 bg-blue-100 flex items-center justify-center">
              <FileUser className="size-6 text-blue-600 ml-1 inline" />
            </div>
            <CardDescription>Company</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-2">
            <div className="flex flex-col">
              <div className="flex flex-1 items-center gap-x-2">
                <CardTitle className="text-2xl flex gap-2">652</CardTitle>
                <Badge variant="outline" className="bg-yellow-100 rounded-b-lg text-yellow-600 border-none h-5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">87.79%</span>
                </Badge>
              </div>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Last 30 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full flex flex-col gap-2 py-3">
          <CardHeader className="flex items-center justify-start px-3 gap-x-2">
            <div className="rounded p-1 size-7 bg-green-100 flex items-center justify-center">
              <UserCheck className="size-6 text-green-600 ml-1 inline" />
            </div>
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-2">
            <div className="flex flex-col">
              <div className="flex flex-1 items-center gap-x-2">
                <CardTitle className="text-2xl flex gap-2">750</CardTitle>
                <Badge variant="outline" className="bg-yellow-100 rounded-b-lg text-yellow-600 border-none h-5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">7.5%</span>
                </Badge>
              </div>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Last 30 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full flex flex-col gap-2 py-3">
          <CardHeader className="flex items-center justify-start px-3 gap-x-2">
            <div className="rounded p-1 size-7 bg-red-50 flex items-center justify-center">
              <UserLock className="size-6 text-red-600 ml-1 inline" />
            </div>
            <CardDescription>Blocked</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-2">
            <div className="flex flex-col">
              <div className="flex flex-1 items-center gap-x-2">
                <CardTitle className="text-2xl flex gap-2">100</CardTitle>
                <Badge variant="outline" className="bg-yellow-100 rounded-b-lg text-yellow-600 border-none h-5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">7.5%</span>
                </Badge>
              </div>
              <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">Last 30 days</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CollapsibleContainer>
  )
}
