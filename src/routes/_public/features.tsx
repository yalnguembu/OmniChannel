import { useTranslation } from "react-i18next"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { CreditCard, ArrowDownToLine, ArrowLeftRight, BarChart4, Building2, ShieldCheck, Bell, LayoutDashboard, UserCheck, Settings } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

function FeaturesPage() {
  const { t } = useTranslation()

  const features = [
    {
      id: "payments",
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      translation: "paymentManagement",
    },
    {
      id: "withdrawals",
      icon: <ArrowDownToLine className="h-12 w-12 text-primary" />,
      translation: "withdrawalManagement",
    },
    {
      id: "transfers",
      icon: <ArrowLeftRight className="h-12 w-12 text-primary" />,
      translation: "moneyTransfers",
    },
    {
      id: "balances",
      icon: <BarChart4 className="h-12 w-12 text-primary" />,
      translation: "balanceManagement",
    },
    {
      id: "multi-enterprise",
      icon: <Building2 className="h-12 w-12 text-primary" />,
      translation: "multiEnterprise",
    },
    {
      id: "security",
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      translation: "security",
    },
    {
      id: "notifications",
      icon: <Bell className="h-12 w-12 text-primary" />,
      translation: "notifications",
    },
    {
      id: "reporting",
      icon: <LayoutDashboard className="h-12 w-12 text-primary" />,
      translation: "reporting",
    },
    {
      id: "kyc",
      icon: <UserCheck className="h-12 w-12 text-primary" />,
      translation: "kyc",
    },
    {
      id: "administration",
      icon: <Settings className="h-12 w-12 text-primary" />,
      translation: "administration",
    },
  ]

  return (
    <div className="bg-white text-gray-800">
      <section className="container mx-auto px-4 pt-24 md:px-0 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-primary text-3xl font-bold md:text-5xl">{t("features.title")}</h1>
          <p className="mt-6 text-lg text-gray-600">{t("features.intro")}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-24">
          {features.map((feature) => {
            // Only render features that have translations
            try {
              // @ts-expect-error
              const title = t(`features.${feature.translation}.title`)
              if (!title) return null

              return (
                <div id={feature.id} key={feature.id} className="scroll-mt-24">
                  <div className="grid items-center gap-8 md:grid-cols-12">
                    <div className="flex justify-center md:col-span-3">
                      <div className="rounded-xl bg-violet-100 p-6">{feature.icon}</div>
                    </div>
                    <div className="md:col-span-8">
                      {/** @ts-expect-error */}
                      <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{t(`features.${feature.translation}.title`)}</h2>
                      {/** @ts-expect-error */}
                      <p className="mt-4 text-lg text-gray-600">{t(`features.${feature.translation}.description`)}</p>

                      <Card className="mt-8 border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <h3 className="text-primary font-semibold">Key Benefits:</h3>
                          {/** @ts-expect-error */}
                          <p className="mt-2 text-gray-600">{t(`features.${feature.translation}.benefits`)}</p>
                        </CardContent>
                      </Card>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {/** @ts-expect-error */}
                        {t(`features.${feature.translation}.details`)
                          .split(",")
                          /** @ts-expect-error */
                          .map((detail, index) => (
                            <Badge key={index} variant="outline" className="py-1 text-sm">
                              {detail.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            } catch (e) {
              console.log(e)
              return null
            }
          })}
        </div>

        <div className="mt-24 text-center">
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
            {t("features.requestDemo")}
          </Button>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/features")({
  component: FeaturesPage,
})

// declare module "@tanstack/react-router" {
//   interface RouteMeta {
//     anchors?: ("#payments" | "#withdrawals" | "#transfers" | "#kyc" | "#reporting")[]
//   }
// }
