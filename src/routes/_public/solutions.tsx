import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { ShoppingCart, Truck, Smartphone, Heart, PiggyBank } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

function SolutionsPage() {
  const { t } = useTranslation()

  const solutions = [
    {
      id: "ecommerce",
      icon: <ShoppingCart className="h-12 w-12 text-primary" />,
      translation: "ecommerce",
    },
    {
      id: "delivery",
      icon: <Truck className="h-12 w-12 text-primary" />,
      translation: "delivery",
    },
    {
      id: "mobileApps",
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      translation: "mobileApps",
    },
    {
      id: "nonprofit",
      icon: <Heart className="h-12 w-12 text-primary" />,
      translation: "nonprofit",
    },
    {
      id: "fintech",
      icon: <PiggyBank className="h-12 w-12 text-primary" />,
      translation: "fintech",
    },
  ]

  return (
    <div className="w-full bg-white text-gray-800">
      <section className="container mx-auto px-4 pt-24 md:px-0 md:pt-32 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">{t("solutions.title")}</h1>
          <p className="mt-6 text-lg text-gray-600">{t("solutions.intro")}</p>
        </div>

        <div className="mt-16 space-y-20">
          {solutions.map((solution) => {
            try {
              /** @ts-expect-error */
              const title = t(`solutions.${solution.translation}.title`)
              if (!title) return null

              return (
                <Card key={solution.id} id={solution.id} className="overflow-hidden">
                  <div className="grid gap-0 md:grid-cols-12">
                    <div className="flex flex-col items-center justify-center bg-violet-50 p-8 md:col-span-4 md:items-start">
                      <div className="mb-6 rounded-full bg-white p-4 shadow-sm">{solution.icon}</div>
                      {/** @ts-expect-error */}
                      <h2 className="text-center text-2xl font-bold text-gray-900 md:text-left">{t(`solutions.${solution.translation}.title`)}</h2>
                      <Badge variant="outline" className="mt-4 border-primary text-primary">
                        {/** @ts-expect-error */}
                        {t(`solutions.${solution.translation}.sector`)}
                      </Badge>
                    </div>

                    <CardContent className="p-8 md:col-span-8">
                      <div className="mb-8">
                        <h3 className="mb-2 font-semibold text-violet-700">{t("solutions.problemLabel")}</h3>
                        {/** @ts-expect-error */}
                        <p className="text-gray-600">{t(`solutions.${solution.translation}.problem`)}</p>
                      </div>

                      <div className="mb-8">
                        <h3 className="mb-2 font-semibold text-violet-700">{t("solutions.solutionLabel")}</h3>
                        {/** @ts-expect-error */}
                        <p className="text-gray-600">{t(`solutions.${solution.translation}.solution`)}</p>
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold text-violet-700">{t("solutions.benefitsLabel")}</h3>
                        <ul className="list-disc space-y-1 pl-5 text-gray-600">
                          {/** @ts-expect-error */}
                          {t(`solutions.${solution.translation}.benefits`)
                            .split("solutions.|")
                            /** @ts-expect-error */
                            .map((benefit, idx) => (
                              <li key={idx}>{benefit.trim()}</li>
                            ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            } catch (e) {
              console.log(e)
              return null
            }
          })}
        </div>

        <div className="mt-16 rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t("solutions.customSolution.title")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">{t("solutions.customSolution.description")}</p>
          <Button size="lg" className="mt-6 bg-violet-600 hover:bg-violet-700">
            {t("solutions.customSolution.cta")}
          </Button>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/solutions")({
  component: SolutionsPage,
})
