import { useTranslation } from "react-i18next"
import { Cog, CreditCard, List, Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { WithdrawalMethodsTab } from "./WithdrawalMethod"
import { FeeConfigurationsTab } from "./FeeConfigurations"
import { SettingsTab } from "./Settings"
import { CompanyAppLimitsTab } from "./CompanyAppLimits"

export function CompanySettingsTab({ companyId }: { companyId: string }) {
  const { t } = useTranslation()

  const tabs = [
    {
      title: "general",
      value: "general",
      icon: Cog,
      component: SettingsTab,
    },
    {
      title: "Fees",
      value: "fees",
      icon: CreditCard,
      component: FeeConfigurationsTab,
    },
    {
      title: "App Limits",
      value: "appLimits",
      icon: List,
      component: CompanyAppLimitsTab,
    },
    {
      title: "Withdrawals",
      value: "withdrawals",
      icon: Building,
      component: WithdrawalMethodsTab,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("companies.tabs.settings.description")}</CardTitle>
        <CardDescription>{t("companies.tabs.settings.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <div className="px-2 py-2 space-x-3 flex items-center">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {<tab.component companyId={companyId} />}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
