import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"
import { Code, Database, Lock, ExternalLink, Zap, BookOpen, Server, Activity } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

function DevelopersPage() {
  const { t } = useTranslation()

  const endpoints = [
    {
      path: "/payments",
      description: "initiateAndTrackPayments",
      method: "POST",
    },
    {
      path: "/withdrawals",
      description: "manageWithdrawalRequests",
      method: "POST",
    },
    {
      path: "/transfers",
      description: "manageFundTransfers",
      method: "POST",
    },
    {
      path: "/balances",
      description: "queryBalances",
      method: "GET",
    },
    {
      path: "/webhooks",
      description: "configureNotifications",
      method: "POST",
    },
  ]

  return (
    <div className="bg-white text-gray-800">
      <section className="container mx-auto px-4 pt-24 md:px-0 md:pt-32 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">{t("developers.title")}</h1>
          <p className="mt-6 text-lg text-gray-600">{t("developers.intro")}</p>
        </div>

        {/* Why Integrate */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("developers.whyIntegrate.title")}</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-violet-100 p-3">
                    <Code className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="mb-2">{t("developers.whyIntegrate.restful.title")}</CardTitle>
                  <p className="text-gray-600">{t("developers.whyIntegrate.restful.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-violet-100 p-3">
                    <BookOpen className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="mb-2">{t("developers.whyIntegrate.documentation.title")}</CardTitle>
                  <p className="text-gray-600">{t("developers.whyIntegrate.documentation.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-violet-100 p-3">
                    <Lock className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="mb-2">{t("developers.whyIntegrate.security.title")}</CardTitle>
                  <p className="text-gray-600">{t("developers.whyIntegrate.security.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-violet-100 p-3">
                    <Database className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="mb-2">{t("developers.whyIntegrate.sandbox.title")}</CardTitle>
                  <p className="text-gray-600">{t("developers.whyIntegrate.sandbox.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-violet-100 p-3">
                    <Activity className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="mb-2">{t("developers.whyIntegrate.webhooks.title")}</CardTitle>
                  <p className="text-gray-600">{t("developers.whyIntegrate.webhooks.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-violet-100 p-3">
                    <Zap className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="mb-2">{t("developers.whyIntegrate.sdks.title")}</CardTitle>
                  <p className="text-gray-600">{t("developers.whyIntegrate.sdks.description")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-16 rounded-lg bg-gray-50 p-8">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("developers.resources.title")}</h2>

          <div className="mx-auto grid max-w-3xl gap-6">
            <Button variant="outline" className="justify-start border-primary py-6 text-violet-700 hover:bg-violet-50" size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              {t("developers.resources.apiDocs")}
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>

            <Button variant="outline" className="justify-start border-primary py-6 text-violet-700 hover:bg-violet-50" size="lg">
              <Zap className="mr-2 h-5 w-5" />
              {t("developers.resources.quickstart")}
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>

            <Button variant="outline" className="justify-start border-primary py-6 text-violet-700 hover:bg-violet-50" size="lg">
              <Code className="mr-2 h-5 w-5" />
              {t("developers.resources.sdkLibraries")}
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>

            <Button variant="outline" className="justify-start border-primary py-6 text-violet-700 hover:bg-violet-50" size="lg">
              <Server className="mr-2 h-5 w-5" />
              {t("developers.resources.sandbox")}
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("developers.endpoints.title")}</h2>

          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("developers.endpoints.method")}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("developers.endpoints.endpoint")}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("developers.endpoints.description")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {endpoints.map((endpoint, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          endpoint.method === "GET"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : endpoint.method === "POST"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : endpoint.method === "PUT"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm whitespace-nowrap">{endpoint.path}</td>
                    <td className="px-6 py-4">
                      {/** @ts-expect-error */}
                      <p className="text-gray-600">{t(`developers.endpoints.descriptions.${endpoint.description}`)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("developers.security.title")}</h2>

          <Tabs defaultValue="auth" className="mx-auto max-w-3xl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auth">{t("developers.security.tabs.auth")}</TabsTrigger>
              <TabsTrigger value="encryption">{t("developers.security.tabs.encryption")}</TabsTrigger>
              <TabsTrigger value="ip">{t("developers.security.tabs.ip")}</TabsTrigger>
            </TabsList>
            <TabsContent value="auth" className="rounded-b-lg border bg-gray-50 p-4">
              <h3 className="mb-2 font-bold">{t("developers.security.auth.title")}</h3>
              <p className="text-gray-600">{t("developers.security.auth.description")}</p>
              <pre className="mt-4 overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">
                <code>{`// Example API request with authentication
fetch('https://api.fujipay.com/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({ /* payment details */ })
})`}</code>
              </pre>
            </TabsContent>
            <TabsContent value="encryption" className="rounded-b-lg border bg-gray-50 p-4">
              <h3 className="mb-2 font-bold">{t("developers.security.encryption.title")}</h3>
              <p className="text-gray-600">{t("developers.security.encryption.description")}</p>
            </TabsContent>
            <TabsContent value="ip" className="rounded-b-lg border bg-gray-50 p-4">
              <h3 className="mb-2 font-bold">{t("developers.security.ip.title")}</h3>
              <p className="text-gray-600">{t("developers.security.ip.description")}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="mb-6 text-2xl font-bold">{t("developers.cta.title")}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600">{t("developers.cta.description")}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button className="bg-violet-600 hover:bg-violet-700">{t("developers.cta.primary")}</Button>
            <Button variant="outline" className="border-primary text-violet-700 hover:bg-violet-50">
              {t("developers.cta.secondary")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/developers")({
  component: DevelopersPage,
})
