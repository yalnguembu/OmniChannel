import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Edit, ArrowLeft, Loader2, Home, DollarSign, AppWindow, Users, Settings, FileText, Link, Key, CheckCircle, Mail, PhoneCall, EyeClosed, Eye } from "lucide-react"
import { useCompany } from "../hooks/useCompany"
import { Label } from "@/shared/components/ui/label"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { ListPageLayout, StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
import { DocumentsTypeDataGrid } from "@/features/document-types/components/DocumentTypesDataGrid"
import { useTranslation } from "react-i18next"
import { ApplicationsTab } from "../components/tabs/Applications"
import { UsersTab } from "../components/tabs/Users"
import { ReceiptsTab } from "../components/tabs/Receipts"
import { CompanySettingsTab } from "../components/tabs/settings"
import { ElementType, useState } from "react"
import FujiPayLogo from "@/assets/images/logo/icon.png"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { OverviewTab } from "../components/tabs/Overview"

declare module "@tanstack/react-router" {
  interface Register {
    search: {
      tab?: string
    }
  }
}

export function CompanyDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/companies/$id/" })
  const search = useSearch({ from: "/_protected/companies/$id/" })

  const [activeTab, setActiveTab] = useState(search.tab || "overview")
  const { getCompanyQuery, isError } = useCompany()
  const { t } = useTranslation()

  const handleEdit = () => {
    navigate({ to: `/companies/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: `/companies` })
  }

  const { data, isPending } = getCompanyQuery(id)

  const companyDetails = data?.data

  type DetailItemProps = { label?: string; value?: string | null; Icon: ElementType }

  const DetailItem = ({ value, Icon }: DetailItemProps) => (
    <div className="flex my-1 border-b border-b-muted/50 items-center 2xl:py-1">
      {Icon && (
        <div className="w-5 h-5 flex items-center mr-2">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="md:col-span-3 text-sm flex gap-x-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
    </div>
  )

  const ApiKeyDetailItem = ({ value = "N/A", Icon }: DetailItemProps) => {
    const [visible, setVisible] = useState(false)
    const toggleVisibility = () => setVisible((prev) => !prev)
    return (
      <div className="flex gap-2 py-1 items-center">
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        <div className=" text-sm flex items-center">
          <span className="mr-2">{visible ? value : value?.replace(/./g, "*")}</span>
          <Button variant="ghost" size="sm" className="h-5" onClick={toggleVisibility}>
            {visible ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    )
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate({
      to: `/companies/${id}`,
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
            <p>Company not found.</p>
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
      title: "Applications",
      value: "applications",
      icon: AppWindow,
      component: ApplicationsTab,
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
    {
      title: "Documents",
      value: "documents",
      icon: FileText,
      component: DocumentsTypeDataGrid,
    },
  ]

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={companyDetails.name ?? ""}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("companies.title"), href: "/companies" }, { label: t("companies.details") }]}
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
          <Card className="grid md:col-span-2 divide-x-4 divide-muted/20">
            <div className="w-fu1/2 flex flex-col">
              <CardHeader className="flex items-center border border-red-500">
                <div className="w-24 h-24 rounded-lg block bg-muted">
                  <img src={/*companyDetails. || */ FujiPayLogo} alt="" className="w-full h-full object-contain object-center rounded-lg" />
                </div>
                <div>
                  <CardTitle className="text-primary text-2xl mb-2">
                    <span className="capitalize">{companyDetails.name}</span>
                    {companyDetails.isVerified && (
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="h-6 w-6 inline ml-3 text-green-500 stroke-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Verified Company</span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CardTitle>
                  <div className="2xl gap-2 grid grid-cols-2 text-gray-500">
                    <CardDescription className="text-blue-400 hover:text-blue-600 flex gap-x-2">
                      <a href={companyDetails.website || ""} className="link hover:underline" target="_blank" rel="noopener noreferrer">
                        {companyDetails.website || "https://fujisatpay.com"}
                      </a>
                      <Link className="h-4 w-4" />
                    </CardDescription>
                    <DetailItem Icon={Home} value={companyDetails.address} />
                  </div>
                  <div className="2xl gap-2 grid grid-cols-2 text-gray-500">
                    <DetailItem Icon={PhoneCall} value={companyDetails.phoneNumber} />
                    <DetailItem Icon={Mail} value={companyDetails.email} />
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="flex gap-2 px-0 mt-4 pr-4 space-y-4">
              <div className="pl-2">
                <Label className="font-semibold text-sm text-muted-foreground">Size</Label>
                <div className="text-xs">{companyDetails.companySize}</div>
              </div>
              <div className="pl-2">
                <Label className="font-semibold text-sm text-muted-foreground">Type</Label>
                <div className="text-xs">{companyDetails.companyType}</div>
              </div>
              <div>
                <Label className="font-semibold text-sm text-muted-foreground">NUI</Label>
                <div className="text-xs">{companyDetails.taxNumber}</div>
              </div>
              <div>
                <Label className="font-semibold text-sm text-muted-foreground">RCCM</Label>
                <div className="text-xs">{companyDetails.businessRegistrationNumber}</div>
              </div>
              <div className="pl-2">
                <Label className="font-semibold text-sm text-muted-foreground">Represent</Label>
                <div className="text-xs">{companyDetails.contactPerson}</div>
              </div>
              <div className="pl-2">
                <Label className="font-semibold text-sm text-muted-foreground">Phone</Label>
                <div className="text-xs">{companyDetails.contactPhone}</div>
              </div>
            </CardContent>
          </Card>

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
