import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/shared/components/ui/card"
import { Edit, ArrowLeft, Loader2, Home, DollarSign, Users, Building, Settings, Key, Zap, EyeClosed, Eye, Calendar, RotateCcwKey, Copy } from "lucide-react"
import { useApplication } from "../hooks/useApplication"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { ListPageLayout, StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
import { useTranslation } from "react-i18next"
import { UsersTab } from "../components/tabs/Users"
import { ReceiptsTab } from "../components/tabs/Receipts"
import { CompanySettingsTab } from "../components/tabs/settings"
import { DashboardPage } from "@/features/dashboard/page"
import { useState } from "react"
import FujiPayLogo from "@/assets/images/logo/icon.png"
import { WebhooksTab } from "../components/tabs/Webhook"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import { formatDate } from "@/shared/lib/date"
import { toast } from "sonner"
import { DateFormat } from "@/shared/enums/common"

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
  const { getApplicationQuery, isError, getApplicationKeysById, regenerateApplicationSecretsMutationById } = useApplication()
  const { t } = useTranslation()

  const handleEdit = () => {
    navigate({ to: `/applications/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: `/applications` })
  }

  const { data, isPending } = getApplicationQuery(id)

  const { data: keys, isPending: isKepending } = getApplicationKeysById(id)

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
      component: DashboardPage,
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

  const handleCopy = (value: string) => {
    if (value && value !== "N/A") {
      navigator.clipboard.writeText(value)
      toast.success("API Key copied to clipboard")
    }
  }
  type DetailItemProps = { label?: string; value?: string | null }

  const ApiKeyDetailItem = ({ value = "N/A", label }: DetailItemProps) => {
    const [visible, setVisible] = useState(false)
    const toggleVisibility = () => setVisible((prev) => !prev)
    return (
      <div className="flex gap-2 py-1 items-center justify-between">
        <span className=" text-sm  text-muted-foreground/80 mr-2">{label}</span>
        <div className=" text-sm flex items-center">
          <span className="mr-2 rounded-md pt-1 px-2 min-w-20 bg-muted w-full wrap-anywhere">{visible ? value : "*********"}</span>
          <Button variant="ghost" size="sm" className="h-5" onClick={toggleVisibility}>
            {visible ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-5" onClick={() => handleCopy(value ?? "")}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

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
          <div className="grid lg:grid-cols-5 gap-4">
            <Card className="lg:col-span-3 grid lg:grid-cols-2 gap-2 gap-y-4 items-end">
              <CardHeader className="grid grid-cols-2 items-end h-full">
                {/* <div className=" border rounded-lg block  border border-green-500 bg-muted">
                </div> */}
                <img src={/*companyDetails. || */ FujiPayLogo} alt="" className="w-full h-full object-contain object-center rounded-lg" />
                <div className="flex flex-col gap-y-1">
                  <CardTitle className="text-primary text-2xl mb-1 flex gap-x-2">
                    <span className="capitalize">{companyDetails.name}</span>
                  </CardTitle>
                  <CardDescription className="text-blue-400 hover:text-blue-600 flex gap-x-2">
                    <Building className="h-4 w-4" />
                    <Link to={`/companies/${companyDetails.companyId || ""}/` as `/companies`} className="link hover:underline" target="_blank" rel="noopener noreferrer">
                      {companyDetails.name || "https://fujisatpay.com"}
                    </Link>
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 items-center pt-2">
                    <StatusBadge theme={BadgeStyles.GREEN} text={companyDetails.status ?? ""} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-end  lg:items-start gap-x-4 gap-2 gap-y-4 text-muted-foreground/80 pb-4 text-sm">
                <div className="flex gap-x-1.5">
                  <span className="font-semibold">{t("applications.headers.createdAt")} :</span>
                  <span className="">{companyDetails.createdAt ? formatDate(companyDetails.createdAt) : "-"}</span>
                </div>
                <div className="flex gap-x-1.5">
                  <span className="font-semibold">{t("applications.headers.environment")} :</span>
                  <span className="">{companyDetails.environment}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Key className="h-4 w-4 text-muted-foreground inline mr-2" />
                  {t("applications.headers.keys")}
                </CardTitle>
                <CardAction>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={isKepending} onClick={() => regenerateApplicationSecretsMutationById(id)}>
                    {isKepending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcwKey className="h-4 w-4 mr-2" />}
                    Regenerate
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <ApiKeyDetailItem label="Key:" value={keys?.data?.apiKey || "-"} />
                <ApiKeyDetailItem label="Secret:" value={keys?.data?.apiSecret || "-"} />

                <div className=" text-xs flex items-center mt-2">
                  <span className="text-muted-foreground/80">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" /> {t("applications.apiKeyExpiresAtUtc")} :
                  </span>
                  <span className="ml-2">{keys?.data?.apiKeyExpiresAtUtc ? formatDate(keys?.data.apiKeyExpiresAtUtc, DateFormat.DATETIME_SHORT) : "-"}</span>
                </div>
              </CardContent>
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
