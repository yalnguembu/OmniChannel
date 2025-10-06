import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { ArrowRight, Shield, CreditCard, Zap, Code, BarChart3, Smartphone, CheckCircle2, ArrowUpRight, Building, Store, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import PageLoader from "@/shared/components/PageLoader"
function LandingPage() {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState("payments")

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-20 lg:px-12 lg:py-24 xl:py-32">
        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-8 lg:gap-10 xl:gap-12">
          <motion.div className="space-y-4 md:space-y-6" initial="hidden" animate="visible" variants={fadeInUp}>
            <Badge className="bg-primary-muted px-3 py-1 text-primary hover:bg-primary-muted">{t("landingPage.hero.badge")}</Badge>
            <h1 className="text-3xl font-bold tracking-wider md:text-4xl lg:text-5xl xl:text-6xl">
              {t("landingPage.hero.title1")}
              <span className="text-primary"> {t("landingPage.hero.title2")}</span>
              <br />
              {t("landingPage.hero.title3")}
            </h1>
            <p className="max-w-lg text-base text-foreground md:text-lg">{t("landingPage.hero.subtitle")}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" className="bg-primary text-sm hover:bg-primary md:text-base">
                {t("landingPage.hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-sm md:text-base">
                {t("landingPage.cta.cta2")}
              </Button>
            </div>
            <div className="pt-8">
              <p className="mb-3 text-sm text-gray-500">{t("landingPage.hero.trustedBy")}</p>
              <div className="flex flex-wrap items-center gap-8 grayscale">
                <span className="font-semibold text-gray-400">{t("landingPage.hero.brand1")}</span>
                <span className="font-semibold text-gray-400">{t("landingPage.hero.brand2")}</span>
                <span className="font-semibold text-gray-400">{t("landingPage.hero.brand3")}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="relative">
            <div className="absolute -top-6 -left-6 z-0 h-24 w-24 rounded-full bg-violet-200 opacity-70 blur-xl"></div>
            <div className="absolute -right-6 -bottom-6 z-0 h-32 w-32 rounded-full bg-blue-200 opacity-70 blur-xl"></div>
            <div className="relative z-10 rounded-2xl border bg-background p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-background">F</div>
                  <div>
                    <p className="font-semibold">{t("landingPage.hero.demoName")}</p>
                    <p className="text-sm text-gray-500">{t("landingPage.hero.demoEmail")}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t("landingPage.hero.active")}</Badge>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{t("landingPage.hero.invoice")}</p>
                    <Badge variant="outline" className="border-violet-300 text-primary">
                      {t("landingPage.hero.paid")}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{t("landingPage.hero.invoiceAmount")}</p>
                  <p className="text-xs text-gray-400">{t("landingPage.hero.invoiceDate")}</p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <span>{t("landingPage.hero.orangeMoney")}</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                      <Zap className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span>{t("landingPage.hero.mtnMobileMoney")}</span>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                </div>

                <div className="mt-4">
                  <Button className="w-full bg-primary hover:bg-primary">{t("landingPage.hero.viewTransactions")}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-b from-background to-gray-50 py-16 md:py-20 lg:px-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-16">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              {t("landingPage.howItWorks.badge")}
            </Badge>
            <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl lg:text-4xl text-primary">{t("landingPage.howItWorks.title")}</h2>
            <p className="text-sm text-foreground/60 md:text-base">{t("landingPage.howItWorks.description")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
            <div className="relative rounded-xl border bg-background p-8 shadow-sm">
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-background">1</div>
              <h3 className="mt-4 mb-3 text-xl font-bold">{t("landingPage.howItWorks.step1.title")}</h3>
              <p className="text-foreground/60">{t("landingPage.howItWorks.step1.description")}</p>
            </div>

            <div className="relative rounded-xl border bg-background p-8 shadow-sm">
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-background">2</div>
              <h3 className="mt-4 mb-3 text-xl font-bold">{t("landingPage.howItWorks.step2.title")}</h3>
              <p className="text-foreground/60">{t("landingPage.howItWorks.step2.description")}</p>
            </div>

            <div className="relative rounded-xl border bg-background p-8 shadow-sm">
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-background">3</div>
              <h3 className="mt-4 mb-3 text-xl font-bold">{t("landingPage.howItWorks.step3.title")}</h3>
              <p className="text-foreground/60">{t("landingPage.howItWorks.step3.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-16 md:py-20 lg:px-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:mb-16">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              {t("features.badge")}
            </Badge>
            <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl lg:text-4xl">
              {t("features.title1")} <span className="text-primary">{t("features.title2")}</span>
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-foreground/60 md:text-base">{t("features.subtitle")}</p>
          </div>

          {/* Feature tabs and content */}
          <div className="w-full">
            <div className="mb-8 flex flex-wrap justify-center">
              <button
                onClick={() => setActiveTab("payments")}
                className={`mr-2 mb-2 flex items-center rounded-md px-4 py-2 ${
                  activeTab === "payments" ? "bg-primary-muted text-primary" : "bg-muted/30 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t("features.paymentManagement.title")}
              </button>

              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`mr-2 mb-2 flex items-center rounded-md px-4 py-2 ${
                  activeTab === "withdrawals" ? "bg-primary-muted text-primary" : "bg-muted/30 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {t("features.withdrawalManagement.title")}
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`mr-2 mb-2 flex items-center rounded-md px-4 py-2 ${
                  activeTab === "security" ? "bg-primary-muted text-primary" : "bg-muted/30 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("features.security.title")}
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`mr-2 mb-2 flex items-center rounded-md px-4 py-2 ${
                  activeTab === "analytics" ? "bg-primary-muted text-primary" : "bg-muted/30 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("features.reporting.title")}
              </button>
            </div>

            <div className="rounded-xl bg-background p-4 md:p-6">
              {activeTab === "payments" && (
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold">{t("features.paymentManagement.title")}</h3>
                    <p className="mb-6 text-foreground">{t("features.paymentManagement.description")}</p>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.paymentManagement.benefit1")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.paymentManagement.benefit2")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.paymentManagement.benefit3")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.paymentManagement.benefit4")}</span>
                      </li>
                    </ul>
                    <Button className="mt-6">
                      {t("landingPage.features.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-xl border bg-background p-6 shadow-md">
                    <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted/30">
                      <Smartphone className="h-16 w-16 text-primary/60" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 rounded bg-muted/30"></div>
                      <div className="h-4 w-full rounded bg-muted/30"></div>
                      <div className="h-4 w-5/6 rounded bg-muted/30"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "withdrawals" && (
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold">{t("features.withdrawalManagement.title")}</h3>
                    <p className="mb-6 text-foreground">{t("features.withdrawalManagement.description")}</p>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.withdrawalManagement.benefit1")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.withdrawalManagement.benefit2")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.withdrawalManagement.benefit3")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.withdrawalManagement.benefit4")}</span>
                      </li>
                    </ul>
                    <Button className="mt-6">
                      {t("landingPage.features.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-xl border bg-background p-6 shadow-md">
                    <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted/30">
                      <ArrowUpRight className="h-16 w-16 text-primary/60" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 rounded bg-muted/30"></div>
                      <div className="h-4 w-full rounded bg-muted/30"></div>
                      <div className="h-4 w-5/6 rounded bg-muted/30"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold">{t("features.security.title")}</h3>
                    <p className="mb-6 text-foreground">{t("features.security.description")}</p>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.security.benefit1")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.security.benefit2")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.security.benefit3")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.security.benefit4")}</span>
                      </li>
                    </ul>
                    <Button className="mt-6">
                      {t("landingPage.features.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-xl border bg-background p-6 shadow-md">
                    <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted/30">
                      <Shield className="h-16 w-16 text-primary/60" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 rounded bg-muted/30"></div>
                      <div className="h-4 w-full rounded bg-muted/30"></div>
                      <div className="h-4 w-5/6 rounded bg-muted/30"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold">{t("features.reporting.title")}</h3>
                    <p className="mb-6 text-foreground">{t("features.reporting.description")}</p>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.reporting.benefit1")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.reporting.benefit2")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.reporting.benefit3")}</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        <span>{t("features.reporting.benefit4")}</span>
                      </li>
                    </ul>
                    <Button className="mt-6">
                      {t("landingPage.features.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-xl border bg-background p-6 shadow-md">
                    <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted/30">
                      <BarChart3 className="h-16 w-16 text-primary/60" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 rounded bg-muted/30"></div>
                      <div className="h-4 w-full rounded bg-muted/30"></div>
                      <div className="h-4 w-5/6 rounded bg-muted/30"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="bg-background py-16 md:py-20 lg:px-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:mb-16">
            <Badge className="mb-4 bg-primary-muted px-3 py-1 text-primary hover:bg-primary-muted">{t("landingPage.industries.badge")}</Badge>
            <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl lg:text-4xl">{t("landingPage.industries.title")}</h2>
            <p className="mx-auto max-w-3xl text-sm text-foreground/60 md:text-base">{t("landingPage.industries.description")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden border bg-background">
              <div className="h-2 bg-blue-500"></div>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Store className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold">{t("solutions.ecommerce.title")}</h3>
                </div>
                <p className="mb-4 text-foreground/60">{t("solutions.ecommerce.problem")}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t("landingPage.industries.learnMore")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border bg-background">
              <div className="h-2 bg-yellow-500"></div>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <div className="rounded-lg bg-yellow-500/10 p-3">
                    <Building className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold">{t("solutions.fintech.title")}</h3>
                </div>
                <p className="mb-4 text-foreground/60">{t("solutions.fintech.problem")}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t("landingPage.industries.learnMore")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border bg-background">
              <div className="h-2 bg-green-500"></div>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold">{t("solutions.nonprofit.title")}</h3>
                </div>
                <p className="mb-4 text-foreground/60">{t("solutions.nonprofit.problem")}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t("landingPage.industries.learnMore")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button variant="link" className="text-primary hover:text-primary">
              {t("solutions.customSolution.title")} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* API & Developer Focus */}
      <section className="bg-gray-900 py-16 text-background md:py-20 lg:px-12">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <Badge className="mb-6 bg-violet-900 px-3 py-1 text-primary/60 hover:bg-violet-900">{t("developers.badge")}</Badge>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">{t("developers.title")}</h2>
              <p className="mb-8 text-gray-300">{t("developers.intro")}</p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-4 rounded-md bg-violet-800 p-2">
                    <Code className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{t("developers.whyIntegrate.restful.title")}</h3>
                    <p className="text-gray-400">{t("developers.whyIntegrate.restful.description")}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 mr-4 rounded-md bg-violet-800 p-2">
                    <Shield className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{t("developers.whyIntegrate.security.title")}</h3>
                    <p className="text-gray-400">{t("developers.whyIntegrate.security.description")}</p>
                  </div>
                </div>
              </div>
              <Button className="mt-8 bg-primary hover:bg-primary">
                {t("developers.resources.apiDocs")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl bg-gray-800 p-4 md:p-6">
              <pre className="w-full overflow-x-auto text-xs text-gray-300 md:text-sm">
                <code className="language-javascript">
                  {`
// Initialize FujisatPay client
const fujiPay = new FujisatPay.Client({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});
// Create a payment request
async function createPayment() {
  try {
    const payment = await fujiPay.payments.create({
      amount: 5000,
      currency: 'XAF',
      description: 'Product purchase',
      customer: {
        name: 'Customer Name',
        phone: '+237612345678'
      },
      paymentMethod: 'orange_money'
    });
    
    console.log(\`Payment created: \${payment.id}\`);
    return payment;
  } catch (error) {
    console.error('Error creating payment:', error);
  }
}
    `}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Stats and Trust Signals */}
      <section className="bg-background py-16 md:py-20 lg:px-12">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              {t("landingPage.mission.badge")}
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("landingPage.mission.title1")}
              <span className="text-primary"> {t("landingPage.mission.title2")}</span>
            </h2>
            <p className="mx-auto max-w-3xl text-foreground/60">{t("landingPage.mission.subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <p className="text-4xl font-bold text-primary">{t("landingPage.stats.transactions")}</p>
              <p className="text-foreground/60">{t("landingPage.stats.transactionsLabel")}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{t("landingPage.mission.stat1.value")}</p>
              <p className="text-foreground/60">{t("landingPage.mission.stat1.label")}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{t("landingPage.mission.stat2.value")}</p>
              <p className="text-foreground/60">{t("landingPage.mission.stat2.label")}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{t("landingPage.stats.uptime")}</p>
              <p className="text-foreground/60">{t("landingPage.stats.uptimeLabel")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-indigo-700 py-16 text-background md:py-20 lg:px-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-background/20 text-background hover:bg-background/30 md:mb-6">{t("landingPage.cta.badge")}</Badge>
            <h2 className="mb-4 text-2xl font-bold md:mb-6 md:text-3xl lg:text-4xl">
              {t("landingPage.cta.title1")} <span className="text-yellow-300">{t("landingPage.cta.title2")}</span>
            </h2>
            <p className="mb-6 text-base text-background md:mb-8 md:text-lg">{t("landingPage.cta.subtitle")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-background text-sm text-primary hover:bg-muted/30 md:text-base">
                {t("landingPage.cta.cta1")}
              </Button>
              <Button size="lg" variant="default">
                {t("landingPage.cta.cta2")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/")({
  pendingComponent: PageLoader,
  component: LandingPage,
})
