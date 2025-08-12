import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Sparkles, Shield, Headphones, Eye, Scale } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

function AboutPage() {
  const { t } = useTranslation()

  const values = [
    {
      icon: <Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
      translation: "excellence",
    },
    {
      icon: <Shield className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
      translation: "security",
    },
    {
      icon: <Headphones className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
      translation: "support",
    },
    {
      icon: <Eye className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
      translation: "transparency",
    },
    {
      icon: <Scale className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
      translation: "compliance",
    },
  ]

  return (
    <div className="bg-white text-gray-800">
      <section className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 lg:px-12 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">{t("about.title")}</h1>
        </div>

        {/* Story & Mission */}
        <div className="mt-8 grid items-center gap-6 sm:mt-12 sm:gap-8 md:mt-16 md:grid-cols-2 md:gap-10 lg:gap-12">
          <div>
            <h2 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl md:mb-6">{t("about.storyMission.title")}</h2>
            <p className="text-base text-gray-600 sm:text-lg">{t("about.storyMission.content")}</p>
          </div>
          <div className="relative h-60 w-full overflow-hidden rounded-xl sm:h-70 md:h-80 lg:h-96">
            <div className="absolute inset-0 rounded-xl bg-primary opacity-10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/images/icon.png" alt="FujiPay" width={120} height={120} className="h-24 w-24 drop-shadow-xl sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40" />
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-violet-50 p-6 text-center sm:mt-16 sm:p-8 md:mt-20 md:p-12 lg:mt-24 lg:p-16">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl md:mb-6">{t("about.vision.title")}</h2>
          <p className="mx-auto max-w-3xl text-base text-gray-700 italic sm:text-lg md:text-xl">{t("about.vision.content")}</p>
        </div>

        {/* Core Values */}
        <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl md:mb-12">{t("about.values.title")}</h2>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="rounded-full bg-violet-50 p-2 sm:p-3">{value.icon}</div>
                    <div>
                      {/** @ts-expect-error */}
                      <p className="text-sm text-gray-700 sm:text-base">{t(`values.${value.translation}`)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnerships */}
        <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Partnerships</h2>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:mt-6 sm:gap-6 md:mt-8 md:gap-8 lg:gap-16">
            <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-gray-50 p-3 sm:h-20 sm:w-36 sm:p-4 md:h-24 md:w-40 md:p-5">
              <span className="text-base font-semibold text-gray-400 sm:text-lg md:text-xl">Graphics System SA</span>
            </div>
            <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-gray-50 p-3 sm:h-20 sm:w-36 sm:p-4 md:h-24 md:w-40 md:p-5">
              <span className="text-base font-semibold text-gray-400 sm:text-lg md:text-xl">Orange Money</span>
            </div>
            <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-gray-50 p-3 sm:h-20 sm:w-36 sm:p-4 md:h-24 md:w-40 md:p-5">
              <span className="text-base font-semibold text-gray-400 sm:text-lg md:text-xl">MTN Mobile Money</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 mb-8 rounded-t-md bg-gray-50 pt-8 text-center sm:mt-16 sm:mb-12 md:mt-20 md:mb-16 lg:mt-24 lg:pt-12 xl:pt-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">{t("about.cta")}</h2>
          <Button size="lg" className="bg-violet-600 text-sm hover:bg-violet-700 sm:text-base">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/about")({
  component: AboutPage,
})
