import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Edit, ArrowLeft, Loader2, Home, DollarSign, Users, Settings, CheckCircle, CreditCard, Zap } from "lucide-react"
import { useApplication } from "../hooks/useApplication"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { ListPageLayout, StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
import { useTranslation } from "react-i18next"
import { UsersTab } from "../components/tabs/Users"
import { ReceiptsTab } from "../components/tabs/Receipts"
import { CompanySettingsTab } from "../components/tabs/settings"
import { useState } from "react"
import FujiPayLogo from "@/assets/images/logo/icon.png"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { OverviewTab } from "../components/tabs/Overview"
import { WebhooksTab } from "../components/tabs/Webhook"

declare module "@tanstack/react-router" {
  interface Register {
    search: {
      tab?: string
    }
  }
}

export function ApplicationDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/applications/$id/" })
  const search = useSearch({ from: "/_protected/applications/$id/" })

  const [activeTab, setActiveTab] = useState(search.tab || "overview")
  const { getApplicationQuery, isError } = useApplication()
  const { t } = useTranslation()

  const handleEdit = () => {
    navigate({ to: `/applications/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: `/applications` })
  }

  const { data, isPending } = getApplicationQuery(id)

  const companyDetails = data?.data

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate({
      to: `/applications/${id}`,
      search: (prev) => ({ ...prev, tab: value }),
      replace: true,
    })
  }

  if (isPending) {
    return (
      <ListPageLayout
        content={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      />
    )
  }

  if (isError || !companyDetails) {
    return (
      <ListPageLayout
        content={
          <div className="py-6 text-center">
            <p>Application not found.</p>
            <Button variant="outline" onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Button>
          </div>
        }
      />
    )
  }

  const tabs = [
    {
      title: "Overview",
      value: "overview",
      icon: Home,
      component: OverviewTab,
    },
    {
      title: "Receipts",
      value: "receipts",
      icon: DollarSign,
      component: ReceiptsTab,
    },
    {
      title: "Withdrawal",
      value: "withdrawals",
      icon: DollarSign,
      component: ReceiptsTab,
    },
    {
      title: "Webhooks",
      value: "webhooks",
      icon: Zap,
      component: WebhooksTab,
    },
    {
      title: "Users",
      value: "users",
      icon: Users,
      component: UsersTab,
    },
    {
      title: "Settings",
      value: "settings",
      icon: Settings,
      component: CompanySettingsTab,
    },
  ]

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={companyDetails.name ?? ""}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("applications.title"), href: "/applications" }, { label: t("applications.details") }]}
          actions={
            <>
              <Button variant="outline" onClick={handleBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to list
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Company
              </Button>
            </>
          }
        />
      }
      content={
        <div className="space-y-4">
          <div className="grid justify-between gap-4 md:grid-cols-3">
            <Card className="grid md:grid-cols-5 md:col-span-2 divide-x-4 divide-muted/20">
              <div className="flex lg:col-span-3 px-4 gap-x-4">
                <div className="w-24 h-24 rounded-lg block bg-muted">
                  <img src={/*companyDetails. || */ FujiPayLogo} alt="" className="w-full h-full object-contain object-center rounded-lg" />
                </div>
                <div className="w-max flex flex-col">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-primary text-2xl">
                      <span className="capitalize">{companyDetails.name}</span>
                      {companyDetails.environment && (
                        <Tooltip>
                          <TooltipTrigger>
                            <CheckCircle className="h-6 w-6 inline ml-3 text-green-500 stroke-2" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Production</span>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </CardTitle>
                  </CardHeader>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-semibold text-lg">Balance</CardTitle>
                <CardContent className="pl-0 flex flex-col gap-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-lg px-2 flex-col justify-between">
                      <div className="text-muted text-sm">Total Balance</div>
                      <div className="flex justify-between item-center mt-2">
                        <div className="text-lg font-semibold">
                          <CreditCard className="inline h-5 w-5 mr-1" />
                          {/* {companyDetails.totalBalance} */}100.000 XAF
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CardHeader>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue={activeTab} className="w-full">
            <div className="sticky -top-4 z-20 pt-3 rounded bg-background">
              <TabsList className="flex flex-row gap-0 px-2 pb-0 bg-transparent border-b" style={{ boxShadow: "none" }}>
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="2xl:min-w-[100px] hover:cursor-pointer px-2 2xl:px-4 py-2 border-b-4 border-transparent text-default font-medium text-base rounded-none data-[state=active]:border-b-primary data-[state=active]:shadow-none data-[state=active]:text-primary transition-colors"
                  >
                    <div className="mb-3 px-2 space-x-3 flex items-center">
                      <tab.icon className="h-6 w-6" />
                      <span>{tab.title}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {<tab.component companyId={id} />}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      }
    />
  )
}
