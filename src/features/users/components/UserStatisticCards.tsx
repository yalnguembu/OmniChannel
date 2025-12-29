import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CollapsibleContainer } from "@/shared/components/filter/collapsible-container"
import { FileUser, UserCheck, UserCog, UserLock, Users, Loader } from "lucide-react"
import { useState, useMemo } from "react"
import { DateRangeInput } from "@/shared/components/ui/date-range-input"
import { useQuery } from "@tanstack/react-query"
import { postApiUserSearchOptions } from "@/shared/api/@tanstack/react-query.gen"
import { useTranslation } from "react-i18next"

export function UserStatisticCards() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState()

  // Fetch user data to calculate statistics
  const { data, isLoading } = useQuery({
    ...postApiUserSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: 1000, // Get all users to calculate stats
      },
    }),
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })

  // Calculate statistics from user data
  const stats = useMemo(() => {
    const users = data?.data?.items || []
    const totalUsers = users.length
    const systemUsers = users.filter((u) => u.userType === "SYSTEM").length
    const companyUsers = users.filter((u) => u.userType === "COMPANY").length
    const activeUsers = users.filter((u) => u.status === "Active").length
    const blockedUsers = users.filter((u) => u.status === "Blocked" || u.status === "Inactive").length

    return {
      total: totalUsers,
      system: systemUsers,
      company: companyUsers,
      active: activeUsers,
      blocked: blockedUsers,
    }
  }, [data])

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
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 lg:gap-6 grid-cols-1 lg:grid-cols-5 items-start py-2 mb-2">
          <Card className="w-full flex flex-col gap-2 py-3">
            <CardHeader className="flex items-center justify-start px-3 gap-x-2">
              <div className="rounded p-1 size-7 bg-muted flex items-center justify-center">
                <Users className="size-6 text-muted-foreground/60 ml-1 inline" />
              </div>
              <CardDescription>{t("users.stats.total")}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pt-2">
              <div className="flex flex-col">
                <div className="flex flex-1 items-center gap-x-2">
                  <CardTitle className="text-2xl flex gap-2">{stats.total}</CardTitle>
                </div>
                <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">{t("users.stats.allTime")}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full flex flex-col gap-2 py-3">
            <CardHeader className="flex items-center justify-start px-3 gap-x-2">
              <div className="rounded p-1 size-7 bg-muted flex items-center justify-center">
                <UserCog className="size-6 text-muted-foreground/60 ml-1 inline" />
              </div>
              <CardDescription>{t("users.stats.system")}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pt-2">
              <div className="flex flex-col">
                <div className="flex flex-1 items-center gap-x-2">
                  <CardTitle className="text-2xl flex gap-2">{stats.system}</CardTitle>
                </div>
                <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">{t("users.stats.allTime")}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full flex flex-col gap-2 py-3">
            <CardHeader className="flex items-center justify-start px-3 gap-x-2">
              <div className="rounded p-1 size-7 bg-blue-100 flex items-center justify-center">
                <FileUser className="size-6 text-blue-600 ml-1 inline" />
              </div>
              <CardDescription>{t("users.stats.company")}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pt-2">
              <div className="flex flex-col">
                <div className="flex flex-1 items-center gap-x-2">
                  <CardTitle className="text-2xl flex gap-2">{stats.company}</CardTitle>
                </div>
                <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">{t("users.stats.allTime")}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full flex flex-col gap-2 py-3">
            <CardHeader className="flex items-center justify-start px-3 gap-x-2">
              <div className="rounded p-1 size-7 bg-green-100 flex items-center justify-center">
                <UserCheck className="size-6 text-green-600 ml-1 inline" />
              </div>
              <CardDescription>{t("users.stats.active")}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pt-2">
              <div className="flex flex-col">
                <div className="flex flex-1 items-center gap-x-2">
                  <CardTitle className="text-2xl flex gap-2">{stats.active}</CardTitle>
                </div>
                <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">{t("users.stats.allTime")}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full flex flex-col gap-2 py-3">
            <CardHeader className="flex items-center justify-start px-3 gap-x-2">
              <div className="rounded p-1 size-7 bg-red-50 flex items-center justify-center">
                <UserLock className="size-6 text-red-600 ml-1 inline" />
              </div>
              <CardDescription>{t("users.stats.blocked")}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pt-2">
              <div className="flex flex-col">
                <div className="flex flex-1 items-center gap-x-2">
                  <CardTitle className="text-2xl flex gap-2">{stats.blocked}</CardTitle>
                </div>
                <div className="line-clamp-1 flex gap-2 font-medium text-xs text-muted-foreground/50">{t("users.stats.allTime")}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </CollapsibleContainer>
  )
}
