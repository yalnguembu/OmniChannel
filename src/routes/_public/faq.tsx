import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion"
import { Input } from "@/shared/components/ui/input"
import { Search } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

import PageLoader from "@/shared/components/PageLoader"
function FaqPage() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")

  const faqCategories = [
    {
      id: "general",
      questions: ["whatIsFujipay", "availableInCameroon", "whoIsGraphicsSystem"],
    },
    {
      id: "features",
      questions: ["supportedPaymentMethods", "automaticWithdrawals", "moneyTransfers", "trackPerformance", "multipleCompanies"],
    },
    {
      id: "security",
      questions: ["dataSecured", "whatIsKyc", "regulatoryCompliance"],
    },
    {
      id: "integration",
      questions: ["easyIntegration", "technicalSupport", "testBefore"],
    },
    {
      id: "account",
      questions: ["openAccount", "fees"],
    },
  ]

  // Filter questions based on search term
  const filteredFaqs =
    searchTerm === ""
      ? faqCategories
      : faqCategories
          .map((category) => ({
            ...category,
            questions: category.questions.filter((q) => {
              try {
                /** @ts-expect-error */
                const question = t(`FAQ.categories.${category.id}.questions.${q}.question`).toLowerCase()
                /** @ts-expect-error */
                const answer = t(`FAQ.categories.${category.id}.questions.${q}.answer`).toLowerCase()
                return question.includes(searchTerm.toLowerCase()) || answer.includes(searchTerm.toLowerCase())
              } catch (e) {
                console.log(e)

                return false
              }
            }),
          }))
          .filter((category) => category.questions.length > 0)

  return (
    <div className="bg-white text-gray-800">
      <section className="container mx-auto max-w-5xl px-4 pt-24 md:px-0 md:pt-32 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">{t("FAQ.title")}</h1>
          <p className="mt-6 text-lg text-gray-600">{t("FAQ.intro")}</p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-12 max-w-xl">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input className="pl-10" placeholder={t("FAQ.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mt-12">
          {filteredFaqs.map((category) => {
            if (category.questions.length === 0) return null

            return (
              <div key={category.id} className="mb-12">
                {/** @ts-expect-error */}
                <h2 className="mb-6 text-2xl font-bold">{t(`FAQ.categories.${category.id}.title`)}</h2>

                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((questionId) => (
                    <AccordionItem key={questionId} value={questionId} className="border-b border-gray-200">
                      {/** @ts-expect-error */}
                      <AccordionTrigger className="py-4 text-left font-medium">{t(`FAQ.categories.${category.id}.questions.${questionId}.question`)}</AccordionTrigger>
                      {/** @ts-expect-error */}
                      <AccordionContent className="py-4 text-gray-600">{t(`FAQ.categories.${category.id}.questions.${questionId}.answer`)}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )
          })}

          {filteredFaqs.every((cat) => cat.questions.length === 0) && (
            <div className="py-12 text-center">
              <p className="text-gray-500">{t("FAQ.noResults")}</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                {t("FAQ.clearSearch")}
              </Button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-4 text-xl font-bold">{t("FAQ.notFound.title")}</h2>
          <p className="mb-6 text-gray-600">{t("FAQ.notFound.description")}</p>
          <Button className="bg-violet-600 hover:bg-violet-700">{t("FAQ.notFound.cta")}</Button>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/faq")({
  pendingComponent: PageLoader,
  component: FaqPage,
})
