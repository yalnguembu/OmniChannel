import { useNavigate, useParams } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Edit, ArrowLeft, Loader2, Verified, User, Link, MapPin, Mail, PhoneCall } from "lucide-react"
import { useCompanyDetail } from "../hooks/useCompanyDetail"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { ListPageLayout, StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { useTranslation } from "react-i18next"
import TemplateWebLogo from "@/assets/images/logo/icon.png"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"

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

  const { company: companyDetails, isLoading: isPending, isError } = useCompanyDetail(id)
  const { t } = useTranslation()

  const handleEdit = () => {
    navigate({ to: `/companies/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: `/companies` })
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
          <Card className="grid lg:grid-cols-3 gap-2 mt-4 gap-y-4">
            <CardHeader className="flex items-center">
              <div className="w-24 h-24 rounded-lg block bg-muted">
                <img src={/*companyDetails. || */ TemplateWebLogo} alt="" className="w-full h-full object-contain object-center rounded-lg" />
              </div>
              <div className="flex flex-col gap-y-1">
                {companyDetails.isVerified && (
                  <div className="">
                    <StatusBadge Icon={Verified} theme={BadgeStyles.BLUE} text={t("companies.fields.isVerified")} />
                  </div>
                )}
                <CardTitle className="text-primary text-2xl mb-1 flex gap-x-2">
                  <span className="capitalize">{companyDetails.name}</span>
                </CardTitle>
                <CardDescription className="text-blue-400 hover:text-blue-600 flex gap-x-2">
                  <Link className="h-4 w-4" />
                  <a href={companyDetails.website || ""} className="link hover:underline" target="_blank" rel="noopener noreferrer">
                    {companyDetails.website || "https://templateweb.com"}
                  </a>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="lg:col-span-2 grid lg:grid-cols-3 gap-2 mt-4 gap-y-4">
              <div className="flex flex-col gap-y-1 text-muted-foreground/80">
                <div className="flex gap-x-1.5 lg:text-md">
                  <span className="font-semibold">{t("companies.fields.name")} :</span>
                  <span className="text-primary">{companyDetails.name}</span>
                </div>
                <div className="flex gap-x-1.5">
                  <span className="font-semibold">{t("companies.fields.companyType")} :</span>
                  <span className="">{companyDetails.companyType}</span>
                </div>
                <div className="flex gap-x-1.5">
                  <span className="font-semibold">{t("companies.fields.companySize")} :</span>
                  <span className="">{companyDetails.companySize}</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusBadge theme={BadgeStyles.GREEN} text={companyDetails.status ?? ""} />
                </div>
              </div>
              <div className="flex flex-col gap-y-1 text-muted-foreground/80">
                <span className="font-semibold">
                  <User className="inline size-4 mr-1" /> {companyDetails.contactPerson}
                </span>

                <span className="font-light">
                  <MapPin className="inline size-4 mr-1" />
                  {companyDetails.address}
                </span>
                <span>
                  <Mail className="inline size-4 mr-1" /> {companyDetails.email}
                </span>
                <span>
                  <PhoneCall className="inline size-4 mr-1" />
                  {companyDetails.phoneNumber}
                </span>
              </div>
              <div className="flex flex-col gap-y-1 text-muted-foreground/80">
                <div className="flex gap-x-1.5 lg:text-md">
                  <span className="font-semibold">{t("companies.fields.countryName")} :</span>
                  <span>{companyDetails.name}</span>
                </div>
                <div className="flex gap-x-1.5 lg:text-md">
                  <span className="font-semibold">{t("companies.fields.businessRegistrationNumber")} :</span>
                  <span>{companyDetails.businessRegistrationNumber}</span>
                </div>
                <div className="flex gap-x-1.5 lg:text-md">
                  <span className="font-semibold">{t("companies.fields.taxNumber")} :</span>
                  <span>{companyDetails.taxNumber}</span>
                </div>
                <div className="flex gap-x-1.5 lg:text-md">
                  <span className="font-semibold">{t("companies.fields.website")} :</span>
                  <span>{companyDetails.website}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  )
}
